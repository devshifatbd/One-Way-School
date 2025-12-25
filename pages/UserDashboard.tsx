
import React, { useState, useEffect, useRef } from 'react';
import { User, EcosystemApplication, Affiliate, JobInterest, ClassSession, WithdrawalRequest, AmbassadorTask, CommunityMeeting } from '../types';
import { 
    updateUserProfile, getUserApplications, uploadProfileImage, 
    logout, getClassSessions, getResources, getNoticesHistory, getUserJobInterests, 
    sendVerificationEmail, saveWithdrawalRequest, getAmbassadorTasks, getCommunityMeetings, getWithdrawalRequests,
    getCommunityMemberByPhone,
    auth
} from '../services/firebase';
import { 
    LayoutDashboard, BookOpen, FileText, CreditCard, 
    LogOut, Edit3, MapPin, Phone, Video, Download, 
    User as UserIcon, Calendar, Megaphone, CheckSquare, 
    Award, TrendingUp, AlertCircle, Briefcase, DollarSign,
    Menu, X, CheckCircle, Clock, ShieldAlert,
    Send, Database, Users, Banknote, Home, UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface UserDashboardProps {
    user: User | null;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
    const navigate = useNavigate();
    
    // --- State Management ---
    const [loading, setLoading] = useState(true);
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false); // Controls modal visibility
    
    // Data States
    const [ecosystemData, setEcosystemData] = useState<EcosystemApplication | null>(null);
    const [affiliateData, setAffiliateData] = useState<Affiliate | null>(null);
    const [jobInterests, setJobInterests] = useState<JobInterest[]>([]);
    
    // Feature Data (Ecosystem)
    const [classRoutine, setClassRoutine] = useState<ClassSession[]>([]);
    const [resources, setResources] = useState<any[]>([]);
    const [notices, setNotices] = useState<any[]>([]);

    // Feature Data (Affiliate)
    const [tasks, setTasks] = useState<AmbassadorTask[]>([]);
    const [meetings, setMeetings] = useState<CommunityMeeting[]>([]);
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);

    // Certificate
    const [certificateMember, setCertificateMember] = useState<any>(null);
    const [certLoading, setCertLoading] = useState(false);
    const certificateRef = useRef<HTMLDivElement>(null);
    const [previewMember, setPreviewMember] = useState<any>(null);

    // Navigation & UI
    const [activeTab, setActiveTab] = useState(''); 
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    
    // Forms
    const [profileForm, setProfileForm] = useState<Partial<User>>({});
    const [withdrawForm, setWithdrawForm] = useState({ amount: '', method: 'Bkash', accountNumber: '' });

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        checkProfileCompletion();
        fetchDashboardData();
    }, [user]);

    // 1. Mandatory Profile Check
    const checkProfileCompletion = () => {
        if (user && user.phone && user.profession) {
            if (user.profession === 'Student' && (!user.institution || !user.department)) {
                setIsProfileComplete(false);
                setShowProfileModal(true);
            } else {
                setIsProfileComplete(true);
                setShowProfileModal(false);
            }
        } else {
            setIsProfileComplete(false);
            setShowProfileModal(true);
            // Pre-fill form
            setProfileForm({
                displayName: user?.displayName || '',
                phone: user?.phone || '',
                profession: user?.profession || 'Student',
                institution: user?.institution || '',
                department: user?.department || '',
                studentClass: user?.studentClass || '',
                companyName: user?.companyName || '',
                designation: user?.designation || '',
                goal: user?.goal || ''
            });
        }
    };

    // 2. Fetch User Data based on roles
    const fetchDashboardData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Check for certificate eligibility
            if (user.phone) {
                const member = await getCommunityMemberByPhone(user.phone);
                if (member) setCertificateMember(member);
            }

            // Get Applications status
            const apps = await getUserApplications(user.uid);
            
            const ecoApp = apps.find(a => a.type === 'Ecosystem Program') as EcosystemApplication;
            const affApp = apps.find(a => a.type === 'Affiliate' || a.type === 'Campus Ambassador') as Affiliate;
            
            setEcosystemData(ecoApp || null);
            setAffiliateData(affApp || null);

            // Fetch Job Interests
            const interests = await getUserJobInterests(user.uid);
            setJobInterests(interests as JobInterest[]);

            // Set Initial Active Tab Logic
            // If approved Ecosystem student -> Go to Ecosystem Dash directly (No Overview)
            if (!activeTab) {
                if (ecoApp && ecoApp.status === 'approved') {
                    setActiveTab('ecosystem_dashboard');
                } else if (affApp && (affApp.status === 'approved' || affApp.status === 'alumni')) {
                    setActiveTab('affiliate_dashboard');
                } else {
                    setActiveTab('overview');
                }
            }

            // --- ECOSYSTEM FEATURES ---
            if (ecoApp && ecoApp.status === 'approved') {
                const [sessions, resList, noticeList] = await Promise.all([
                    getClassSessions(),
                    getResources(),
                    getNoticesHistory()
                ]);
                
                // Filter routine by batch
                setClassRoutine(sessions.filter((s: any) => s.batch === ecoApp.batch) as ClassSession[]);
                setResources(resList);
                // Combine personal notices + batch notices
                const batchNotices = noticeList.filter((n: any) => n.targetBatch === 'All' || n.targetBatch === ecoApp.batch);
                setNotices([...(ecoApp.notices || []), ...batchNotices]);
            }

            // --- AFFILIATE FEATURES ---
            if (affApp && (affApp.status === 'approved' || affApp.status === 'alumni')) {
                const [taskList, meetingList, withdrawList] = await Promise.all([
                    getAmbassadorTasks(),
                    getCommunityMeetings(),
                    getWithdrawalRequests()
                ]);
                
                const myTasks = taskList.filter((t: any) => t.assignedTo === 'All' || t.assignedTo.includes(affApp.type === 'Affiliate' ? 'Affiliate' : 'Ambassador'));
                const myMeetings = meetingList.filter((m: any) => m.assignedTo === 'All' || m.assignedTo.includes(affApp.type === 'Affiliate' ? 'Affiliates' : 'Ambassadors'));
                const myWithdrawals = withdrawList.filter((w: any) => w.userId === user.uid);

                setTasks(myTasks as AmbassadorTask[]);
                setMeetings(myMeetings as CommunityMeeting[]);
                setWithdrawals(myWithdrawals as WithdrawalRequest[]);
            }

        } catch (e) { console.error(e); }
        setLoading(false);
    };

    // Profile Save Handler
    const handleCompleteProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        try {
            const cleanData = JSON.parse(JSON.stringify(profileForm));
            await updateUserProfile(user.uid, cleanData);
            alert("Profile Updated Successfully!");
            
            // Immediate State Update to remove modal without reload
            setIsProfileComplete(true);
            setShowProfileModal(false);
            
            // Refresh Data in background
            fetchDashboardData();
        } catch (e) {
            console.error(e);
            alert("Update failed. Please check your internet connection.");
        }
    };

    const generateCertificate = async () => {
        if(!certificateMember) return;
        setCertLoading(true);
        
        // Prepare data for the hidden template
        setPreviewMember({
            ...certificateMember,
            nameForCert: certificateMember.name, 
            issueDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        });

        // Wait for render
        setTimeout(async () => {
            const element = certificateRef.current;
            if (element) {
                try {
                    const canvas = await html2canvas(element, {
                        scale: 2,
                        useCORS: true,
                        allowTaint: false, 
                        backgroundColor: '#ffffff',
                        width: 1123,
                        height: 794,
                        logging: false,
                        scrollX: 0,
                        scrollY: 0,
                        windowWidth: 1123,
                        windowHeight: 794
                    });

                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF({
                        orientation: 'landscape',
                        unit: 'px',
                        format: [1123, 794] 
                    });

                    pdf.addImage(imgData, 'PNG', 0, 0, 1123, 794);
                    pdf.save(`OWS_Certificate_${certificateMember.name}.pdf`);
                } catch (e: any) {
                    console.error("Certificate Gen Error:", e);
                    alert("সার্টিফিকেট ডাউনলোড করতে সমস্যা হয়েছে।");
                }
            }
            setCertLoading(false);
            setPreviewMember(null); 
        }, 2000);
    };

    const handleSendVerification = async () => {
        if(auth.currentUser) {
            await sendVerificationEmail(auth.currentUser);
            alert("Verification link sent to your email!");
        }
    };

    const handleSubmitWithdrawal = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!user || !affiliateData) return;
        
        const amount = Number(withdrawForm.amount);
        if(amount < 500) { alert("Minimum withdrawal amount is 500 BDT"); return; }
        if(amount > affiliateData.balance) { alert("Insufficient balance!"); return; }

        try {
            await saveWithdrawalRequest({
                userId: user.uid,
                userName: user.displayName,
                amount: amount,
                method: withdrawForm.method,
                accountNumber: withdrawForm.accountNumber,
                status: 'pending',
                requestDate: new Date()
            });
            alert("Withdrawal Request Submitted!");
            setIsWithdrawModalOpen(false);
            fetchDashboardData();
        } catch(e) { console.error(e); }
    };

    const openEditProfile = () => {
        setProfileForm({
            displayName: user?.displayName || '',
            phone: user?.phone || '',
            profession: user?.profession || 'Student',
            institution: user?.institution || '',
            department: user?.department || '',
            studentClass: user?.studentClass || '',
            companyName: user?.companyName || '',
            designation: user?.designation || '',
            goal: user?.goal || ''
        });
        setShowProfileModal(true);
    };

    // --- Render Logic ---

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

    // --- Profile Modal (Mandatory or Edit) ---
    if (showProfileModal) {
        return (
            <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center p-4 z-50 font-['Hind_Siliguri'] overflow-y-auto">
                <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl my-auto relative">
                    {isProfileComplete && (
                        <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
                            <X size={24}/>
                        </button>
                    )}
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                            <UserIcon size={32}/>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            {isProfileComplete ? 'প্রোফাইল এডিট করুন' : 'প্রোফাইল আপডেট করুন'}
                        </h2>
                        <p className="text-slate-500 text-sm mt-2">সঠিক তথ্য দিয়ে আপনার প্রোফাইলটি সম্পূর্ণ করুন।</p>
                    </div>

                    <form onSubmit={handleCompleteProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">আপনার নাম</label>
                            <input required value={profileForm.displayName || ''} onChange={e=>setProfileForm({...profileForm, displayName: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900" placeholder="Full Name"/>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">মোবাইল নম্বর</label>
                            <input required value={profileForm.phone || ''} onChange={e=>setProfileForm({...profileForm, phone: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900" placeholder="017..."/>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">পেশা (Profession)</label>
                            <select value={profileForm.profession} onChange={e=>setProfileForm({...profileForm, profession: e.target.value as any})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900">
                                <option value="Student">Student</option>
                                <option value="Job Holder">Job Holder</option>
                                <option value="Unemployed">Unemployed / Looking for Job</option>
                                <option value="Business">Business</option>
                            </select>
                        </div>

                        {/* Conditional Fields */}
                        {profileForm.profession === 'Student' && (
                            <>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">শিক্ষা প্রতিষ্ঠান</label>
                                    <input required value={profileForm.institution || ''} onChange={e=>setProfileForm({...profileForm, institution: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900" placeholder="University/College Name"/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">ডিপার্টমেন্ট</label>
                                        <input required value={profileForm.department || ''} onChange={e=>setProfileForm({...profileForm, department: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900" placeholder="CSE, BBA..."/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">সেমিস্টার/বর্ষ</label>
                                        <input required value={profileForm.studentClass || ''} onChange={e=>setProfileForm({...profileForm, studentClass: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900" placeholder="Year/Semester"/>
                                    </div>
                                </div>
                            </>
                        )}

                        {profileForm.profession === 'Job Holder' && (
                            <>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">কোম্পানির নাম</label>
                                    <input required value={profileForm.companyName || ''} onChange={e=>setProfileForm({...profileForm, companyName: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900" placeholder="Company Name"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">পদবী (Designation)</label>
                                    <input required value={profileForm.designation || ''} onChange={e=>setProfileForm({...profileForm, designation: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900" placeholder="Software Engineer..."/>
                                </div>
                            </>
                        )}

                        {(profileForm.profession === 'Unemployed' || profileForm.profession === 'Business') && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">আপনার লক্ষ্য (Career Goal)</label>
                                <input required value={profileForm.goal || ''} onChange={e=>setProfileForm({...profileForm, goal: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900" placeholder="Ex: Software Developer, Entrepreneur..."/>
                            </div>
                        )}

                        <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">
                            {isProfileComplete ? 'আপডেট করুন' : 'Save & Continue'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // --- MAIN DASHBOARD UI ---
    const isEcosystemStudent = ecosystemData?.status === 'approved';

    const getMenuItems = () => {
        const items = [];

        // HIDE OVERVIEW FOR ECOSYSTEM STUDENTS
        if (!isEcosystemStudent) {
            items.push({ id: 'overview', label: 'Overview', icon: LayoutDashboard });
        }

        if (ecosystemData) {
            items.push({ id: 'ecosystem_dashboard', label: 'Ecosystem', icon: Award });
        }
        if (affiliateData) {
            items.push({ id: 'affiliate_dashboard', label: 'Affiliate', icon: TrendingUp });
        }

        items.push({ id: 'jobs', label: 'Jobs', icon: Briefcase });

        return items;
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                if (isEcosystemStudent) return null; // Should not reach here typically
                return (
                    <div className="space-y-6 animate-fade-in">
                        {/* Welcome Banner */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">স্বাগতম, {user?.displayName}! 👋</h1>
                                    <p className="text-blue-100 opacity-90">{user?.profession} | {user?.phone}</p>
                                    
                                    <button onClick={openEditProfile} className="mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-lg text-sm font-bold backdrop-blur-sm transition flex items-center gap-2 border border-white/30">
                                        <Edit3 size={14}/> Edit Profile
                                    </button>

                                    {!auth.currentUser?.emailVerified && (
                                        <div className="mt-2 inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-400/30 px-3 py-1.5 rounded-lg text-yellow-200 text-sm">
                                            <AlertCircle size={16}/> ইমেইল ভেরিফাইড নয় 
                                            <button onClick={handleSendVerification} className="underline font-bold hover:text-white ml-1">ভেরিফাই করুন</button>
                                        </div>
                                    )}
                                </div>
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30 text-2xl font-bold">
                                    {user?.displayName?.charAt(0)}
                                </div>
                            </div>
                        </div>

                        {/* Certificate Card (If Matched) */}
                        {certificateMember && (
                            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-xl font-bold flex items-center gap-2 mb-2"><Award className="text-yellow-400"/> Verified Community Member</h3>
                                    <p className="text-slate-400 text-sm">Role: {certificateMember.role} | {certificateMember.category}</p>
                                </div>
                                <button 
                                    onClick={generateCertificate}
                                    disabled={certLoading}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 disabled:opacity-70"
                                >
                                    {certLoading ? 'Generating...' : <><Download size={18}/> Download Certificate</>}
                                </button>
                            </div>
                        )}

                        {/* Status Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Ecosystem Card */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Award className="text-blue-600"/> ইকোসিস্টেম মেম্বারশিপ</h3>
                                {ecosystemData ? (
                                    <div className="text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase ${ecosystemData.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {ecosystemData.status}
                                        </span>
                                        {ecosystemData.status === 'approved' && (
                                            <p className="mt-3 text-sm text-slate-500">Batch: <span className="font-bold text-slate-800">{ecosystemData.batch || 'Not Assigned'}</span></p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-slate-400 text-sm mb-4">আপনি এখনো মেম্বার হননি</p>
                                        <button onClick={()=>navigate('/ecosystem')} className="text-blue-600 font-bold text-sm hover:underline">Apply Now</button>
                                    </div>
                                )}
                            </div>

                            {/* Job Interest Card */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Briefcase className="text-purple-600"/> জবের আগ্রহ</h3>
                                <div className="text-center">
                                    <h2 className="text-4xl font-bold text-slate-800">{jobInterests.length}</h2>
                                    <p className="text-slate-500 text-xs mt-1">টি জবে ক্লিক করেছেন</p>
                                </div>
                            </div>

                            {/* Affiliate Card */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp className="text-green-600"/> পার্টনারশিপ</h3>
                                {affiliateData ? (
                                    <div className="text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase ${affiliateData.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {affiliateData.type} ({affiliateData.status})
                                        </span>
                                        {affiliateData.status === 'approved' && (
                                            <p className="mt-3 text-lg font-bold text-green-600">Earned: ৳{affiliateData.totalEarnings}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-slate-400 text-sm mb-4">জয়েন করুন এফিলিয়েট বা এম্বাসেডর হিসেবে</p>
                                        <button onClick={()=>navigate('/community')} className="text-blue-600 font-bold text-sm hover:underline">Join Program</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'ecosystem_dashboard':
                if (!ecosystemData) return <div className="text-center py-20">No ecosystem data.</div>;
                if (ecosystemData.status !== 'approved') {
                    return (
                        <div className="flex flex-col items-center justify-center h-full py-20 bg-white rounded-3xl border border-slate-100 animate-fade-in">
                            <Clock size={40} className="text-orange-500 mb-4"/>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">পেন্ডিং আছে</h2>
                            <p className="text-slate-500 text-center">আপনার আবেদন যাচাই করা হচ্ছে।</p>
                        </div>
                    );
                }

                return (
                    <div className="space-y-8 animate-fade-in">
                        {/* 1. Profile & Membership Card */}
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Membership Card (Visual) */}
                            <div className="relative h-64 bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl shadow-2xl overflow-hidden text-white p-6 flex flex-col justify-between border border-blue-500/30">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
                                
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <img src="https://iili.io/f3k62rG.md.png" alt="OWS" className="h-8 object-contain brightness-0 invert"/>
                                        <p className="text-[10px] text-blue-200 mt-1 uppercase tracking-widest">Ecosystem Member</p>
                                    </div>
                                    <img src="https://iili.io/f3evPnf.md.png" className="h-10 opacity-50 grayscale" alt="chip"/>
                                </div>

                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-16 h-16 rounded-full border-2 border-blue-400 p-0.5 bg-slate-800">
                                        <img src={user?.photoURL || "https://iili.io/KFXRLiv.md.png"} className="w-full h-full rounded-full object-cover"/>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold uppercase tracking-wide">{user?.displayName}</h3>
                                        <p className="text-xs text-blue-200">ID: {ecosystemData.studentId || 'PENDING'}</p>
                                        <p className="text-xs text-blue-200">Batch: {ecosystemData.batch || 'Unassigned'}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end relative z-10">
                                    <div>
                                        <p className="text-[8px] text-slate-400 uppercase">Valid Thru</p>
                                        <p className="text-sm font-mono">LIFETIME</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] text-slate-400 uppercase">Phase</p>
                                        <p className="text-sm font-bold text-blue-400">{ecosystemData.currentPhase}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment & Attendance Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center">
                                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2"><DollarSign size={20}/></div>
                                    <p className="text-xs text-slate-500 uppercase font-bold">Total Paid</p>
                                    <h3 className="text-2xl font-bold text-slate-800">৳{ecosystemData.totalPaid || 0}</h3>
                                </div>
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center">
                                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2"><AlertCircle size={20}/></div>
                                    <p className="text-xs text-slate-500 uppercase font-bold">Due Amount</p>
                                    <h3 className="text-2xl font-bold text-red-500">৳{ecosystemData.dueAmount || 0}</h3>
                                </div>
                                <div className="col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-slate-700 flex items-center gap-2"><CheckSquare size={16}/> Attendance</h4>
                                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{ecosystemData.scores?.attendance || 0}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${ecosystemData.scores?.attendance || 0}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Performance Scores */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Award className="text-purple-600"/> Performance Scores</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {Object.entries(ecosystemData.scores || {}).filter(([k]) => k !== 'attendance').map(([key, score]) => (
                                    <div key={key} className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">{key}</div>
                                        <div className="text-xl font-bold text-slate-800">{score}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Class Routine & Notices & Resources */}
                        <div className="grid lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Calendar className="text-blue-600"/> Class Routine</h3>
                                {classRoutine.length > 0 ? (
                                    <div className="space-y-3">
                                        {classRoutine.map((cls, i) => (
                                            <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                                <div>
                                                    <p className="font-bold text-slate-700 text-sm">{cls.topic}</p>
                                                    <p className="text-xs text-slate-500">{cls.date} | {cls.time}</p>
                                                </div>
                                                <a href={cls.link} target="_blank" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Join</a>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-slate-400 text-center py-6">No classes scheduled.</p>}
                            </div>

                            <div className="space-y-8">
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Megaphone className="text-orange-600"/> Notices</h3>
                                    {notices.length > 0 ? (
                                        <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                                            {notices.map((n, i) => (
                                                <div key={i} className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                                                    <h5 className="font-bold text-orange-800 text-sm">{n.title}</h5>
                                                    <p className="text-xs text-orange-700 mt-1">{n.message}</p>
                                                    <span className="text-[10px] text-orange-400 mt-2 block">{n.createdAt ? new Date(n.createdAt.seconds*1000).toLocaleDateString() : 'Recent'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-slate-400 text-center py-6">No notices.</p>}
                                </div>

                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><BookOpen className="text-green-600"/> Resources</h3>
                                    {resources.length > 0 ? (
                                        <div className="space-y-3">
                                            {resources.map((res, i) => (
                                                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                                    <div className="flex items-center gap-2">
                                                        <FileText size={16} className="text-green-600"/>
                                                        <span className="text-sm font-bold text-slate-700">{res.title}</span>
                                                    </div>
                                                    <a href={res.link} target="_blank" className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-full"><Download size={16}/></a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-slate-400 text-center py-6">No resources found.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'affiliate_dashboard':
                // ... (Existing Affiliate Dashboard Content - no changes needed here) ...
                return (
                    <div className="space-y-8 animate-fade-in">
                        {/* 1. Earnings & Withdraw */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 bg-gradient-to-r from-green-600 to-emerald-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-green-100 text-sm font-bold uppercase mb-1">Available Balance</p>
                                    <h2 className="text-5xl font-bold mb-6">৳{affiliateData?.balance || 0}</h2>
                                    <div className="flex gap-4">
                                        <button onClick={() => setIsWithdrawModalOpen(true)} className="bg-white text-green-700 px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-green-50 transition flex items-center gap-2">
                                            <Banknote size={18}/> Withdraw Money
                                        </button>
                                        <div className="flex flex-col justify-center">
                                            <span className="text-xs text-green-100">Total Earned: ৳{affiliateData?.totalEarnings}</span>
                                        </div>
                                    </div>
                                </div>
                                <DollarSign size={200} className="absolute -bottom-10 -right-10 text-white opacity-10 rotate-12"/>
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center text-center">
                                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 font-bold text-2xl">
                                    {affiliateData?.referralCount || 0}
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg">Total Referrals</h3>
                                <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                    <p className="text-xs text-slate-500 mb-1">Your Referral Code</p>
                                    <p className="text-xl font-mono font-bold text-blue-600 tracking-widest">{affiliateData?.referralCode}</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Tasks & Meetings */}
                        <div className="grid lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><CheckSquare className="text-purple-600"/> Assigned Tasks</h3>
                                {tasks.length > 0 ? (
                                    <div className="space-y-4">
                                        {tasks.map((task, i) => (
                                            <div key={i} className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h5 className="font-bold text-purple-800">{task.title}</h5>
                                                    <span className="bg-white text-purple-600 px-2 py-0.5 rounded text-xs font-bold border border-purple-200">{task.points} Pts</span>
                                                </div>
                                                <p className="text-sm text-purple-700 mb-3">{task.description}</p>
                                                <div className="flex justify-between items-center text-xs text-purple-500 font-bold">
                                                    <span>Due: {task.deadline}</span>
                                                    {task.link && <a href={task.link} target="_blank" className="underline">Details Link</a>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-slate-400 text-center py-6">No active tasks.</p>}
                            </div>

                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Video className="text-blue-600"/> Upcoming Meetings</h3>
                                {meetings.length > 0 ? (
                                    <div className="space-y-3">
                                        {meetings.map((m, i) => (
                                            <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                                                <div>
                                                    <h5 className="font-bold text-slate-700">{m.title}</h5>
                                                    <p className="text-xs text-slate-500 mt-1">{m.date} at {m.time} ({m.platform})</p>
                                                </div>
                                                <a href={m.link} target="_blank" className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-100">Join</a>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-slate-400 text-center py-6">No meetings scheduled.</p>}
                            </div>
                        </div>

                        {/* 3. Withdrawal History */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-6">Withdrawal History</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500">
                                        <tr>
                                            <th className="p-3 rounded-l-lg">Date</th>
                                            <th className="p-3">Amount</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3 rounded-r-lg">Method</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {withdrawals.map((w, i) => (
                                            <tr key={i} className="border-b border-slate-50">
                                                <td className="p-3">{w.requestDate ? new Date(w.requestDate.seconds*1000).toLocaleDateString() : 'N/A'}</td>
                                                <td className="p-3 font-bold text-slate-700">৳{w.amount}</td>
                                                <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${w.status==='paid'?'bg-green-100 text-green-600':'bg-yellow-100 text-yellow-600'}`}>{w.status}</span></td>
                                                <td className="p-3 text-xs">{w.method} ({w.accountNumber})</td>
                                            </tr>
                                        ))}
                                        {withdrawals.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-slate-400">No history found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            case 'jobs':
                // ... (Existing Jobs Content) ...
                return (
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-fade-in">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-xl"><Briefcase className="text-purple-600"/> অ্যাপ্লাইড / ভিউড জবস</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 uppercase">
                                    <tr>
                                        <th className="p-4 rounded-l-xl">Job Title</th>
                                        <th className="p-4">Viewed Date</th>
                                        <th className="p-4 rounded-r-xl text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobInterests.map((job, idx) => (
                                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50">
                                            <td className="p-4 font-bold text-slate-700">{job.jobTitle}</td>
                                            <td className="p-4 text-slate-500">{new Date(job.clickedAt.seconds * 1000).toLocaleDateString()}</td>
                                            <td className="p-4 text-right"><span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">Viewed Details</span></td>
                                        </tr>
                                    ))}
                                    {jobInterests.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-slate-400">কোনো জবের বিস্তারিত দেখা হয়নি।</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            default:
                return <div>Select a tab</div>;
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F4F7FE] font-['Hind_Siliguri'] overflow-hidden">
            {/* Sidebar (Desktop) */}
            <aside className="hidden lg:flex w-72 bg-white flex-col border-r border-slate-100 h-screen fixed overflow-y-auto z-20">
                <div className="p-8 pb-4">
                    <img src="https://iili.io/f3k62rG.md.png" alt="OWS Logo" className="h-10 object-contain cursor-pointer" onClick={()=>navigate('/')} />
                </div>
                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {getMenuItems().map((item) => (
                        <button 
                            key={item.id} 
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl transition-all font-bold text-sm ${activeTab === item.id ? 'bg-[#2B3674] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                        >
                            <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-slate-400'}/>
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="p-6 border-t border-slate-100 space-y-2">
                    <button onClick={()=>navigate('/')} className="w-full flex items-center gap-3 px-6 py-3 rounded-xl text-slate-500 hover:bg-slate-50 font-bold text-sm">
                        <Home size={20}/> Home Website
                    </button>
                    <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-6 py-3 rounded-xl text-red-500 hover:bg-red-50 font-bold transition">
                        <LogOut size={20}/> লগআউট
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden w-full fixed top-0 bg-white z-40 border-b border-slate-100 px-4 py-3 flex justify-between items-center shadow-sm">
                <img src="https://iili.io/f3k62rG.md.png" alt="OWS" className="h-8" />
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-slate-50 rounded-lg text-slate-700">
                    {isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-30 bg-white pt-16 px-4 animate-fade-in">
                    <nav className="space-y-2 mt-4">
                        {getMenuItems().map((item) => (
                            <button 
                                key={item.id} 
                                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                                className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl transition-all font-bold text-sm ${activeTab === item.id ? 'bg-[#2B3674] text-white' : 'bg-slate-50 text-slate-600'}`}
                            >
                                <item.icon size={20}/> {item.label}
                            </button>
                        ))}
                        <button onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-6 py-4 rounded-xl text-slate-600 bg-slate-50 font-bold text-sm mt-4 border-t border-slate-100 pt-4">
                            <Home size={20}/> Home Website
                        </button>
                        <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-6 py-4 rounded-xl text-red-500 bg-red-50 font-bold mt-2">
                            <LogOut size={20}/> লগআউট
                        </button>
                    </nav>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-72 p-6 md:p-10 pt-24 lg:pt-10 overflow-y-auto h-screen">
                {renderContent()}
            </main>

            {/* Hidden Certificate Template */}
            <div style={{ position: 'fixed', top: 0, left: '-9999px', width: '1123px', height: '794px', zIndex: -100 }}>
                {previewMember && (
                    <div ref={certificateRef} className="w-[1123px] h-[794px] relative bg-white text-slate-900 font-['Hind_Siliguri'] box-border p-6">
                        {/* (Certificate HTML content kept same as previous) */}
                        <div className="w-full h-full border-[10px] border-[#1E3A8A] p-1 box-border">
                            <div className="w-full h-full border-[2px] border-[#EA580C] p-3 box-border">
                                <div className="w-full h-full border border-[#1E3A8A]/20 relative flex flex-col justify-between py-10 px-16 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-50/50 to-white">
                                    <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-[0.03]">
                                        <img src="https://iili.io/f3k62rG.md.png" className="w-[500px] h-auto grayscale blur-[0.5px]" alt="Watermark" crossOrigin="anonymous" />
                                    </div>
                                    <div className="relative z-20 flex flex-col justify-between h-full">
                                        <div className="w-full flex flex-col items-center text-center mt-4">
                                            <img src="https://iili.io/f3k62rG.md.png" alt="Logo" className="h-20 object-contain mb-6" crossOrigin="anonymous" />
                                            <h1 className="text-5xl font-bold text-[#1E3A8A] uppercase tracking-wide" style={{ fontFamily: 'Poppins, sans-serif' }}>Certificate of Recognition</h1>
                                        </div>
                                        <div className="w-full flex flex-col items-center justify-center text-center">
                                            <p className="text-xl text-slate-500 font-serif italic mb-1">This certificate is proudly presented to</p>
                                            <div className="w-full max-w-4xl relative">
                                                <h2 className="text-6xl font-bold text-slate-900 capitalize leading-tight mb-6" style={{ fontFamily: 'Hind Siliguri, sans-serif' }}>{previewMember.nameForCert}</h2>
                                            </div>
                                            <p className="text-lg text-slate-600 leading-relaxed max-w-4xl font-light text-center px-10">For successfully verified membership and valuable contribution as a <span className="font-bold text-[#EA580C]">Community Member</span> at One Way School. We appreciate your dedication towards personal development and community service.</p>
                                        </div>
                                        <div className="flex justify-center gap-16 w-full items-center mb-4">
                                            <div className="text-center w-40"><p className="text-[#1E3A8A] text-xs uppercase tracking-wider font-bold mb-1">Membership ID</p><p className="text-lg font-mono font-bold text-slate-800">OWS-{previewMember.id ? previewMember.id.slice(0,6).toUpperCase() : 'N/A'}</p></div>
                                            <div className="w-[1px] h-10 bg-[#1E3A8A]/30"></div>
                                            <div className="text-center min-w-[200px]"><p className="text-[#1E3A8A] text-xs uppercase tracking-wider font-bold mb-1">Role / Position</p><div><span className="text-[#1E3A8A] font-bold text-xl">{previewMember.role}</span>{previewMember.category && <span className="block text-sm text-slate-500 font-medium uppercase tracking-wider mt-1">{previewMember.category}</span>}</div></div>
                                            <div className="w-[1px] h-10 bg-[#1E3A8A]/30"></div>
                                            <div className="text-center w-40"><p className="text-[#1E3A8A] text-xs uppercase tracking-wider font-bold mb-1">Issue Date</p><p className="text-lg font-bold text-slate-800">{previewMember.issueDate}</p></div>
                                        </div>
                                        <div className="w-full flex justify-between items-end border-t border-[#1E3A8A]/10 pt-6">
                                            <div className="flex flex-col items-center w-56"><img src="https://iili.io/KB8jgte.md.png" alt="Sig" className="h-12 object-contain mb-2 z-10 filter grayscale opacity-90" crossOrigin="anonymous" /><div className="w-full h-[1px] bg-slate-400 mb-2"></div><p className="font-bold text-slate-800 text-sm">Sifatur Rahman</p><p className="text-[10px] text-slate-500 uppercase tracking-wider">Founder</p></div>
                                            <div className="flex flex-col items-center w-56"><img src="https://iili.io/KB8j4ou.md.png" alt="Sig" className="h-12 object-contain mb-2 z-10 filter grayscale opacity-90" crossOrigin="anonymous" /><div className="w-full h-[1px] bg-slate-400 mb-2"></div><p className="font-bold text-slate-800 text-sm">Faria Hoque</p><p className="text-[10px] text-slate-500 uppercase tracking-wider">Co-Founder</p></div>
                                            <div className="flex flex-col items-center w-56"><img src="https://iili.io/KTuZeGp.png" alt="Sig" className="h-12 object-contain mb-2 z-10 filter grayscale opacity-90" crossOrigin="anonymous" /><div className="w-full h-[1px] bg-slate-400 mb-2"></div><p className="font-bold text-slate-800 text-sm">Dipta Halder</p><p className="text-[10px] text-slate-500 uppercase tracking-wider">Co-Founder</p></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Withdrawal Modal */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    {/* ... (Withdrawal Modal Content - kept same) ... */}
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Request Withdrawal</h3>
                        <form onSubmit={handleSubmitWithdrawal} className="space-y-4">
                            <div><label className="block text-sm font-bold text-slate-600 mb-1">Amount (BDT)</label><input type="number" required className="w-full p-3 border rounded-xl" placeholder="Min 500" value={withdrawForm.amount} onChange={e=>setWithdrawForm({...withdrawForm, amount: e.target.value})}/></div>
                            <div><label className="block text-sm font-bold text-slate-600 mb-1">Method</label><select className="w-full p-3 border rounded-xl bg-white" value={withdrawForm.method} onChange={e=>setWithdrawForm({...withdrawForm, method: e.target.value})}> <option>Bkash</option><option>Nagad</option><option>Bank</option> </select></div>
                            <div><label className="block text-sm font-bold text-slate-600 mb-1">Account Number</label><input required className="w-full p-3 border rounded-xl" placeholder="017..." value={withdrawForm.accountNumber} onChange={e=>setWithdrawForm({...withdrawForm, accountNumber: e.target.value})}/></div>
                            <div className="flex gap-2 pt-2"><button type="button" onClick={()=>setIsWithdrawModalOpen(false)} className="flex-1 py-3 border rounded-xl font-bold text-slate-500">Cancel</button><button type="submit" className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700">Submit</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
