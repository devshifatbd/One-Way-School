import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Users, CheckCircle, Clock, Lock, ArrowRight, Zap, Coins } from 'lucide-react';
import { User, Affiliate } from '../types';
import { saveAffiliate, getUserApplications } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

interface CommunityProps {
    user: User | null;
}

const Community: React.FC<CommunityProps> = ({ user }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'affiliate' | 'ambassador'>('affiliate');
    const [loading, setLoading] = useState(false);
    
    // Check existing application status
    const [existingAffiliate, setExistingAffiliate] = useState<Affiliate | null>(null);
    const [appLoading, setAppLoading] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            if (user) {
                setAppLoading(true);
                const apps = await getUserApplications(user.uid);
                // Find if user has any affiliate/ambassador application
                const affApp = apps.find(app => app.type === 'affiliate' || app.type === 'Campus Ambassador');
                if (affApp) {
                    setExistingAffiliate(affApp as Affiliate);
                }
                setAppLoading(false);
            }
        };
        checkStatus();
    }, [user]);

    const handleQuickJoin = async (type: 'Affiliate' | 'Campus Ambassador') => {
        if (!user) {
            alert("অনুগ্রহ করে প্রথমে লগইন করুন।");
            return;
        }

        if (window.confirm(`আপনি কি নিশ্চিতভাবে ${type} প্রোগ্রামে জয়েন করতে চান? আপনার প্রোফাইলের তথ্য ব্যবহার করে আবেদন জমা দেওয়া হবে।`)) {
            setLoading(true);
            try {
                const data: Affiliate = {
                    name: user.displayName || 'Unknown',
                    phone: user.phone || 'N/A',
                    email: user.email || 'N/A',
                    institution: user.institution || '',
                    type: type,
                    imageUrl: user.photoURL || '',
                    userId: user.uid,
                    createdAt: new Date(),
                    status: 'pending',
                    balance: 0,
                    totalEarnings: 0
                };

                await saveAffiliate(data);
                alert("আপনার আবেদন সফলভাবে জমা হয়েছে! এডমিন এপ্রুভালের জন্য অপেক্ষা করুন।");
                setExistingAffiliate(data);
            } catch (error) {
                console.error(error);
                alert("Something went wrong");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-900">
                <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] animate-float"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px] animate-float-delayed"></div>
                
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        আমাদের <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">কমিউনিটি</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
                        শেখা, আয় করা এবং নেতৃত্ব দেওয়ার অনন্য প্ল্যাটফর্ম। আজই যুক্ত হোন আমাদের সাথে।
                    </p>
                </div>
            </section>

            {/* Tab Navigation */}
            <section className="py-8 bg-white border-b border-slate-200 sticky top-16 md:top-20 z-30 shadow-sm">
                <div className="container mx-auto px-4 flex justify-center">
                    <div className="bg-slate-100 p-1.5 rounded-full flex gap-2">
                        <button 
                            onClick={() => setActiveTab('affiliate')}
                            className={`px-6 py-2.5 rounded-full font-bold text-sm md:text-base transition-all ${activeTab === 'affiliate' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-200'}`}
                        >
                            এফিলিয়েট প্রোগ্রাম
                        </button>
                        <button 
                            onClick={() => setActiveTab('ambassador')}
                            className={`px-6 py-2.5 rounded-full font-bold text-sm md:text-base transition-all ${activeTab === 'ambassador' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-200'}`}
                        >
                            ক্যাম্পাস এম্বাসেডর
                        </button>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 md:py-24 relative overflow-hidden">
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    
                    {/* AFFILIATE SECTION */}
                    {activeTab === 'affiliate' && (
                        <div className="animate-fade-in">
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-6">
                                        <Coins size={16} /> প্যাসিভ ইনকাম
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                                        এফিলিয়েট হয়ে <br/> <span className="text-blue-600">আয় করুন ঘরে বসেই</span>
                                    </h2>
                                    <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                                        আপনার পরিচিতদের মাঝে আমাদের কোর্স রেফার করুন এবং প্রতিটি সফল রেফারেলে পান <span className="font-bold text-slate-900 bg-yellow-100 px-2 rounded">১৫% ইনস্ট্যান্ট বোনাস</span>। কোনো টেকনিক্যাল স্কিল ছাড়াই শুরু করুন আজই।
                                    </p>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600"><CheckCircle size={18}/></div>
                                            <p className="font-medium text-slate-700">১৫% ফ্লাট কমিশন</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><TrendingUp size={18}/></div>
                                            <p className="font-medium text-slate-700">রিয়েল-টাইম আর্নিং ট্র্যাকিং</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><Zap size={18}/></div>
                                            <p className="font-medium text-slate-700">বিকাশ/নগদ এর মাধ্যমে পেমেন্ট</p>
                                        </div>
                                    </div>

                                    {/* Application Logic */}
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-blue-100">
                                        {!user ? (
                                            <div className="text-center">
                                                <p className="text-slate-600 mb-4 font-medium">জয়েন করতে হলে প্রথমে লগইন করুন</p>
                                                <button disabled className="w-full bg-slate-300 text-slate-500 font-bold py-3.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                                                    <Lock size={18} /> লগইন প্রয়োজন
                                                </button>
                                            </div>
                                        ) : appLoading ? (
                                            <div className="text-center py-4">চেকিং...</div>
                                        ) : existingAffiliate ? (
                                            <div className="text-center">
                                                {existingAffiliate.status === 'pending' && (
                                                    <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl border border-yellow-200">
                                                        <div className="flex justify-center mb-2"><Clock size={32} /></div>
                                                        <h3 className="font-bold text-lg">আবেদন পেন্ডিং আছে</h3>
                                                        <p className="text-sm">এডমিন এপ্রুভালের জন্য অপেক্ষা করুন। শীঘ্রই নোটিফিকেশন পাবেন।</p>
                                                    </div>
                                                )}
                                                {existingAffiliate.status === 'approved' && (
                                                    <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-200">
                                                        <div className="flex justify-center mb-2"><CheckCircle size={32} /></div>
                                                        <h3 className="font-bold text-lg">অভিনন্দন! আপনি এপ্রুভড</h3>
                                                        <p className="text-sm mb-4">আপনার ড্যাশবোর্ড থেকে রেফারেল লিংক সংগ্রহ করুন।</p>
                                                        <button onClick={() => navigate('/dashboard')} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700">
                                                            ড্যাশবোর্ডে যান
                                                        </button>
                                                    </div>
                                                )}
                                                {existingAffiliate.status === 'rejected' && (
                                                     <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200">
                                                        <h3 className="font-bold">দুঃখিত, আবেদন বাতিল হয়েছে</h3>
                                                     </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <img src={user.photoURL || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full border border-slate-200" />
                                                    <div>
                                                        <p className="font-bold text-slate-900">{user.displayName}</p>
                                                        <p className="text-xs text-slate-500">{user.email}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleQuickJoin('Affiliate')}
                                                    disabled={loading}
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                                                >
                                                    {loading ? 'প্রসেসিং...' : 'এক ক্লিকে জয়েন করুন'} <ArrowRight size={18} />
                                                </button>
                                                <p className="text-xs text-slate-400 mt-2 text-center">আপনার প্রোফাইলের তথ্য দিয়ে আবেদনটি করা হবে</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-3xl rotate-3 opacity-20 blur-lg"></div>
                                    <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Affiliate Marketing" className="relative rounded-3xl shadow-2xl w-full" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AMBASSADOR SECTION */}
                    {activeTab === 'ambassador' && (
                        <div className="animate-fade-in">
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                <div className="order-2 lg:order-1 relative">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-3xl -rotate-3 opacity-20 blur-lg"></div>
                                    <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Campus Ambassador" className="relative rounded-3xl shadow-2xl w-full" />
                                </div>

                                <div className="order-1 lg:order-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-bold mb-6">
                                        <Award size={16} /> লিডারশিপ প্রোগ্রাম
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                                        ক্যাম্পাস <span className="text-purple-600">এম্বাসেডর</span>
                                    </h2>
                                    <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                                        আপনার ক্যাম্পাসে One Way School এর প্রতিনিধি হোন। লিডারশিপ স্কিল বাড়ানোর পাশাপাশি ইভেন্ট অর্গানাইজ করা এবং টিম ম্যানেজমেন্ট শেখার সেরা সুযোগ।
                                    </p>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><Users size={18}/></div>
                                            <p className="font-medium text-slate-700">নেটওয়ার্কিং ও ব্র্যান্ডিং সুযোগ</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><Award size={18}/></div>
                                            <p className="font-medium text-slate-700">সার্টিফিকেট ও বেস্ট পারফর্মার অ্যাওয়ার্ড</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><Coins size={18}/></div>
                                            <p className="font-medium text-slate-700">ইভেন্ট বেসড ইনসেন্টিভ</p>
                                        </div>
                                    </div>

                                    {/* Application Logic */}
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-purple-100">
                                        {!user ? (
                                            <div className="text-center">
                                                <p className="text-slate-600 mb-4 font-medium">জয়েন করতে হলে প্রথমে লগইন করুন</p>
                                                <button disabled className="w-full bg-slate-300 text-slate-500 font-bold py-3.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                                                    <Lock size={18} /> লগইন প্রয়োজন
                                                </button>
                                            </div>
                                        ) : appLoading ? (
                                            <div className="text-center py-4">চেকিং...</div>
                                        ) : existingAffiliate ? (
                                             <div className="text-center">
                                                 <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-200">
                                                     <h3 className="font-bold text-lg">আপনি ইতিমধ্যে আবেদন করেছেন</h3>
                                                     <p className="text-sm">বর্তমান স্ট্যাটাস: <span className="uppercase font-bold">{existingAffiliate.status}</span></p>
                                                     <button onClick={() => navigate('/dashboard')} className="mt-2 text-blue-600 hover:underline font-bold text-sm">ড্যাশবোর্ড দেখুন</button>
                                                 </div>
                                             </div>
                                        ) : (
                                            <div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <img src={user.photoURL || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full border border-slate-200" />
                                                    <div>
                                                        <p className="font-bold text-slate-900">{user.displayName}</p>
                                                        <p className="text-xs text-slate-500">{user.institution || 'Institution Info Needed'}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleQuickJoin('Campus Ambassador')}
                                                    disabled={loading}
                                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2"
                                                >
                                                    {loading ? 'প্রসেসিং...' : 'এম্বাসেডর হিসেবে জয়েন করুন'} <ArrowRight size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </section>
        </div>
    );
};

export default Community;