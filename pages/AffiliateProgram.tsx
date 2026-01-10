
import React from 'react';
import { User, Affiliate } from '../types';
import { saveAffiliate } from '../services/firebase';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Coins, TrendingUp, Users, CheckCircle, ArrowRight, Wallet, PieChart, Gift } from 'lucide-react';

interface AffiliateProgramProps {
    user: User | null;
}

const AffiliateProgram: React.FC<AffiliateProgramProps> = ({ user }) => {
    const navigate = useNavigate();
    
    // Login Modal Context
    const { openLoginModal } = useOutletContext<{ openLoginModal: () => void }>() || { openLoginModal: () => {} };

    const handleApply = async () => {
        if (!user) {
            openLoginModal();
            return;
        }

        if (window.confirm("আপনি কি এফিলিয়েট প্রোগ্রামে জয়েন করতে চান?")) {
            try {
                const data: Affiliate = {
                    name: user.displayName || 'Unknown',
                    phone: user.phone || 'N/A',
                    email: user.email || 'N/A',
                    institution: user.institution || '',
                    type: 'Affiliate',
                    imageUrl: user.photoURL || '',
                    userId: user.uid,
                    createdAt: new Date(),
                    status: 'pending',
                    balance: 0,
                    totalEarnings: 0
                };
                
                await saveAffiliate(data);
                alert("স্বাগতম! আপনার এফিলিয়েট ড্যাশবোর্ড তৈরি হচ্ছে।");
                navigate('/dashboard');
            } catch (error) {
                console.error(error);
                alert("সমস্যা হয়েছে। আবার চেষ্টা করুন।");
            }
        }
    };

    return (
        <div className="bg-white min-h-screen font-['Hind_Siliguri']">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-green-50 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-green-200/40 rounded-full blur-[80px]"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200/40 rounded-full blur-[80px]"></div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <div className="lg:w-1/2 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-green-200 text-green-700 text-sm font-bold mb-6 shadow-sm">
                                <Coins size={16}/> প্যাসিভ ইনকামের সুযোগ
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                                শিখুন, শেয়ার করুন এবং <span className="text-green-600">আয় করুন</span>
                            </h1>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                                ওয়ান ওয়ে স্কুলের কোর্স এবং সার্ভিস রেফার করে ঘরে বসেই আয় করুন। প্রতিটি সফল রেফারেলে নিশ্চিত কমিশন।
                            </p>
                            <button onClick={handleApply} className="bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-green-500/30 flex items-center gap-2 mx-auto lg:mx-0">
                                এফিলিয়েট হিসেবে জয়েন করুন <ArrowRight size={20}/>
                            </button>
                        </div>
                        <div className="lg:w-1/2">
                            <img src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Earnings" className="rounded-3xl shadow-2xl w-full object-cover transform hover:scale-105 transition duration-500"/>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">কিভাবে কাজ করে?</h2>
                        <p className="text-slate-600">মাত্র ৩টি সহজ ধাপে শুরু করুন আপনার আয়ের যাত্রা</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 text-center relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-1 bg-slate-100 -z-10"></div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-lg transition-all group">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors border-4 border-white shadow-sm">1</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">রেজিস্ট্রেশন করুন</h3>
                            <p className="text-slate-600 text-sm">বিনামূল্যে এফিলিয়েট প্রোগ্রামে জয়েন করুন এবং আপনার ড্যাশবোর্ড অ্যাক্সেস করুন।</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-lg transition-all group">
                            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors border-4 border-white shadow-sm">2</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">লিংক শেয়ার করুন</h3>
                            <p className="text-slate-600 text-sm">আপনার ইউনিক এফিলিয়েট লিংক বা প্রোমো কোড বন্ধুদের সাথে শেয়ার করুন।</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-lg transition-all group">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors border-4 border-white shadow-sm">3</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">আয় করুন</h3>
                            <p className="text-slate-600 text-sm">লিংক ব্যবহার করে কেউ এনরোল করলেই আপনি পাবেন নির্দিষ্ট কমিশন।</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Commission Structure & Benefits */}
            <section className="py-20 bg-slate-900 text-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">কেন আমাদের এফিলিয়েট হবেন?</h2>
                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <div className="bg-green-500/20 p-3 rounded-xl text-green-400 h-fit"><Wallet size={24}/></div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-1">১৫% পর্যন্ত কমিশন</h4>
                                        <p className="text-slate-400 text-sm">প্রতিটি সেলে আকর্ষণীয় কমিশন। আপনার আয় নির্ভর করবে আপনার পারফর্মেন্সের উপর।</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="bg-blue-500/20 p-3 rounded-xl text-blue-400 h-fit"><PieChart size={24}/></div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-1">রিয়েল-টাইম ট্র্যাকিং</h4>
                                        <p className="text-slate-400 text-sm">আপনার ড্যাশবোর্ড থেকে ক্লিক, সেল এবং আয়ের রিয়েল-টাইম রিপোর্ট দেখুন।</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="bg-purple-500/20 p-3 rounded-xl text-purple-400 h-fit"><Gift size={24}/></div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-1">মাসিক বোনাস</h4>
                                        <p className="text-slate-400 text-sm">টপ পারফর্মারদের জন্য প্রতি মাসে থাকছে স্মার্টফোন, গ্যাজেট সহ বিশেষ পুরস্কার।</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="bg-white/10 p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
                            <h3 className="text-2xl font-bold mb-6 text-center border-b border-white/10 pb-4">কমিশন চার্ট</h3>
                            <div className="space-y-4">
                                {/* Base Tier */}
                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                    <div>
                                        <span className="block font-bold text-white text-sm md:text-base">নতুন এফিলিয়েট (Starter)</span>
                                        <span className="text-xs text-slate-400">ইকোসিস্টেম এডমিশন</span>
                                    </div>
                                    <span className="font-bold text-white">১০% কমিশন</span>
                                </div>

                                {/* Pro Tier */}
                                <div className="flex justify-between items-center bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-4 rounded-xl border border-purple-500/30 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-10 h-10 bg-yellow-400/20 blur-xl"></div>
                                    <div>
                                        <span className="block font-bold text-white text-sm md:text-base flex items-center gap-2">
                                            প্রো এফিলিয়েট 
                                            <span className="bg-yellow-500 text-slate-900 text-[10px] px-2 py-0.5 rounded-full font-bold">100 Points</span>
                                        </span>
                                        <span className="text-xs text-blue-200">ইকোসিস্টেম এডমিশন</span>
                                    </div>
                                    <span className="font-bold text-yellow-400 text-lg">১৫% কমিশন</span>
                                </div>

                                {/* Workshop */}
                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                    <span className="text-sm md:text-base">পেইড ওয়ার্কশপ</span>
                                    <span className="font-bold text-green-400">১৫% কমিশন</span>
                                </div>

                                {/* Point System Note */}
                                <div className="mt-6 p-3 bg-blue-600/20 rounded-lg text-center border border-blue-500/30">
                                    <p className="text-sm text-blue-200">
                                        💡 প্রতি সফল রেফারে <span className="font-bold text-white">১০ পয়েন্ট</span>। ১০০ পয়েন্ট হলে আপনি অটোমেটিক প্রো লেভেলে উন্নীত হবেন।
                                    </p>
                                </div>
                            </div>
                            <button onClick={handleApply} className="w-full mt-8 bg-green-500 text-slate-900 font-bold py-3 rounded-xl hover:bg-green-400 transition shadow-lg hover:shadow-green-500/20">
                                শুরু করুন
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">সচরাচর জিজ্ঞাসা (FAQ)</h2>
                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded-xl border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-2">টাকা কিভাবে উইথড্র করব?</h4>
                            <p className="text-slate-600 text-sm">আপনার ড্যাশবোর্ড থেকে বিকাশ বা নগদের মাধ্যমে যেকোনো সময় উইথড্র রিকোয়েস্ট দিতে পারবেন। ৫০০ টাকা হলেই টাকা তোলা যায়।</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-2">জয়েন করতে কি টাকা লাগে?</h4>
                            <p className="text-slate-600 text-sm">না, আমাদের এফিলিয়েট প্রোগ্রামে জয়েন করা সম্পূর্ণ ফ্রি।</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-2">আমি কি ছাত্র অবস্থায় করতে পারব?</h4>
                            <p className="text-slate-600 text-sm">অবশ্যই! এটি ছাত্রদের জন্য পার্ট-টাইম আয়ের সেরা উৎস।</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AffiliateProgram;
