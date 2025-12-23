import React, { useState, useEffect, useRef } from 'react';
import { User, Affiliate, EcosystemApplication } from '../types';
import { updateUserProfile, getUserApplications, saveWithdrawal, uploadProfileImage } from '../services/firebase';
import { User as UserIcon, Edit3, Save, Briefcase, TrendingUp, Copy, Wallet, GraduationCap, Video, Bell, CheckCircle, BookOpen, Clock, RefreshCw, ChevronRight, Camera, AlertCircle, HelpCircle } from 'lucide-react';

interface UserDashboardProps {
    user: User | null;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'applications' | 'affiliate' | 'classroom'>('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    
    // Local state for immediate UI update of profile image
    const [displayPhoto, setDisplayPhoto] = useState<string>('');

    const [applications, setApplications] = useState<any[]>([]);
    const [affiliateData, setAffiliateData] = useState<Affiliate | null>(null);
    const [ecosystemData, setEcosystemData] = useState<EcosystemApplication | null>(null);
    
    // File Input Ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile Form State
    const [formData, setFormData] = useState({
        phone: '',
        institution: '',
        address: '',
        bio: '',
        linkedin: '',
        portfolio: '',
        skills: ''
    });

    // Withdrawal Form
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawMethod, setWithdrawMethod] = useState<'Bkash' | 'Nagad' | 'Bank'>('Bkash');
    const [accountNumber, setAccountNumber] = useState('');

    useEffect(() => {
        if (user) {
            setDisplayPhoto(user.photoURL || 'https://via.placeholder.com/150');
            setFormData({
                phone: user.phone || '',
                institution: user.institution || '',
                address: user.address || '',
                bio: user.bio || '',
                linkedin: user.linkedin || '',
                portfolio: user.portfolio || '',
                skills: user.skills || ''
            });
            fetchApplications();
        }
    }, [user]);

    const fetchApplications = async () => {
        if (!user) return;
        setRefreshing(true);
        try {
            const apps = await getUserApplications(user.uid);
            setApplications(apps);
            
            // Check for affiliate data
            const aff = apps.find(a => a.type === 'Affiliate' || a.type === 'Campus Ambassador');
            if (aff) setAffiliateData(aff as Affiliate);

            // Check for Ecosystem Student data (ANY status: Pending, Approved, Rejected)
            // We verify by type 'Ecosystem Program'
            const eco = apps.find(a => a.type === 'Ecosystem Program');
            
            if (eco) {
                setEcosystemData(eco as EcosystemApplication);
                // If on applications or affiliate tab (which are hidden for ecosystem users), switch to profile or classroom
                if (activeTab === 'applications' || activeTab === 'affiliate') {
                    setActiveTab('profile');
                }
            } else {
                setEcosystemData(null);
            }
        } catch (error) {
            console.error("Failed to fetch applications", error);
        }
        setRefreshing(false);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        try {
            await updateUserProfile(user.uid, formData);
            setIsEditing(false);
            alert("প্রোফাইল আপডেট হয়েছে!");
        } catch (error) {
            alert("আপডেট ব্যর্থ হয়েছে।");
        }
        setLoading(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!user || !e.target.files || e.target.files.length === 0) return;
        
        const file = e.target.files[0];
        setImageUploading(true);
        try {
            const url = await uploadProfileImage(file, user.uid);
            setDisplayPhoto(url); // Update local state immediately
            alert("প্রোফাইল ছবি পরিবর্তন হয়েছে!");
        } catch (error) {
            console.error(error);
            alert("ছবি আপলোড ব্যর্থ হয়েছে।");
        }
        setImageUploading(false);
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!user || !affiliateData) return;
        
        const amount = Number(withdrawAmount);
        if(amount < 500) {
            alert("মিনিমাম ৫০০ টাকা উইথড্র করতে হবে।");
            return;
        }
        if(amount > affiliateData.balance) {
            alert("পর্যাপ্ত ব্যালেন্স নেই।");
            return;
        }

        if(window.confirm(`${amount} টাকা ${withdrawMethod} নাম্বারে উইথড্র রিকুয়েস্ট পাঠাবেন?`)) {
            try {
                await saveWithdrawal({
                    userId: user.uid,
                    userName: user.displayName,
                    amount,
                    method: withdrawMethod,
                    accountNumber,
                    status: 'pending'
                });
                alert("উইথড্র রিকুয়েস্ট সফল হয়েছে! এডমিন শীঘ্রই প্রসেস করবে।");
                setWithdrawAmount('');
                setAccountNumber('');
            } catch(e) {
                alert("Failed to request withdrawal.");
            }
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("কপি হয়েছে!");
    };

    const MODULES = [
        "মডিউল ১: সেলস মাস্টারি",
        "মডিউল ২: বিজনেস কমিউনিকেশন",
        "মডিউল ৩: প্রফেশনাল নেটওয়ার্কিং",
        "মডিউল ৪: ইমোশনাল ইন্টেলিজেন্স"
    ];

    if (!user) {
        return (
            <div className="pt-48 pb-20 container mx-auto text-center">
                <h2 className="text-2xl font-bold">অনুগ্রহ করে লগইন করুন</h2>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Dashboard Hero Section */}
            <section className="relative pt-32 pb-32 md:pt-40 md:pb-40 overflow-hidden bg-slate-900">
                <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] animate-float"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] animate-float-delayed"></div>
                
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                        স্বাগতম, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">{user.displayName}</span>
                    </h1>
                    <p className="text-slate-400">আপনার ড্যাশবোর্ড থেকে প্রোফাইল এবং কার্যক্রম ম্যানেজ করুন</p>
                </div>
            </section>

            <div className="container mx-auto px-4 max-w-5xl -mt-20 relative z-20 pb-20">
                
                {/* Profile Header Card */}
                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-slate-200 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50"></div>
                    
                    <div className="relative group">
                        <img 
                            src={displayPhoto} 
                            alt="Profile" 
                            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white" 
                        />
                        {/* Image Upload Trigger */}
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 md:right-2 bg-slate-900 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-md"
                            title="ছবি পরিবর্তন করুন"
                        >
                            {imageUploading ? <RefreshCw size={16} className="animate-spin"/> : <Camera size={16} />}
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            accept="image/*" 
                            className="hidden" 
                        />
                    </div>
                    
                    <div className="text-center md:text-left flex-1 relative z-10 pt-2 md:pt-4">
                        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{user.displayName}</h2>
                                <p className="text-slate-500 mb-4">{user.email}</p>
                            </div>
                            <button 
                                onClick={fetchApplications} 
                                disabled={refreshing}
                                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                            >
                                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''}/> আপডেট দেখুন
                            </button>
                        </div>
                        
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                            {formData.institution && (
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
                                    <GraduationCap size={14} /> {formData.institution}
                                </span>
                            )}
                            
                            {ecosystemData && (
                                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 border ${
                                    ecosystemData.status === 'approved' 
                                        ? 'bg-purple-100 text-purple-700 border-purple-200' 
                                        : ecosystemData.status === 'rejected'
                                        ? 'bg-red-100 text-red-700 border-red-200'
                                        : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                }`}>
                                    <BookOpen size={14} /> Ecosystem: {ecosystemData.status === 'approved' ? (ecosystemData.batch || 'Batch TBD') : ecosystemData.status}
                                </span>
                            )}

                            {!ecosystemData && affiliateData?.status === 'approved' && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                                    <TrendingUp size={14} /> Verified Affiliate
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Banner for Ecosystem Students (Approved Only) */}
                {ecosystemData && ecosystemData.status === 'approved' && activeTab !== 'classroom' && (
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 mb-8 text-white flex flex-col md:flex-row items-center justify-between shadow-md animate-fade-in">
                        <div className="flex items-center gap-3 mb-3 md:mb-0">
                            <div className="bg-white/20 p-2 rounded-full"><Video size={20} /></div>
                            <div>
                                <p className="font-bold text-lg">আপনার ক্লাসরুম প্রস্তুত!</p>
                                <p className="text-sm text-purple-100">ক্লাস লিংক এবং রিসোর্স দেখতে ক্লাসরুম ট্যাবে যান।</p>
                            </div>
                        </div>
                        <button onClick={() => setActiveTab('classroom')} className="bg-white text-purple-700 px-6 py-2 rounded-lg font-bold text-sm hover:bg-purple-50 transition-colors shadow-sm">
                            ক্লাসরুমে যান
                        </button>
                    </div>
                )}

                <div className="grid md:grid-cols-4 gap-8">
                    {/* Sidebar Tabs */}
                    <div className="md:col-span-1 space-y-3">
                        <button 
                            onClick={() => setActiveTab('profile')}
                            className={`w-full text-left px-5 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                        >
                            <UserIcon size={18} /> আমার প্রোফাইল
                        </button>

                        {/* If Ecosystem Student (Any Status), show Classroom/Status Tab and HIDE others */}
                        {ecosystemData ? (
                            <button 
                                onClick={() => setActiveTab('classroom')}
                                className={`w-full text-left px-5 py-3 rounded-xl font-medium flex items-center gap-3 transition-all relative overflow-hidden ${activeTab === 'classroom' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-white text-slate-600 hover:bg-slate-100 border border-purple-100'}`}
                            >
                                <div className="relative z-10 flex items-center gap-3">
                                    {ecosystemData.status === 'approved' ? <Video size={18} /> : <Clock size={18}/>}
                                    {ecosystemData.status === 'approved' ? 'ক্লাসরুম' : 'আবেদন স্ট্যাটাস'}
                                </div>
                                {activeTab !== 'classroom' && ecosystemData.status === 'approved' && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>}
                            </button>
                        ) : (
                            // Show generic tabs ONLY if NOT an ecosystem student
                            <>
                                <button 
                                    onClick={() => setActiveTab('applications')}
                                    className={`w-full text-left px-5 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'applications' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                                >
                                    <Briefcase size={18} /> আবেদনসমূহ
                                </button>
                                <button 
                                    onClick={() => setActiveTab('affiliate')}
                                    className={`w-full text-left px-5 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'affiliate' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                                >
                                    <TrendingUp size={18} /> Affiliate Panel
                                </button>
                            </>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="md:col-span-3">
                        {/* PROFILE TAB */}
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 animate-fade-in">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-slate-800">প্রোফাইল তথ্য</h3>
                                    {!isEditing && (
                                        <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                                            <Edit3 size={18} /> এডিট করুন
                                        </button>
                                    )}
                                </div>

                                <form onSubmit={handleSaveProfile} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">মোবাইল নম্বর</label>
                                            <input disabled={!isEditing} type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'bg-white border-slate-300' : 'bg-slate-50 border-transparent text-slate-600'}`} placeholder="01XXXXXXXXX" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">শিক্ষা প্রতিষ্ঠান</label>
                                            <input disabled={!isEditing} type="text" value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})} className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'bg-white border-slate-300' : 'bg-slate-50 border-transparent text-slate-600'}`} placeholder="প্রতিষ্ঠানের নাম" />
                                        </div>
                                    </div>
                                    
                                    {isEditing && (
                                        <div className="flex justify-end pt-4 border-t border-slate-100 gap-3">
                                            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100">বাতিল</button>
                                            <button type="submit" disabled={loading} className="px-8 py-2 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">{loading ? 'সংরক্ষণ হচ্ছে...' : <><Save size={18}/> সংরক্ষণ করুন</>}</button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}

                        {/* CLASSROOM / STATUS TAB */}
                        {activeTab === 'classroom' && ecosystemData && (
                             <div className="space-y-6 animate-fade-in">
                                {/* If Approved, Show Classroom */}
                                {ecosystemData.status === 'approved' ? (
                                    <>
                                        {/* Welcome Card */}
                                        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                            <div className="relative z-10">
                                                <h3 className="text-2xl font-bold mb-1">Ecosystem Classroom</h3>
                                                <p className="text-violet-200">Batch: <span className="font-mono font-bold text-white bg-white/20 px-2 py-0.5 rounded">{ecosystemData.batch || 'Batch assigned soon...'}</span></p>
                                                
                                                <div className="mt-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
                                                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                                                        <p className="text-xs text-violet-200 uppercase font-bold mb-1 flex items-center gap-1"><Clock size={12}/> Next Live Class</p>
                                                        <p className="font-bold text-lg">{ecosystemData.classTime || "সময়সূচী শীঘ্রই জানানো হবে"}</p>
                                                    </div>
                                                    
                                                    {ecosystemData.classLink ? (
                                                        <a href={ecosystemData.classLink} target="_blank" rel="noopener noreferrer" className="bg-white text-violet-700 px-6 py-3 rounded-xl font-bold hover:bg-violet-50 transition-all flex items-center gap-2 shadow-lg animate-pulse">
                                                            <Video size={20}/> Join Live Class (Google Meet)
                                                        </a>
                                                    ) : (
                                                        <button disabled className="bg-white/50 text-white px-6 py-3 rounded-xl font-bold cursor-not-allowed flex items-center gap-2">
                                                            <Video size={20}/> ক্লাসের লিংক শীঘ্রই আসছে
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-6">
                                            {/* Notice Board */}
                                            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Bell size={18} className="text-orange-500"/> নোটিশ বোর্ড</h4>
                                                <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                                    {ecosystemData.notices && ecosystemData.notices.length > 0 ? (
                                                        ecosystemData.notices.map((notice, idx) => (
                                                            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <h5 className="font-bold text-slate-800 text-sm">{notice.title}</h5>
                                                                    <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                                                                        {notice.date ? new Date(notice.date.seconds * 1000).toLocaleDateString() : 'Today'}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-slate-600 leading-relaxed">{notice.message}</p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-slate-400 text-sm italic text-center py-4">বর্তমানে কোনো নোটিশ নেই</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Syllabus Tracker */}
                                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><CheckCircle size={18} className="text-green-500"/> সিলেবাস প্রগ্রেস</h4>
                                                <div className="space-y-3 relative">
                                                    <div className="absolute left-2.5 top-2 bottom-4 w-0.5 bg-slate-100"></div>
                                                    {MODULES.map((mod, idx) => {
                                                        const currentMod = ecosystemData.currentModule || 1;
                                                        const isCompleted = idx + 1 < currentMod;
                                                        const isActive = idx + 1 === currentMod;
                                                        
                                                        return (
                                                            <div key={idx} className="relative z-10 flex items-center gap-3">
                                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${isCompleted ? 'bg-green-500 border-green-500 text-white' : isActive ? 'bg-white border-blue-500' : 'bg-white border-slate-200'}`}>
                                                                    {isCompleted && <CheckCircle size={12} fill="white" />}
                                                                    {isActive && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                                                </div>
                                                                <span className={`text-sm ${isActive ? 'font-bold text-blue-600' : isCompleted ? 'text-slate-400 line-through' : 'text-slate-500'}`}>
                                                                    {mod}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Payment Info */}
                                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Wallet size={18} className="text-slate-500"/> পেমেন্ট তথ্য</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                                <div className="bg-slate-50 p-4 rounded-xl">
                                                    <p className="text-xs text-slate-500 uppercase">ভর্তি ফি (Paid)</p>
                                                    <p className="font-bold text-slate-800">৳ ১,৫০০</p>
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-xl">
                                                    <p className="text-xs text-slate-500 uppercase">১ম মডিউল (Paid)</p>
                                                    <p className="font-bold text-slate-800">৳ ২,০০০</p>
                                                </div>
                                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                    <p className="text-xs text-blue-600 uppercase font-bold">পরবর্তী পেমেন্ট</p>
                                                    <p className="font-bold text-blue-800">৳ ২,০০০</p>
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-xl">
                                                    <p className="text-xs text-slate-500 uppercase">তারিখ</p>
                                                    <p className="font-bold text-slate-800">পরবর্তী মাসের ৫ তারিখ</p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    // PENDING or REJECTED State UI
                                    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-100 p-8 text-center mt-8">
                                        {ecosystemData.status === 'rejected' ? (
                                            <>
                                                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <AlertCircle size={40} className="text-red-600"/>
                                                </div>
                                                <h2 className="text-2xl font-bold text-slate-800 mb-3">আপনার আবেদনটি বাতিল করা হয়েছে</h2>
                                                <p className="text-slate-600 mb-6 leading-relaxed">
                                                    দুঃখিত, আপনার প্রদত্ত তথ্যে অসামঞ্জস্য থাকায় আবেদনটি গ্রহণ করা সম্ভব হয়নি। 
                                                    অনুগ্রহ করে আমাদের হেল্পলাইনে যোগাযোগ করুন।
                                                </p>
                                                <div className="flex justify-center gap-4">
                                                    <a href="tel:+8801626777076" className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800">
                                                        <HelpCircle size={18}/> যোগাযোগ করুন
                                                    </a>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                                    <Clock size={40} className="text-yellow-600"/>
                                                </div>
                                                <h2 className="text-2xl font-bold text-slate-800 mb-3">আপনার আবেদনটি যাচাই করা হচ্ছে</h2>
                                                <p className="text-slate-600 mb-8 leading-relaxed">
                                                    আপনার পেমেন্ট এবং তথ্য আমাদের সিস্টেমে জমা হয়েছে। অ্যাডমিন প্যানেল থেকে ভেরিফিকেশন সম্পন্ন হলে 
                                                    আপনি এই পেজেই ক্লাসরুমের এক্সেস পাবেন। সাধারণত ২৪ ঘন্টার মধ্যে এটি সম্পন্ন হয়।
                                                </p>
                                                
                                                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 inline-block w-full max-w-md text-left">
                                                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">আবেদনের তথ্য</h4>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-600">Name</span>
                                                            <span className="font-bold text-slate-800">{ecosystemData.name}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-600">Trx ID</span>
                                                            <span className="font-mono font-bold text-slate-800 bg-white px-2 rounded border border-slate-200">{ecosystemData.transactionId}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-600">Payment Method</span>
                                                            <span className="font-bold text-blue-600">{ecosystemData.paymentMethod}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-600">Submitted At</span>
                                                            <span className="text-slate-800">{ecosystemData.createdAt ? new Date(ecosystemData.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-8">
                                                    <button onClick={fetchApplications} className="text-blue-600 font-bold flex items-center justify-center gap-2 hover:underline mx-auto">
                                                        <RefreshCw size={16}/> স্ট্যাটাস চেক করুন
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                             </div>
                        )}

                        {/* APPLICATIONS TAB (Generic User Only) */}
                        {activeTab === 'applications' && !ecosystemData && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 animate-fade-in">
                                <h3 className="text-xl font-bold text-slate-800 mb-6">আমার আবেদনসমূহ</h3>
                                {applications.length === 0 ? (
                                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300"><p className="text-slate-500">আপনি এখনো কোনো আবেদন করেননি।</p></div>
                                ) : (
                                    <div className="space-y-4">
                                        {applications.map((app, idx) => (
                                            <div key={idx} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${app.type === 'job/lead' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{app.type}</span>
                                                        <span className="text-xs text-slate-400">{app.createdAt ? new Date(app.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                                                    </div>
                                                    <h4 className="font-bold text-slate-800">{app.details?.jobTitle || app.type}</h4>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${app.status === 'approved' ? 'bg-green-100 text-green-700' : app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {app.status || 'Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* AFFILIATE PANEL TAB (Generic User Only) */}
                        {activeTab === 'affiliate' && !ecosystemData && (
                            <div className="space-y-6 animate-fade-in">
                                {!affiliateData ? (
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                                        <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-slate-700 mb-2">আপনি এখনো এফিলিয়েট প্রোগ্রামে জয়েন করেননি</h3>
                                        <p className="text-slate-500 mb-6">আমাদের কমিউনিটি পেজ থেকে এখনই জয়েন করুন এবং আয় করা শুরু করুন।</p>
                                        <button onClick={() => window.location.hash = '#/community'} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition">জয়েন করুন</button>
                                    </div>
                                ) : affiliateData.status === 'pending' ? (
                                    <div className="bg-yellow-50 rounded-2xl p-8 text-center border border-yellow-200">
                                        <h3 className="text-xl font-bold text-yellow-800 mb-2">আবেদন পেন্ডিং আছে</h3>
                                        <p className="text-yellow-700">এডমিন এপ্রুভালের পর আপনি ড্যাশবোর্ড এক্সেস পাবেন।</p>
                                    </div>
                                ) : affiliateData.status === 'rejected' ? (
                                    <div className="bg-red-50 rounded-2xl p-8 text-center border border-red-200">
                                        <h3 className="text-xl font-bold text-red-800">আবেদন বাতিল করা হয়েছে</h3>
                                    </div>
                                ) : (
                                    <>
                                        {/* Approved Dashboard */}
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                                                <p className="text-blue-100 text-sm font-medium mb-1">মোট আয় (Lifetime)</p>
                                                <h3 className="text-3xl font-bold">৳ {affiliateData.totalEarnings || 0}</h3>
                                            </div>
                                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
                                                <p className="text-slate-500 text-sm font-medium mb-1">বর্তমান ব্যালেন্স</p>
                                                <h3 className="text-3xl font-bold text-green-600">৳ {affiliateData.balance || 0}</h3>
                                            </div>
                                        </div>

                                        {/* Referral Link */}
                                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                            <h4 className="font-bold text-slate-800 mb-3">আপনার রেফারেল লিংক</h4>
                                            <div className="flex gap-2">
                                                <input 
                                                    readOnly 
                                                    value={`https://onewayschool.com?ref=${affiliateData.referralCode}`} 
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-600 text-sm"
                                                />
                                                <button 
                                                    onClick={() => copyToClipboard(`https://onewayschool.com?ref=${affiliateData.referralCode}`)}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
                                                >
                                                    <Copy size={18}/>
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-2">এই লিংক শেয়ার করুন এবং প্রতিটি সাকসেসফুল এনরোলমেন্টে পান ১৫% বোনাস।</p>
                                        </div>

                                        {/* Withdraw Request */}
                                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                <Wallet size={20} className="text-blue-600"/> টাকা উত্তোলন করুন
                                            </h4>
                                            <form onSubmit={handleWithdraw} className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">টাকার পরিমাণ</label>
                                                        <input 
                                                            type="number" 
                                                            value={withdrawAmount} 
                                                            onChange={e => setWithdrawAmount(e.target.value)} 
                                                            className="w-full border border-slate-300 rounded-lg px-3 py-2" 
                                                            placeholder="500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">পেমেন্ট মেথড</label>
                                                        <select 
                                                            value={withdrawMethod} 
                                                            onChange={e => setWithdrawMethod(e.target.value as any)}
                                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
                                                        >
                                                            <option value="Bkash">বিকাশ</option>
                                                            <option value="Nagad">নগদ</option>
                                                            <option value="Bank">ব্যাংক</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">একাউন্ট নাম্বার</label>
                                                    <input 
                                                        type="text" 
                                                        value={accountNumber} 
                                                        onChange={e => setAccountNumber(e.target.value)} 
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2" 
                                                        placeholder="01XXXXXXXXX"
                                                    />
                                                </div>
                                                <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition">
                                                    উইথড্র রিকুয়েস্ট পাঠান
                                                </button>
                                                <p className="text-xs text-slate-400 text-center">মিনিমাম উইথড্রয়াল এমাউন্ট: ৫০০ টাকা</p>
                                            </form>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;