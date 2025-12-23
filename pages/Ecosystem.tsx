import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Briefcase, Users, MessageCircle, Heart, Star, Lock, Chrome, Target, Gift, FileText, Check, ChevronDown, X, Zap, Brain, TrendingUp, ShieldCheck, AlertTriangle, SearchX, TrendingDown, AlertCircle } from 'lucide-react';
import { saveEcosystemApplication, signInWithGoogle } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

interface EcosystemProps {
    user: User | null;
}

const Ecosystem: React.FC<EcosystemProps> = ({ user }) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paymentData, setPaymentData] = useState({ transactionId: '', paymentMethod: 'Bkash' });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [activeModule, setActiveModule] = useState<number | null>(1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        
        if(!user) {
            setErrorMsg("আবেদন করার জন্য প্রথমে লগইন করুন।");
            return;
        }

        if(!paymentData.transactionId) {
            setErrorMsg("অনুগ্রহ করে ট্রানজেকশন আইডি দিন।");
            return;
        }

        setLoading(true);
        try {
            await saveEcosystemApplication({
                name: user.displayName || 'Unknown',
                phone: user.phone || 'N/A',
                email: user.email || 'N/A',
                photoURL: user.photoURL || '',
                institution: user.institution || '',
                transactionId: paymentData.transactionId,
                paymentMethod: paymentData.paymentMethod as any,
                userId: user.uid,
                status: 'pending',
                paymentDetails: 'Admission (1500) + Module 1 (2000)',
                paidAmount: 3500
            });
            alert("পেমেন্ট কনফার্মেশন সফল হয়েছে! ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে...");
            setIsModalOpen(false);
            setPaymentData({ transactionId: '', paymentMethod: 'Bkash' });
            setTimeout(() => navigate('/dashboard'), 1000);
        } catch (error: any) {
            console.error("Application Failed:", error);
            setErrorMsg("সাবমিট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        try { await signInWithGoogle(); } catch (error) { console.error(error); }
    };

    // Dark Psychology & High Value Curriculum
    const modules = [
        {
            id: 1,
            title: "মডিউল ১: সেলস সাইকোলজি এবং ব্রেইন হ্যাকিং",
            subtitle: "মানুষের মন পড়ার এবং যেকোনো কিছু বিক্রি করার গোপন সূত্র",
            icon: <Brain size={24} />,
            color: "text-rose-600",
            bg: "bg-rose-50",
            price: "২,০০০/-",
            details: [
                "আসল খেলা: কেন মানুষ কিনে? (Buying Motives)",
                "অবচেতন মনকে নিয়ন্ত্রণ করার NLP টেকনিক",
                "ইমোশনাল ট্রিগার এবং ফিয়ার অফ মিসিং আউট (FOMO) তৈরি",
                "কোল্ড কলিং: অপরিচিত মানুষকে ৩ মিনিটে কনভেন্স করার স্ক্রিপ্ট",
                "প্রাইসিং সাইকোলজি: কিভাবে বেশি দামেও প্রোডাক্ট বিক্রি করবেন",
                "ক্লোজিং মাস্টারক্লাস: 'না' কে 'হ্যাঁ' তে রূপান্তর করার ব্লুপ্রিন্ট",
                "অবজেকশন কিলিং: কাস্টমারের অজুহাত হ্যান্ডেল করার ফ্রেমওয়ার্ক"
            ]
        },
        {
            id: 2,
            title: "মডিউল ২: হিপনোটিক কমিউনিকেশন ও ইনফ্লুয়েন্স",
            subtitle: "কথার জাদুতে মানুষকে প্রভাবিত করার আর্ট",
            icon: <MessageCircle size={24} />,
            color: "text-purple-600",
            bg: "bg-purple-50",
            price: "২,০০০/-",
            details: [
                "স্টোরিটেলিং আর্কিটেকচার: গল্প দিয়ে ব্রেইন ওয়াশ করার মেথড",
                "ভয়েস মডুলেশন: যেভাবে কথা বললে মানুষ শুনতে বাধ্য হয়",
                "বডি ল্যাঙ্গুয়েজ ডিকোডিং: না বলা কথা বুঝে ফেলার কৌশল",
                "কর্পোরেট ইমেইল এবং নেগোসিয়েশন এর গোপন টেম্পলেট",
                "পাবলিক স্পিকিং: হাজারো মানুষের সামনে ভয়হীন থাকার উপায়",
                "কনফ্লিক্ট হ্যাকিং: তর্কে না জড়িয়ে নিজের কথা মানানোর কৌশল",
                "প্রেজেন্টেশন মাস্টারি: স্লাইড দিয়ে অডিয়েন্সকে ধরে রাখার উপায়"
            ]
        },
        {
            id: 3,
            title: "মডিউল ৩: এলিট নেটওয়ার্কিং ও পার্সোনাল ব্র্যান্ডিং",
            subtitle: "নিজেকে একটি অথরিটি হিসেবে প্রতিষ্ঠিত করা",
            icon: <Users size={24} />,
            color: "text-blue-600",
            bg: "bg-blue-50",
            price: "২,০০০/-",
            details: [
                "নেটওয়ার্কিং এর ডার্ক সিক্রেট: বড় লিডারদের সাথে কানেক্ট হওয়ার উপায়",
                "লিংকডইন এলগোরিদম হ্যাক এবং কিলার প্রোফাইল অপ্টিমাইজেশন",
                "কনটেন্ট মার্কেটিং: ভাইরাল হওয়ার সাইকোলজিক্যাল স্ট্রাকচার",
                "পার্সোনাল ব্র্যান্ডিং: নিজেকে ইন্ড্রাস্ট্রির 'ব্র্যান্ড' হিসেবে গড়ে তোলা",
                "সোশ্যাল ক্যাপিটাল: সম্পর্ককে টাকায় রূপান্তর করার মেথড",
                "মাস্টারমাইন্ড এক্সেস: কিভাবে হাই-ভ্যালু সার্কেলে ঢুকবেন",
                "ইভেন্ট নেটওয়ার্কিং: ভিড়ের মধ্যে আলাদা হওয়ার টেকনিক"
            ]
        },
        {
            id: 4,
            title: "মডিউল ৪: কর্পোরেট পলিটিক্স ও ইমোশনাল মাস্টারি",
            subtitle: "লিডারশিপ এবং মানসিকভাবে শক্তিশালী হওয়ার ব্লুপ্রিন্ট",
            icon: <Target size={24} />,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            price: "২,০০০/-",
            details: [
                "কর্পোরেট পলিটিক্স সার্ভাইভাল গাইড: অফিসের শত্রু চেনার উপায়",
                "স্ট্রেস হ্যাকিং: চরম চাপের মধ্যেও ঠান্ডা মাথায় সিদ্ধান্ত নেওয়া",
                "ইমোশনাল ইন্টেলিজেন্স (EQ) এর ব্যবহারিক প্রয়োগ",
                "টাইম ম্যানেজমেন্ট নয়, এনার্জি ম্যানেজমেন্ট শিখুন",
                "লিডারশিপ সাইকোলজি: বস নয়, লিডার হওয়ার উপায়",
                "স্যালারি নেগোসিয়েশন এবং প্রমোশন হ্যাকস",
                "মেন্টাল টাফনেস: রিজেকশন এবং ফেইলিউর হ্যান্ডেল করা"
            ]
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen font-['Hind_Siliguri']">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-[#0F172A] text-white">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px]"></div>
                
                <div className="container mx-auto px-4 relative z-10 text-center max-w-5xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-300 font-medium text-sm mb-8 backdrop-blur-sm animate-fade-in-up">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        <span>প্রিমিয়াম ক্যারিয়ার বুটক্যাম্প</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
                        Ecosystem <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">Pro</span>
                    </h1>
                    
                    <p className="text-lg md:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed mb-12">
                        মাত্র ৪ মাসে নিজেকে কর্পোরেট জগতের জন্য <span className="text-white font-semibold">অপ্রতিরোধ্য</span> করে তুলুন। থিওরি নয়, আমরা শিখাই যা ইন্ডাস্ট্রিতে সরাসরি কাজে লাগে।
                    </p>
                    
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="group relative px-8 py-4 bg-blue-600 text-white font-bold rounded-full text-lg shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1 overflow-hidden inline-flex items-center gap-2"
                    >
                        এখনই ভর্তি হোন <ArrowRight size={20} />
                    </button>
                </div>
            </section>

            {/* REALITY CHECK & STATISTICS (DARK PSYCHOLOGY) */}
            <section className="py-20 bg-white relative">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-16">
                        <span className="inline-flex items-center gap-2 text-red-600 font-bold bg-red-50 px-4 py-1 rounded-full text-sm mb-4 animate-pulse border border-red-100">
                            <AlertTriangle size={16} /> Reality Check
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
                            বাংলাদেশের <span className="text-red-600">বেকারত্বের</span> রূঢ় বাস্তবতা
                        </h2>
                        <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                            পরিসংখ্যান বলছে, সার্টিফিকেট এখন আর চাকরির নিশ্চয়তা দেয় না। সমস্যাটা কোথায়?
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto">
                        <div className="bg-red-50 p-8 rounded-3xl border border-red-100 text-center transform hover:scale-105 transition-transform duration-300">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                                <TrendingDown size={32} />
                            </div>
                            <h3 className="text-4xl font-bold text-red-600 mb-2">৪৭%</h3>
                            <p className="font-bold text-slate-800 text-lg mb-2">শিক্ষিত বেকার</p>
                            <p className="text-sm text-slate-600">BIDS এর রিপোর্ট অনুযায়ী, বাংলাদেশের প্রায় অর্ধেক গ্র্যাজুয়েটই বেকার।</p>
                        </div>
                        <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100 text-center transform hover:scale-105 transition-transform duration-300">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                                <SearchX size={32} />
                            </div>
                            <h3 className="text-4xl font-bold text-orange-600 mb-2">৬৯%</h3>
                            <p className="font-bold text-slate-800 text-lg mb-2">কোম্পানি লোক পায় না</p>
                            <p className="text-sm text-slate-600">নিয়োগকর্তারা বলছেন, তারা স্কিলড লোক খুঁজছেন কিন্তু পাচ্ছেন না।</p>
                        </div>
                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 text-center transform hover:scale-105 transition-transform duration-300">
                            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-4xl font-bold text-slate-700 mb-2">০%</h3>
                            <p className="font-bold text-slate-800 text-lg mb-2">স্কিল গ্যারান্টি</p>
                            <p className="text-sm text-slate-600">ইউনিভার্সিটি ডিগ্রি থিওরি শেখায়, কিন্তু জব মার্কেটের প্র্যাক্টিক্যাল স্কিল শেখায় না।</p>
                        </div>
                    </div>

                    {/* Case Studies: The Problem */}
                    <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto items-center">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/20 rounded-full blur-3xl group-hover:bg-red-600/30 transition-colors"></div>
                            
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">CASE STUDY 1</span>
                                ভালো রেজাল্ট, তবুও বেকার?
                            </h3>
                            
                            <div className="space-y-4 mb-6 relative z-10">
                                <div className="flex gap-4">
                                    <div className="w-2 h-2 mt-2.5 rounded-full bg-red-500 shrink-0"></div>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        <strong className="text-white">রফিক (ছদ্মনাম)</strong>, দেশের একটি টপ প্রাইভেট ভার্সিটি থেকে সিজিপিএ ৩.৮০ নিয়ে বিবিএ শেষ করেছেন। গত ৬ মাসে ৫০টিরও বেশি চাকরিতে আবেদন করেছেন, ১০টি ইন্টারভিউ দিয়েছেন।
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-2 h-2 mt-2.5 rounded-full bg-red-500 shrink-0"></div>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        <strong className="text-white">ফলাফল:</strong> একটিও চাকরি হয়নি। কেন?
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                                <h4 className="font-bold text-red-400 mb-2 text-sm uppercase tracking-wide">মিসিং ফ্যাক্টর (Missing Factors):</h4>
                                <ul className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                                    <li className="flex items-center gap-2"><X size={14} className="text-red-500"/> কমিউনিকেশন স্কিল নেই</li>
                                    <li className="flex items-center gap-2"><X size={14} className="text-red-500"/> সিভি অপ্টিমাইজড না</li>
                                    <li className="flex items-center gap-2"><X size={14} className="text-red-500"/> নিজেকে সেল করতে পারেন না</li>
                                    <li className="flex items-center gap-2"><X size={14} className="text-red-500"/> নেটওয়ার্কিং জিরো</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-200 relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-[2rem] opacity-20 blur transition duration-500 group-hover:opacity-40"></div>
                             <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-800">
                                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">SOLUTION</span>
                                    কোম্পানি কী চায়?
                                </h3>
                                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                                    ১০০ জন সিইও-র সাথে কথা বলে জানা গেছে, তারা ফ্রেশারদের মধ্যে টেকনিক্যাল নলেজের চেয়ে এই <strong>৪টি কোর স্কিল</strong> বেশি খোঁজেন। কারণ কাজ শেখানো যায়, কিন্তু এটিটিউড শেখানো কঠিন।
                                </p>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                                        <div className="bg-blue-600 text-white p-2 rounded-lg"><Briefcase size={18}/></div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">Sales & Negotiation</h4>
                                            <p className="text-xs text-slate-500">আইডিয়া বা প্রোডাক্ট কনভেন্স করার ক্ষমতা।</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
                                        <div className="bg-purple-600 text-white p-2 rounded-lg"><MessageCircle size={18}/></div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">Communication</h4>
                                            <p className="text-xs text-slate-500">স্পষ্টভাবে মনের ভাব প্রকাশ ও প্রেজেন্টেশন।</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-3 bg-green-50 rounded-xl border border-green-100">
                                        <div className="bg-green-600 text-white p-2 rounded-lg"><Users size={18}/></div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">Networking</h4>
                                            <p className="text-xs text-slate-500">সঠিক মানুষের সাথে কানেকশন তৈরি।</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
                                        <div className="bg-orange-600 text-white p-2 rounded-lg"><Heart size={18}/></div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">Emotional Intelligence (EQ)</h4>
                                            <p className="text-xs text-slate-500">চাপের মুখে মাথা ঠান্ডা রাখা ও টিমওয়ার্ক।</p>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-lg text-slate-700 font-medium mb-4">আপনি কি সেই ৪৭% বেকারের দলে থাকতে চান, নাকি নিজেকে <span className="text-blue-600 font-bold">টপ ১%</span> এ নিয়ে যেতে চান?</p>
                        <ChevronDown className="mx-auto text-slate-400 animate-bounce" size={32}/>
                    </div>
                </div>
            </section>

            {/* Talent Matchmaking Ecosystem (Roadmap) - RESTORED */}
            <section className="py-20 bg-slate-50 relative">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Talent Matchmaking <span className="text-blue-600">Ecosystem</span></h2>
                        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                            ৪ মাসের একটি কমপ্লিট জার্নি যা আপনাকে কাঁচা মাটি থেকে দক্ষ মানবসম্পদে রূপান্তর করবে
                        </p>
                        <div className="h-1 w-24 bg-blue-600 mx-auto rounded-full mt-4"></div>
                    </div>

                    <div className="max-w-5xl mx-auto relative">
                        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-green-500 md:-translate-x-1/2 opacity-30"></div>

                        {/* Step 1 */}
                        <div className="relative md:grid md:grid-cols-2 gap-12 items-center mb-16 pl-12 md:pl-0">
                            <div className="md:text-right md:pr-12 mb-6 md:mb-0">
                                <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold mb-3">প্রথম ৩ মাস</div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-4">স্কিল ডেভেলপমেন্ট</h3>
                                <ul className="space-y-2 text-slate-600 md:flex md:flex-col md:items-end">
                                    <li className="flex items-center gap-2 md:flex-row-reverse"><CheckCircle className="w-5 h-5 text-blue-500 shrink-0" /> অনলাইন ক্লাস ও মেন্টরশিপ</li>
                                    <li className="flex items-center gap-2 md:flex-row-reverse"><CheckCircle className="w-5 h-5 text-blue-500 shrink-0" /> ৪টি কোর স্কিল ট্রেনিং</li>
                                    <li className="flex items-center gap-2 md:flex-row-reverse"><CheckCircle className="w-5 h-5 text-blue-500 shrink-0" /> ইন্ডাস্ট্রি এক্সপার্ট সেশন</li>
                                </ul>
                            </div>
                            <div className="absolute left-0 md:left-1/2 top-0 md:top-1/2 md:-translate-y-1/2 md:-translate-x-1/2 w-12 h-12 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center shadow-lg z-10">
                                <span className="font-bold text-blue-600 text-xl">1</span>
                            </div>
                            <div className="md:pl-12">
                                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 transform hover:scale-105 transition duration-300">
                                    <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Learning" className="w-full h-48 object-cover rounded-xl mb-4" />
                                    <p className="text-sm text-slate-500 italic font-medium text-center">"শিখুন তাদের কাছ থেকে, যারা ইন্ডাস্ট্রিতে সেরা।"</p>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative md:grid md:grid-cols-2 gap-12 items-center pl-12 md:pl-0">
                            <div className="order-2 md:order-1 md:pr-12">
                                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 transform hover:scale-105 transition duration-300">
                                    <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Internship" className="w-full h-48 object-cover rounded-xl mb-4" />
                                    <p className="text-sm text-slate-500 italic font-medium text-center">"বাস্তব অভিজ্ঞতা, নিশ্চিত ক্যারিয়ার।"</p>
                                </div>
                            </div>
                            <div className="absolute left-0 md:left-1/2 top-0 md:top-1/2 md:-translate-y-1/2 md:-translate-x-1/2 w-12 h-12 bg-white border-4 border-green-500 rounded-full flex items-center justify-center shadow-lg z-10">
                                <span className="font-bold text-green-600 text-xl">2</span>
                            </div>
                            <div className="order-1 md:order-2 md:pl-12 mb-6 md:mb-0">
                                <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold mb-3">শেষ ১ মাস</div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-4">প্র্যাক্টিক্যাল অ্যাপ্লিকেশন</h3>
                                <ul className="space-y-2 text-slate-600">
                                    <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> ইন্টার্নশিপ (অফলাইন/অনলাইন)</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> ইন্ডাস্ট্রিয়াল ভিজিট</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> জব প্লেসমেন্ট সাপোর্ট</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Curriculum - HIGH VALUE PSYCHOLOGY */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center mb-16">
                        <span className="text-rose-600 font-bold tracking-wider uppercase text-sm mb-2 block animate-pulse">Exclusive Content</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">কোর্স কারিকুলাম <span className="text-slate-400 text-lg font-normal">(ভ্যালু ৳২৫,০০০+)</span></h2>
                        <p className="text-slate-600 text-lg">আমরা গতানুগতিক কিছু শিখাই না। আমরা শিখাই সেই সব সিক্রেট যা টপ ১% প্রফেশনালরা ব্যবহার করে।</p>
                    </div>

                    <div className="space-y-6">
                        {modules.map((module) => (
                            <div 
                                key={module.id}
                                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${activeModule === module.id ? 'border-blue-500 shadow-xl ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300 hover:shadow-lg'}`}
                            >
                                <div 
                                    className={`p-6 flex items-center justify-between cursor-pointer ${activeModule === module.id ? 'bg-slate-50' : 'bg-white'}`}
                                    onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${module.bg} ${module.color}`}>
                                            {module.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">{module.title}</h3>
                                            <p className="text-slate-500 text-sm mt-1 hidden md:block">{module.subtitle}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold hidden md:inline-block">ফি: {module.price}</span>
                                        <ChevronDown className={`text-slate-400 transition-transform duration-300 ${activeModule === module.id ? 'rotate-180' : ''}`}/>
                                    </div>
                                </div>
                                
                                <div className={`transition-all duration-500 ease-in-out ${activeModule === module.id ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="p-6 md:p-8 pt-2 border-t border-slate-100 bg-white">
                                        <p className="md:hidden text-slate-500 text-sm mb-4 italic">{module.subtitle}</p>
                                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Zap size={18} className="text-yellow-500 fill-yellow-500"/> এই মডিউলে যা যা শিখবেন:</h4>
                                        <ul className="grid md:grid-cols-2 gap-4">
                                            {module.details.map((detail, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-slate-700 text-sm md:text-base group">
                                                    <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform"/>
                                                    <span className="group-hover:text-blue-600 transition-colors">{detail}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

             {/* Membership Benefits - RESTORED */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">মেম্বারশিপ বেনিফিট</h2>
                        <p className="text-slate-600">এক্সক্লুসিভ সুবিধা যা আপনার ক্যারিয়ারকে দেবে ভিন্ন মাত্রা</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group hover:-translate-y-2 transition-transform">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6"><Briefcase className="w-6 h-6 text-white" /></div>
                            <h3 className="text-xl font-bold mb-3">গ্যারান্টেড ইন্টার্নশিপ</h3>
                            <p className="text-blue-100 text-sm leading-relaxed mb-4">কোর্স শেষে বসে থাকা নয়। আমরা নিশ্চিত করি ১ মাসের ইন্টার্নশিপ। অফলাইন ইন্টার্নশিপে থাকছে সম্মানী এবং চাকরির সুযোগ।</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group hover:-translate-y-2 transition-transform">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6"><Gift className="w-6 h-6 text-white" /></div>
                            <h3 className="text-xl font-bold mb-3">এক্সক্লুসিভ গিফট</h3>
                            <p className="text-purple-100 text-sm leading-relaxed mb-4">মেম্বারদের জন্য ওয়েলকাম কিট (টি-শার্ট, নোটবুক), মেম্বারশিপ কার্ড এবং সকল ইভেন্টে আজীবন বিশেষ ছাড়।</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group hover:-translate-y-2 transition-transform">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6"><FileText className="w-6 h-6 text-white" /></div>
                            <h3 className="text-xl font-bold mb-3">সিভি ও রিসোর্স</h3>
                            <p className="text-orange-100 text-sm leading-relaxed mb-4">প্রিমিয়াম সিভি টেম্পলেট, কভার লেটার জেনারেটর এবং ইন্টারভিউ প্রস্তুতির এক্সক্লুসিভ রিসোর্স প্যাক সম্পূর্ণ ফ্রি।</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing / Enrollment - RESTRUCTURED */}
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">ক্যারিয়ার গড়তে প্রস্তুত?</h2>
                    <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
                        হাজার হাজার টাকা খরচ না করে, নামমাত্র মূল্যে নিজের ভবিষ্যৎ গড়ুন।
                    </p>
                    
                    <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 max-w-lg mx-auto border border-white/20 shadow-2xl relative">
                        <div className="absolute top-0 right-0 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wider">Limited Offer</div>
                        
                        <div className="mb-8 border-b border-white/10 pb-6">
                            <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Total Program Value</p>
                            <p className="text-3xl font-bold text-slate-400 line-through decoration-rose-500 decoration-2">৳ ২১,৫০০</p>
                        </div>

                        <div className="space-y-4 mb-8 text-left">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-300">Admission Fee (Lifetime Access)</span>
                                <span className="font-bold">৳ ১,৫০০</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-300">Module 1 Fee (After Discount)</span>
                                <span className="font-bold text-green-400">৳ ২,০০০</span>
                            </div>
                            <div className="flex justify-between items-center text-sm opacity-50">
                                <span className="text-slate-400">Next Modules (Pay Later)</span>
                                <span className="font-bold">৳ ২,০০০ / module</span>
                            </div>
                        </div>

                        <div className="bg-white/10 rounded-xl p-4 mb-8">
                            <p className="text-sm text-blue-200 mb-1">To Start Now (Payable)</p>
                            <div className="flex justify-center items-end gap-2">
                                <span className="text-5xl font-bold text-white">৳ ৩,৫০০</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2">Admission Fee (1500) + 1st Module (2000)</p>
                        </div>

                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-lg flex justify-center items-center gap-2 group"
                        >
                            এখনই এনরোল করুন <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                        </button>
                        <p className="text-xs text-slate-500 mt-4">100% Satisfaction Guarantee</p>
                    </div>
                </div>
            </section>

            {/* Registration Modal */}
             {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg relative shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">পেমেন্ট কনফার্মেশন</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm hover:shadow transition-all"><X size={20}/></button>
                        </div>
                        
                        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                            {!user ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"><Lock size={32}/></div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">লগইন প্রয়োজন</h3>
                                    <p className="text-slate-500 mb-6 px-4">ভর্তি সম্পন্ন করতে অনুগ্রহ করে প্রথমে লগইন করুন।</p>
                                    <button onClick={handleGoogleLogin} className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl transition flex justify-center items-center gap-2">
                                        <Chrome size={18} className="text-blue-600"/> গুগল দিয়ে লগইন
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl mb-6">
                                        <div className="flex justify-between items-center mb-3 border-b border-blue-200 pb-2">
                                            <span className="text-slate-600 text-sm">ভর্তি ফি</span>
                                            <span className="font-bold text-slate-800">১,৫০০ টাকা</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-3 border-b border-blue-200 pb-2">
                                            <span className="text-slate-600 text-sm">১ম মডিউল ফি</span>
                                            <span className="font-bold text-slate-800">২,০০০ টাকা</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-1">
                                            <span className="text-slate-700 font-bold">সর্বমোট পেমেন্ট</span>
                                            <span className="font-bold text-blue-700 text-lg">৩,৫০০ টাকা</span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white border border-slate-200 p-4 rounded-xl mb-6 shadow-sm">
                                        <p className="text-slate-700 text-sm mb-3 font-medium text-center">নিচের নাম্বারে <strong>Send Money</strong> করে Transaction ID দিন।</p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="font-bold text-pink-600">Bkash</span><span className="font-mono font-bold select-all cursor-pointer">01954666016</span></div>
                                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="font-bold text-orange-600">Nagad</span><span className="font-mono font-bold select-all cursor-pointer">01954666016</span></div>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Transaction ID</label>
                                                <input required type="text" value={paymentData.transactionId} onChange={e => setPaymentData({...paymentData, transactionId: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase placeholder-slate-400" placeholder="e.g. 9G7HG6..." />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">পেমেন্ট মেথড</label>
                                                <select value={paymentData.paymentMethod} onChange={e => setPaymentData({...paymentData, paymentMethod: e.target.value as any})} className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none bg-white">
                                                    <option value="Bkash">Bkash</option>
                                                    <option value="Nagad">Nagad</option>
                                                </select>
                                            </div>
                                        </div>
                                        {errorMsg && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">{errorMsg}</div>}
                                        <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg mt-4 disabled:opacity-70 flex items-center justify-center gap-2">
                                            {loading ? 'যাচাই করা হচ্ছে...' : <><ShieldCheck size={18}/> পেমেন্ট কনফার্ম করুন</>}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ecosystem;