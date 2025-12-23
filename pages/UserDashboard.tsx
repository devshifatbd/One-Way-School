import React, { useState, useEffect } from 'react';
import { User, Affiliate } from '../types';
import { updateUserProfile, getUserApplications, saveWithdrawal } from '../services/firebase';
import { User as UserIcon, Edit3, Save, BriefcaseBusiness, TrendingUp, Copy, Wallet, GraduationCap } from 'lucide-react';

interface UserDashboardProps {
    user: User | null;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'applications' | 'affiliate'>('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [applications, setApplications] = useState<any[]>([]);
    const [affiliateData, setAffiliateData] = useState<Affiliate | null>(null);

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
        const apps = await getUserApplications(user.uid);
        setApplications(apps);
        
        // Check for affiliate data
        const aff = apps.find(a => a.type === 'Affiliate' || a.type === 'Campus Ambassador');
        if (aff) setAffiliateData(aff as Affiliate);
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
                    <p className="text-slate-400">আপনার ড্যাশবোর্ড থেকে প্রোফাইল এবং আবেদন ম্যানেজ করুন</p>
                </div>
            </section>

            <div className="container mx-auto px-4 max-w-5xl -mt-20 relative z-20 pb-20">
                
                {/* Profile Header Card */}
                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-slate-200 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50"></div>
                    
                    <div className="relative">
                        <img src={user.photoURL || 'https://via.placeholder.com/150'} alt="Profile" className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover" />
                        <button onClick={() => setActiveTab('profile')} className="absolute bottom-0 right-0 bg-slate-900 text-white p-2 rounded-full shadow-md hover:bg-slate-800 md:hidden">
                            <Edit3 size={16} />
                        </button>
                    </div>
                    
                    <div className="text-center md:text-left flex-1 relative z-10 pt-2 md:pt-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{user.displayName}</h2>
                        <p className="text-slate-500 mb-4">{user.email}</p>
                        
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            {formData.institution && (
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
                                    <GraduationCap size={14} /> {formData.institution}
                                </span>
                            )}
                            {affiliateData?.status === 'approved' && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                                    <TrendingUp size={14} /> Verified Affiliate
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-4 gap-8">
                    {/* Sidebar Tabs */}
                    <div className="md:col-span-1 space-y-3">
                        <button 
                            onClick={() => setActiveTab('profile')}
                            className={`w-full text-left px-5 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                        >
                            <UserIcon size={18} /> আমার প্রোফাইল
                        </button>
                        <button 
                            onClick={() => setActiveTab('applications')}
                            className={`w-full text-left px-5 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'applications' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                        >
                            <BriefcaseBusiness size={18} /> আবেদনসমূহ
                        </button>
                        <button 
                            onClick={() => setActiveTab('affiliate')}
                            className={`w-full text-left px-5 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'affiliate' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                        >
                            <TrendingUp size={18} /> Affiliate Panel
                        </button>
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

                        {/* APPLICATIONS TAB */}
                        {activeTab === 'applications' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 animate-fade-in">
                                <h3 className="text-xl font-bold text-slate-800 mb-6">আমার আবেদনসমূহ</h3>
                                {applications.length === 0 ? (
                                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300"><p className="text-slate-500">আপনি এখনো কোনো আবেদন করেননি।</p></div>
                                ) : (
                                    <div className="space-y-4">
                                        {applications.map((app, idx) => (
                                            <div key={idx} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
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

                        {/* AFFILIATE PANEL TAB */}
                        {activeTab === 'affiliate' && (
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