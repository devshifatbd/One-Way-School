
import React, { useState, useEffect, useRef } from 'react';
import { User, EcosystemApplication, Affiliate, ClassSession, WithdrawalRequest, AmbassadorTask, CommunityMeeting, EventRegistration } from '../types';
import { 
    updateUserProfile, getUserApplications, uploadProfileImage, 
    logout, getClassSessions, getResources, getNoticesHistory, 
    sendVerificationEmail, saveWithdrawalRequest, getAmbassadorTasks, getCommunityMeetings, getWithdrawalRequests,
    getCommunityMemberByPhone, getUserRegistrations, updateEcosystemStudent,
    auth
} from '../services/firebase';
import { 
    LayoutDashboard, BookOpen, FileText, CreditCard, 
    LogOut, Edit3, MapPin, Phone, Video, Download, 
    User as UserIcon, Calendar, Megaphone, CheckSquare, 
    Award, TrendingUp, AlertCircle, DollarSign,
    Menu, X, CheckCircle, Clock, ShieldAlert,
    Send, Database, Users, Banknote, Home, UserCheck, Ticket, Copy, Check, ArrowRight, Wallet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface UserDashboardProps {
    user: User | null;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    
    const [ecosystemData, setEcosystemData] = useState<EcosystemApplication | null>(null);
    const [affiliateData, setAffiliateData] = useState<Affiliate | null>(null);
    const [classRoutine, setClassRoutine] = useState<ClassSession[]>([]);
    const [resources, setResources] = useState<any[]>([]);
    const [notices, setNotices] = useState<any[]>([]);
    const [tasks, setTasks] = useState<AmbassadorTask[]>([]);
    const [meetings, setMeetings] = useState<CommunityMeeting[]>([]);
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
    const [myEvents, setMyEvents] = useState<EventRegistration[]>([]);

    const [certificateMember, setCertificateMember] = useState<any>(null);
    const [certLoading, setCertLoading] = useState(false);
    const certificateRef = useRef<HTMLDivElement>(null);
    const [previewMember, setPreviewMember] = useState<any>(null);

    const [activeTab, setActiveTab] = useState(''); 
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isPayDueModalOpen, setIsPayDueModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    
    const [profileForm, setProfileForm] = useState<Partial<User>>({});
    const [withdrawForm, setWithdrawForm] = useState({ amount: '', method: 'Bkash', accountNumber: '' });
    const [duePaymentForm, setDuePaymentForm] = useState({ amount: '', method: 'Bkash', transactionId: '' });

    // Constants for Fee Calculation
    const ADMISSION_FEE = 1500;
    const MODULE_FEE = 2000;

    useEffect(() => {
        if (!user) { navigate('/'); return; }
        checkProfileCompletion();
        fetchDashboardData();
    }, [user]);

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

    const fetchDashboardData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            if (user.phone) {
                const member = await getCommunityMemberByPhone(user.phone);
                if (member) setCertificateMember(member);
            }

            const apps = await getUserApplications(user.uid);
            const ecoApp = apps.find(a => a.type === 'Ecosystem Program') as EcosystemApplication;
            
            // Fetch Affiliate/Ambassador Data
            const affApp = apps.find(a => {
                const t = (a.type || '').toLowerCase();
                return t.includes('affiliate') || t.includes('ambassador');
            }) as Affiliate;
            
            setEcosystemData(ecoApp || null);
            setAffiliateData(affApp || null);

            const eventRegs = await getUserRegistrations(user.uid);
            setMyEvents(eventRegs as EventRegistration[]);

            // Set Default Tab Logic
            if (!activeTab) {
                if (ecoApp && ecoApp.status === 'approved') {
                    setActiveTab('ecosystem_dashboard');
                } else if (affApp && (affApp.status === 'approved' || affApp.status === 'alumni')) {
                    // Show Ambassador tab by default if available, otherwise Affiliate
                    if((affApp.type || '').toLowerCase().includes('ambassador')) {
                        setActiveTab('ambassador_dashboard');
                    } else {
                        setActiveTab('affiliate_dashboard');
                    }
                } else {
                    setActiveTab('overview');
                }
            }

            if (ecoApp && ecoApp.status === 'approved') {
                const [sessions, resList, noticeList] = await Promise.all([getClassSessions(), getResources(), getNoticesHistory()]);
                setClassRoutine(sessions.filter((s: any) => s.batch === ecoApp.batch) as ClassSession[]);
                setResources(resList);
                const batchNotices = noticeList.filter((n: any) => n.targetBatch === 'All' || n.targetBatch === ecoApp.batch);
                setNotices([...(ecoApp.notices || []), ...batchNotices]);
            }

            if (affApp) {
                const [taskList, meetingList, withdrawList] = await Promise.all([getAmbassadorTasks(), getCommunityMeetings(), getWithdrawalRequests()]);
                
                const isAmbassador = (affApp.type || '').toLowerCase().includes('ambassador');
                
                // Logic to fetch tasks for BOTH if user is Ambassador
                setTasks(taskList.filter((t: any) => {
                    const assign = t.assignedTo;
                    if (assign === 'All') return true;
                    if (isAmbassador && (assign === 'Ambassadors' || assign === 'Ambassador')) return true;
                    if (!isAmbassador && (assign === 'Affiliates' || assign === 'Affiliate')) return true;
                    return false;
                }) as AmbassadorTask[]);

                setMeetings(meetingList.filter((m: any) => {
                    const assign = m.assignedTo;
                    if (assign === 'All') return true;
                    if (isAmbassador && (assign === 'Ambassadors' || assign === 'Ambassador' || assign === 'Ambassadors Only')) return true;
                    if (!isAmbassador && (assign === 'Affiliates' || assign === 'Affiliate' || assign === 'Affiliates Only')) return true;
                    return false;
                }) as CommunityMeeting[]);

                setWithdrawals(withdrawList.filter((w: any) => w.userId === user.uid) as WithdrawalRequest[]);
            }

        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleCompleteProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            const cleanData = JSON.parse(JSON.stringify(profileForm));
            await updateUserProfile(user.uid, cleanData);
            alert("Profile Updated Successfully!");
            setIsProfileComplete(true);
            setShowProfileModal(false);
            fetchDashboardData();
        } catch (e) { console.error(e); alert("Update failed."); }
    };

    const generateCertificate = async (memberData: any) => {
        if(!memberData) return;
        setCertLoading(true);
        const isEvent = memberData.eventType || memberData.ticketCode;
        const certText = isEvent 
            ? `For participation and successful completion of <span class="font-bold text-[#EA580C]">${memberData.eventTitle || memberData.category}</span> organized by One Way School.`
            : `For successfully verified membership and valuable contribution as a <span class="font-bold text-[#EA580C]">Community Member</span> at One Way School. We appreciate your dedication towards personal development and community service.`;

        setPreviewMember({ 
            ...memberData, 
            nameForCert: memberData.name || memberData.userName || user?.displayName,
            id: memberData.id || memberData.ticketCode || 'OWS-CERT',
            role: memberData.role || 'Participant',
            category: memberData.category || memberData.eventTitle || 'Community Member', 
            issueDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            customText: certText
        });

        setTimeout(async () => {
            const element = certificateRef.current;
            if (element) {
                try {
                    const canvas = await html2canvas(element, { scale: 2, useCORS: true, allowTaint: false, backgroundColor: '#ffffff', width: 1123, height: 794 });
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1123, 794] });
                    pdf.addImage(imgData, 'PNG', 0, 0, 1123, 794);
                    pdf.save(`OWS_Certificate_${memberData.name || 'User'}.pdf`);
                } catch (e) { alert("Download failed."); }
            }
            setCertLoading(false);
            setPreviewMember(null); 
        }, 2000);
    };

    const handleSubmitWithdrawal = async (e: React.FormEvent) => { e.preventDefault(); if(!user || !affiliateData) return; if(Number(withdrawForm.amount) < 500 || Number(withdrawForm.amount) > affiliateData.balance) { alert("Invalid amount"); return; } await saveWithdrawalRequest({ userId: user.uid, userName: user.displayName, amount: Number(withdrawForm.amount), method: withdrawForm.method, accountNumber: withdrawForm.accountNumber, status: 'pending', requestDate: new Date() }); alert("Request Submitted!"); setIsWithdrawModalOpen(false); fetchDashboardData(); };
    
    const handleSubmitDuePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!user || !ecosystemData) return;
        try {
            const newPaymentInfo = `Due Payment: ${duePaymentForm.amount} Tk via ${duePaymentForm.method} (TrxID: ${duePaymentForm.transactionId})`;
            const updatedDetails = ecosystemData.paymentDetails ? `${ecosystemData.paymentDetails} | ${newPaymentInfo}` : newPaymentInfo;
            
            await updateEcosystemStudent(ecosystemData.id!, {
                paymentDetails: updatedDetails,
            });

            alert("Payment info submitted for verification! Admin will update your balance shortly.");
            setIsPayDueModalOpen(false);
            setDuePaymentForm({ amount: '', method: 'Bkash', transactionId: '' });
        } catch (e) {
            console.error(e);
            alert("Submission failed.");
        }
    };

    const openEditProfile = () => { setProfileForm({ displayName: user?.displayName || '', phone: user?.phone || '', profession: user?.profession || 'Student', institution: user?.institution || '', department: user?.department || '', studentClass: user?.studentClass || '', companyName: user?.companyName || '', designation: user?.designation || '', goal: user?.goal || '' }); setShowProfileModal(true); };
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getDisplayRole = (member: any) => {
        if (!member) return null;
        if (member.role === 'Participant') return <span className="text-[#1E3A8A] font-bold text-xl">Participant</span>;
        
        const simpleCategories = ['Campus Ambassador', 'Volunteer', 'Affiliate'];
        if (member.category && !simpleCategories.includes(member.category)) {
            return (
                <div className="flex flex-col items-center">
                    <span className="text-[#1E3A8A] font-bold text-xl">{member.role}</span>
                    <span className="text-sm text-slate-500 font-medium uppercase tracking-wider mt-1">{member.category}</span>
                </div>
            );
        }
        return <span className="text-[#1E3A8A] font-bold text-xl">{member.role}</span>;
    };

    // --- RENDER MENU ---
    const getMenuItems = () => {
        const items = [];
        items.push({ id: 'overview', label: 'Overview', icon: LayoutDashboard });
        
        if (ecosystemData?.status === 'approved') {
            items.push({ id: 'ecosystem_dashboard', label: 'Ecosystem', icon: Award });
        }
        
        // FIXED LOGIC: Allow BOTH tabs if user is an Ambassador
        if (affiliateData) {
            const type = (affiliateData.type || '').toLowerCase();
            
            // Ambassadors are also Affiliates (they need to withdraw money), so show Affiliate Tab too
            items.push({ id: 'affiliate_dashboard', label: 'Affiliate', icon: TrendingUp });

            if (type.includes('ambassador')) {
                items.push({ id: 'ambassador_dashboard', label: 'Ambassador', icon: Megaphone });
            }
        }
        
        items.push({ id: 'tickets', label: 'My Events', icon: Ticket });
        return items;
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div><h1 className="text-3xl font-bold mb-2">Welcome, {user?.displayName}! 👋</h1><p className="text-blue-100 opacity-90">{user?.profession}</p><button onClick={openEditProfile} className="mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-lg text-sm font-bold backdrop-blur-sm border border-white/30 flex items-center gap-2"><Edit3 size={14}/> Edit Profile</button></div>
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30 text-2xl font-bold">{user?.displayName?.charAt(0)}</div>
                            </div>
                        </div>
                        {certificateMember && <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 text-white flex justify-between items-center"><div><h3 className="text-xl font-bold flex items-center gap-2"><Award className="text-yellow-400"/> Community Member</h3></div><button onClick={()=>generateCertificate(certificateMember)} disabled={certLoading} className="bg-yellow-500 text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2">{certLoading ? '...' : <><Download size={18}/> Certificate</>}</button></div>}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Award className="text-blue-600"/> Membership</h3>{ecosystemData ? <div className="text-center"><span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase ${ecosystemData.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{ecosystemData.status}</span></div> : <div className="text-center"><button onClick={()=>navigate('/ecosystem')} className="text-blue-600 font-bold hover:underline">Apply Now</button></div>}</div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Ticket className="text-orange-600"/> My Events</h3><div className="text-center"><h2 className="text-4xl font-bold text-slate-800">{myEvents.length}</h2></div></div>
                        </div>
                    </div>
                );
            case 'tickets':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Ticket className="text-purple-600"/> My Events & Workshops</h2>
                        {myEvents.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                {myEvents.map(evt => (
                                    <div key={evt.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative group">
                                        <div className={`h-2 w-full ${evt.status === 'approved' ? 'bg-green-500' : evt.status === 'completed' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase">{evt.eventType}</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${evt.status === 'approved' ? 'bg-green-100 text-green-700' : evt.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{evt.status}</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800 mb-2">{evt.eventTitle}</h3>
                                            <p className="text-sm text-slate-500 flex items-center gap-2 mb-4"><Calendar size={14}/> {evt.eventDate}</p>
                                            
                                            {evt.status === 'approved' && (
                                                <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 text-center">
                                                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Ticket Code</p>
                                                    <p className="text-2xl font-mono font-bold text-slate-800">{evt.ticketCode || 'PENDING'}</p>
                                                </div>
                                            )}

                                            {evt.status === 'completed' && (
                                                <div className="mt-4 text-center">
                                                    <button onClick={() => generateCertificate(evt)} disabled={certLoading} className="bg-blue-600 text-white w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-blue-700 transition">
                                                        {certLoading ? 'Processing...' : <><Award size={18}/> Download Certificate</>}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300"><Ticket size={48} className="mx-auto text-slate-300 mb-4"/><p className="text-slate-500">You haven't registered for any events yet.</p></div>}
                    </div>
                );
            case 'ecosystem_dashboard': 
                if (!ecosystemData) return <div className="text-center py-20">Loading Ecosystem...</div>;
                
                // FIXED: Financial Calculations with DB Override
                const currentModule = ecosystemData.currentModule || 1;
                const totalFee = ADMISSION_FEE + (currentModule * MODULE_FEE);
                const totalPaid = ecosystemData.totalPaid || 0;
                
                // If the admin manually set a 'dueAmount' in DB, use it. Otherwise calculate.
                let dueAmount = 0;
                if (ecosystemData.dueAmount !== undefined && ecosystemData.dueAmount !== null) {
                    dueAmount = ecosystemData.dueAmount;
                } else {
                    dueAmount = totalFee - totalPaid;
                }
                const displayDue = dueAmount > 0 ? dueAmount : 0;

                // FIXED: Explicit Score Rendering to match DB keys correctly
                const scores: any = ecosystemData.scores || {};

                return (
                    <div className="space-y-8 animate-fade-in">
                        {/* Redesigned Premium Membership Card with Separate Financial Section */}
                        <div className="bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden text-white border border-slate-800 relative">
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            
                            <div className="grid md:grid-cols-2">
                                {/* Left: Profile */}
                                <div className="p-8 md:p-10 flex flex-col justify-between relative z-10">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-xs font-bold uppercase tracking-wider mb-6 shadow-lg">
                                            <Award size={14} className="fill-white"/> Premium Member
                                        </div>
                                        <h3 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">{user?.displayName}</h3>
                                        <p className="text-slate-400 text-lg mb-6">{ecosystemData.institution || 'Institution N/A'}</p>
                                        
                                        <div className="flex gap-4">
                                            <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-xl min-w-[100px]">
                                                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Student ID</p>
                                                <p className="font-mono text-blue-400 font-bold text-lg">{ecosystemData.studentId || 'PENDING'}</p>
                                            </div>
                                            <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-xl min-w-[100px]">
                                                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Current Batch</p>
                                                <p className="font-mono text-purple-400 font-bold text-lg">{ecosystemData.batch || 'Waiting'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 text-xs text-slate-500 font-mono">
                                        Joined: {ecosystemData.createdAt ? new Date(ecosystemData.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>

                                {/* Right: Financials Section */}
                                <div className="bg-slate-800/30 p-8 md:p-10 border-l border-slate-800 relative z-10 flex flex-col justify-center">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Wallet size={16}/> Financial Status
                                    </h4>
                                    
                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                            <span className="text-slate-400">Current Module ({currentModule}) Fee + Admission</span>
                                            <span className="font-bold">৳{totalFee}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                            <span className="text-slate-400">Total Paid Amount</span>
                                            <span className="font-bold text-green-400">৳{totalPaid}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-slate-300 font-bold">Outstanding Due</span>
                                            <span className={`text-2xl font-bold ${displayDue > 0 ? 'text-red-500' : 'text-slate-500'}`}>৳{displayDue}</span>
                                        </div>
                                    </div>

                                    {displayDue > 0 ? (
                                        <button 
                                            onClick={() => { setDuePaymentForm({...duePaymentForm, amount: displayDue.toString()}); setIsPayDueModalOpen(true); }} 
                                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <CreditCard size={18}/> Pay Due Amount
                                        </button>
                                    ) : (
                                        <div className="w-full bg-green-600/20 text-green-400 font-bold py-3 rounded-xl border border-green-600/30 flex items-center justify-center gap-2">
                                            <CheckCircle size={18}/> All Cleared
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats - Explicit Mapping for Order and Accuracy */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Award className="text-purple-600"/> Scores & Progress</h3>
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Attendance</div>
                                    <div className="text-xl font-bold text-slate-800">{scores.attendance || 0}%</div>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Assignment</div>
                                    <div className="text-xl font-bold text-slate-800">{scores.assignment || 0}</div>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Sales</div>
                                    <div className="text-xl font-bold text-slate-800">{scores.sales || 0}</div>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Networking</div>
                                    <div className="text-xl font-bold text-slate-800">{scores.networking || 0}</div>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Communication</div>
                                    <div className="text-xl font-bold text-slate-800">{scores.communication || 0}</div>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">EQ</div>
                                    <div className="text-xl font-bold text-slate-800">{scores.eq || 0}</div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Routine & Resources */}
                        <div className="grid lg:grid-cols-2 gap-8"><div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"><h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Calendar className="text-blue-600"/> Class Routine</h3>{classRoutine.map((cls, i) => (<div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl mb-2"><div><p className="font-bold text-slate-700 text-sm">{cls.topic}</p><p className="text-xs text-slate-500">{cls.date} | {cls.time}</p></div><a href={cls.link} target="_blank" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Join</a></div>))}</div><div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"><h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><BookOpen className="text-green-600"/> Resources</h3>{resources.map((res, i) => (<div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl mb-2"><div className="flex items-center gap-2"><FileText size={16} className="text-green-600"/><span className="text-sm font-bold text-slate-700">{res.title}</span></div><a href={res.link} target="_blank" className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-full"><Download size={16}/></a></div>))}</div></div>
                        {/* Notices */}
                        {notices.length > 0 && <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Megaphone className="text-orange-500"/> Notices</h3><div className="space-y-3">{notices.map((n, i) => (<div key={i} className="bg-orange-50 border border-orange-100 p-4 rounded-xl"><h5 className="font-bold text-slate-800 text-sm">{n.title}</h5><p className="text-xs text-slate-600 mt-1">{n.message}</p></div>))}</div></div>}
                    </div>
                );
            case 'affiliate_dashboard': 
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 bg-gradient-to-r from-green-600 to-emerald-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-green-100 text-sm font-bold uppercase mb-1">Affiliate Balance</p>
                                    <h2 className="text-5xl font-bold mb-6">৳{affiliateData?.balance || 0}</h2>
                                    <div className="flex gap-4">
                                        <button onClick={() => setIsWithdrawModalOpen(true)} className="bg-white text-green-700 px-6 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:bg-green-50 transition"><Banknote size={18}/> Withdraw</button>
                                        <div className="flex flex-col justify-center"><span className="text-xs text-green-100">Total Earned: ৳{affiliateData?.totalEarnings}</span></div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center text-center">
                                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 font-bold text-2xl">{affiliateData?.referralCount || 0}</div>
                                <h3 className="font-bold text-slate-800 text-lg">Referrals</h3>
                                <div className="mt-4 bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                                    <code className="text-blue-600 font-bold text-sm">{affiliateData?.referralCode}</code>
                                    <button onClick={() => copyToClipboard(affiliateData?.referralCode || '')} className="text-slate-400 hover:text-blue-600"><Copy size={16}/></button>
                                </div>
                                {copied && <span className="text-xs text-green-600 mt-1">Copied!</span>}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4">Withdrawal History</h3>
                            {withdrawals.length > 0 ? (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Date</th><th className="p-3">Amount</th><th className="p-3">Status</th></tr></thead>
                                    <tbody>
                                        {withdrawals.map(w => (
                                            <tr key={w.id} className="border-b"><td className="p-3">{w.requestDate ? new Date(w.requestDate.seconds*1000).toLocaleDateString() : 'N/A'}</td><td className="p-3 font-bold">৳{w.amount}</td><td className="p-3"><span className={`px-2 py-1 rounded text-xs uppercase ${w.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{w.status}</span></td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : <p className="text-slate-400 text-sm">No withdrawals yet.</p>}
                        </div>
                    </div>
                );
            case 'ambassador_dashboard': 
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 rounded-3xl text-white shadow-xl flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                            <div className="relative z-10">
                                <p className="text-purple-200 text-sm font-bold uppercase mb-1">Campus Ambassador</p>
                                <h2 className="text-3xl font-bold">{affiliateData?.institution || 'Unknown Campus'}</h2>
                                <p className="text-sm mt-2 opacity-80">Keep leading and earning rewards!</p>
                            </div>
                            <div className="text-right relative z-10">
                                <p className="text-purple-200 text-xs font-bold uppercase">Reward Points</p>
                                <h2 className="text-5xl font-bold">{affiliateData?.balance || 0}</h2> 
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* TASKS SECTION */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><CheckSquare className="text-blue-600"/> Assigned Tasks</h3>
                                <div className="space-y-4">
                                    {tasks.map(task => (
                                        <div key={task.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative group hover:border-blue-200 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{task.type}</span>
                                                <span className="text-xs text-slate-500">Due: {task.deadline}</span>
                                            </div>
                                            <h4 className="font-bold text-slate-800 mb-1">{task.title}</h4>
                                            <p className="text-sm text-slate-600 mb-3">{task.description}</p>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-green-600 text-sm bg-green-50 px-2 py-1 rounded">{task.points} Points</span>
                                                {task.link && <a href={task.link} target="_blank" className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1">View Details <ArrowRight size={12}/></a>}
                                            </div>
                                        </div>
                                    ))}
                                    {tasks.length === 0 && <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200"><CheckSquare className="mx-auto text-slate-300 mb-2"/><p className="text-slate-400 text-sm">No active tasks assigned.</p></div>}
                                </div>
                            </div>

                            {/* MEETINGS SECTION */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Video className="text-purple-600"/> Upcoming Meetings</h3>
                                <div className="space-y-4">
                                    {meetings.map(meeting => (
                                        <div key={meeting.id} className="flex items-center gap-4 bg-purple-50 p-4 rounded-xl border border-purple-100">
                                            <div className="bg-purple-200 text-purple-700 p-3 rounded-lg"><Calendar size={20}/></div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-800 text-sm">{meeting.title}</h4>
                                                <p className="text-xs text-slate-500 mt-1">{meeting.date} at {meeting.time}</p>
                                            </div>
                                            <a href={meeting.link} target="_blank" className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-700">Join</a>
                                        </div>
                                    ))}
                                    {meetings.length === 0 && <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200"><Video className="mx-auto text-slate-300 mb-2"/><p className="text-slate-400 text-sm">No upcoming meetings.</p></div>}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default: return <div>Select a tab</div>;
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F4F7FE] font-['Hind_Siliguri'] overflow-hidden">
            <aside className="hidden lg:flex w-72 bg-white flex-col border-r border-slate-100 h-screen fixed overflow-y-auto z-20"><div className="p-8 pb-4"><img src="https://iili.io/f3k62rG.md.png" alt="OWS Logo" className="h-10 object-contain cursor-pointer" onClick={()=>navigate('/')} /></div><nav className="flex-1 px-4 space-y-2 mt-4">{getMenuItems().map((item) => (<button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl transition-all font-bold text-sm ${activeTab === item.id ? 'bg-[#2B3674] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}><item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-slate-400'}/> {item.label}</button>))}</nav><div className="p-6 border-t border-slate-100 space-y-2"><button onClick={()=>navigate('/')} className="w-full flex items-center gap-3 px-6 py-3 rounded-xl text-slate-500 hover:bg-slate-50 font-bold text-sm"><Home size={20}/> Home Website</button><button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-6 py-3 rounded-xl text-red-500 hover:bg-red-50 font-bold transition"><LogOut size={20}/> Logout</button></div></aside>
            <main className="flex-1 lg:ml-72 p-6 md:p-10 pt-24 lg:pt-10 overflow-y-auto h-screen">{renderContent()}</main>
            
            {/* Withdraw Modal */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in-up">
                        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-slate-800">Withdraw Request</h3><button onClick={()=>setIsWithdrawModalOpen(false)}><X size={20} className="text-slate-400 hover:text-red-500"/></button></div>
                        <form onSubmit={handleSubmitWithdrawal} className="space-y-4">
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount (Min 500)</label><input type="number" className="w-full p-3 border rounded-xl" value={withdrawForm.amount} onChange={e=>setWithdrawForm({...withdrawForm, amount: e.target.value})} required min="500"/></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Method</label><select className="w-full p-3 border rounded-xl bg-white" value={withdrawForm.method} onChange={e=>setWithdrawForm({...withdrawForm, method: e.target.value})}><option>Bkash</option><option>Nagad</option><option>Bank</option></select></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account Number</label><input className="w-full p-3 border rounded-xl" value={withdrawForm.accountNumber} onChange={e=>setWithdrawForm({...withdrawForm, accountNumber: e.target.value})} required/></div>
                            <button className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition">Submit Request</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Pay Due Modal */}
            {isPayDueModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in-up">
                        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-slate-800">Pay Due Amount</h3><button onClick={()=>setIsPayDueModalOpen(false)}><X size={20} className="text-slate-400 hover:text-red-500"/></button></div>
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-6">
                            <p className="text-slate-600 text-sm text-center mb-2">Please pay <strong className="text-red-600">৳{duePaymentForm.amount}</strong> to the following number:</p>
                            <div className="flex justify-center gap-4">
                                <div className="text-center"><p className="text-xs font-bold text-pink-600">Bkash (Send Money)</p><p className="font-mono font-bold select-all">01954666016</p></div>
                                <div className="text-center"><p className="text-xs font-bold text-orange-600">Nagad (Send Money)</p><p className="font-mono font-bold select-all">01954666016</p></div>
                            </div>
                        </div>
                        <form onSubmit={handleSubmitDuePayment} className="space-y-4">
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount Paid</label><input type="number" className="w-full p-3 border rounded-xl bg-slate-100" value={duePaymentForm.amount} readOnly /></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Method</label><select className="w-full p-3 border rounded-xl bg-white" value={duePaymentForm.method} onChange={e=>setDuePaymentForm({...duePaymentForm, method: e.target.value})}><option>Bkash</option><option>Nagad</option></select></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Transaction ID</label><input required className="w-full p-3 border rounded-xl uppercase font-mono" placeholder="Enter TrxID" value={duePaymentForm.transactionId} onChange={e=>setDuePaymentForm({...duePaymentForm, transactionId: e.target.value})}/></div>
                            <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg">Submit Payment Info</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Profile Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-2xl p-8 relative my-auto shadow-2xl">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Edit3 className="text-blue-600"/> Update Profile</h2>
                        <form onSubmit={handleCompleteProfile} className="grid md:grid-cols-2 gap-6">
                            <div className="col-span-2"><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Full Name</label><input className="w-full p-3 border rounded-xl bg-slate-50" value={profileForm.displayName || ''} onChange={e=>setProfileForm({...profileForm, displayName: e.target.value})} required/></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Phone</label><input className="w-full p-3 border rounded-xl" value={profileForm.phone || ''} onChange={e=>setProfileForm({...profileForm, phone: e.target.value})} required placeholder="017..."/></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Profession</label><select className="w-full p-3 border rounded-xl bg-slate-50" value={profileForm.profession} onChange={e=>setProfileForm({...profileForm, profession: e.target.value as any})}><option value="Student">Student</option><option value="Job Holder">Job Holder</option><option value="Unemployed">Unemployed</option></select></div>
                            {profileForm.profession === 'Student' && (<><div className="col-span-2"><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Institution</label><input className="w-full p-3 border rounded-xl bg-slate-50" value={profileForm.institution || ''} onChange={e=>setProfileForm({...profileForm, institution: e.target.value})} required/></div><div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Department</label><input className="w-full p-3 border rounded-xl bg-slate-50" value={profileForm.department || ''} onChange={e=>setProfileForm({...profileForm, department: e.target.value})} required/></div><div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Semester/Year</label><input className="w-full p-3 border rounded-xl bg-slate-50" value={profileForm.studentClass || ''} onChange={e=>setProfileForm({...profileForm, studentClass: e.target.value})} required/></div></>)}
                            <button className="col-span-2 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition shadow-lg mt-4">Save Profile</button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- HIDDEN CERTIFICATE TEMPLATE (Synchronized with Portal) --- */}
            <div style={{ position: 'fixed', top: 0, left: '-9999px', width: '1123px', height: '794px', zIndex: -100 }}>
                {previewMember && (
                    <div ref={certificateRef} className="w-[1123px] h-[794px] relative bg-white text-slate-900 font-['Hind_Siliguri'] box-border p-6">
                        <div className="w-full h-full border-[10px] border-[#1E3A8A] p-1 box-border">
                            <div className="w-full h-full border-[2px] border-[#EA580C] p-3 box-border">
                                <div className="w-full h-full border border-[#1E3A8A]/20 relative flex flex-col justify-between py-10 px-16 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-50/50 to-white">
                                    {/* Watermark */}
                                    <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-[0.03]">
                                        <img src="https://iili.io/f3k62rG.md.png" className="w-[500px] h-auto grayscale blur-[0.5px]" alt="Watermark" crossOrigin="anonymous" />
                                    </div>
                                    
                                    <div className="relative z-20 flex flex-col justify-between h-full">
                                        <div className="w-full flex flex-col items-center text-center mt-4">
                                            <img src="https://iili.io/f3k62rG.md.png" alt="Logo" className="h-20 object-contain mb-6" crossOrigin="anonymous" />
                                            <h1 className="text-5xl font-bold text-[#1E3A8A] uppercase tracking-wide" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Certificate of Recognition
                                            </h1>
                                        </div>
                                        <div className="w-full flex flex-col items-center justify-center text-center">
                                            <p className="text-xl text-slate-500 font-serif italic mb-1">This certificate is proudly presented to</p>
                                            <div className="w-full max-w-4xl relative">
                                                <h2 className="text-6xl font-bold text-slate-900 capitalize leading-tight mb-6" style={{ fontFamily: 'Hind Siliguri, sans-serif' }}>
                                                    {previewMember.nameForCert}
                                                </h2>
                                            </div>
                                            <p className="text-lg text-slate-600 leading-relaxed max-w-4xl font-light text-center px-10" dangerouslySetInnerHTML={{ __html: previewMember.customText }}>
                                            </p>
                                        </div>
                                        <div className="flex justify-center gap-16 w-full items-center mb-4">
                                            <div className="text-center w-40">
                                                <p className="text-[#1E3A8A] text-xs uppercase tracking-wider font-bold mb-1">ID</p>
                                                <p className="text-lg font-mono font-bold text-slate-800">
                                                    {previewMember.id ? (previewMember.id.length > 8 ? previewMember.id.slice(0,8).toUpperCase() : previewMember.id) : 'N/A'}
                                                </p>
                                            </div>
                                            <div className="w-[1px] h-10 bg-[#1E3A8A]/30"></div>
                                            <div className="text-center min-w-[200px]">
                                                <p className="text-[#1E3A8A] text-xs uppercase tracking-wider font-bold mb-1">Role / Position</p>
                                                <div>
                                                    {getDisplayRole(previewMember)}
                                                </div>
                                            </div>
                                            <div className="w-[1px] h-10 bg-[#1E3A8A]/30"></div>
                                            <div className="text-center w-40">
                                                <p className="text-[#1E3A8A] text-xs uppercase tracking-wider font-bold mb-1">Issue Date</p>
                                                <p className="text-lg font-bold text-slate-800">{previewMember.issueDate}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Signatures */}
                                        <div className="w-full flex justify-between items-end border-t border-[#1E3A8A]/10 pt-6">
                                            <div className="flex flex-col items-center w-56">
                                                <img src="https://iili.io/KB8jgte.md.png" alt="Sig" className="h-12 object-contain mb-2 z-10 filter grayscale opacity-90" crossOrigin="anonymous" />
                                                <div className="w-full h-[1px] bg-slate-400 mb-2"></div>
                                                <p className="font-bold text-slate-800 text-sm">Sifatur Rahman</p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Founder</p>
                                            </div>
                                            <div className="flex flex-col items-center w-56">
                                                <img src="https://iili.io/KB8j4ou.md.png" alt="Sig" className="h-12 object-contain mb-2 z-10 filter grayscale opacity-90" crossOrigin="anonymous" />
                                                <div className="w-full h-[1px] bg-slate-400 mb-2"></div>
                                                <p className="font-bold text-slate-800 text-sm">Faria Hoque</p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Co-Founder</p>
                                            </div>
                                            <div className="flex flex-col items-center w-56">
                                                <img src="https://iili.io/KTuZeGp.png" alt="Sig" className="h-12 object-contain mb-2 z-10 filter grayscale opacity-90" crossOrigin="anonymous" />
                                                <div className="w-full h-[1px] bg-slate-400 mb-2"></div>
                                                <p className="font-bold text-slate-800 text-sm">Dipta Halder</p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Co-Founder</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
