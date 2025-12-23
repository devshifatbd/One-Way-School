import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Briefcase, Users, MessageCircle, Heart, Star, CreditCard, X, ChevronDown, Lock, LogIn, Quote, TrendingUp, Target, FileText, MonitorPlay } from 'lucide-react';
import { saveEcosystemApplication, auth, signInWithGoogle } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

const Ecosystem: React.FC = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        institution: '',
        transactionId: '',
        paymentMethod: 'Bkash'
    });
    const [loading, setLoading] = useState(false);
    const [activeModule, setActiveModule] = useState<number | null>(0);
    const user = auth.currentUser;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!user) {
            alert("আবেদন করার জন্য প্রথমে লগইন করুন।");
            return;
        }

        setLoading(true);
        try {
            await saveEcosystemApplication({
                ...formData,
                userId: user.uid,
                status: 'pending'
            });
            alert("অভিনন্দন! আপনার ভর্তি সফলভাবে প্রক্রিয়াধীন। আমরা যাচাই করে কনফার্মেশন মেইল পাঠাবো।");
            setIsModalOpen(false);
            setFormData({ name: '', phone: '', email: '', institution: '', transactionId: '', paymentMethod: 'Bkash' });
        } catch (error) {
            alert("দুঃখিত, কিছু ভুল হয়েছে। আবার চেষ্টা করুন।");
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
            window.location.reload(); 
        } catch (error) {
            console.error(error);
        }
    };

    const modules = [
        {
            id: 1,
            title: "সেলস মাস্টারি (Sales Mastery)",
            icon: <Briefcase size={24} />,
            color: "text-blue-600",
            bg: "bg-blue-100",
            details: [
                "সেলস সাইকোলজি ও কাস্টমার বিহেভিয়ার",
                "কোল্ড কলিং এবং ইমেইল আউটরিচ",
                "নেগোসিয়েশন এবং ক্লোজিং টেকনিক",
                "অবজেকশন হ্যান্ডলিং ফ্রেমওয়ার্ক"
            ]
        },
        {
            id: 2,
            title: "বিজনেস কমিউনিকেশন",
            icon: <MessageCircle size={24} />,
            color: "text-purple-600",
            bg: "bg-purple-100",
            details: [
                "প্রফেশনাল ইমেইল এটিকেট (Etiquette)",
                "পাবলিক স্পিকিং এবং প্রেজেন্টেশন হ্যাকস",
                "বডি ল্যাঙ্গুয়েজ এবং নন-ভারবাল কমিউনিকেশন",
                "স্টোরিটেলিং ফর বিজনেস"
            ]
        },
        {
            id: 3,
            title: "প্রফেশনাল নেটওয়ার্কিং",
            icon: <Users size={24} />,
            color: "text-green-600",
            bg: "bg-green-100",
            details: [
                "লিংকডইন প্রোফাইল অপ্টিমাইজেশন (Killer Profile)",
                "পার্সোনাল ব্র্যান্ডিং স্ট্র্যাটেজি",
                "করপোরেট ইভেন্টে নেটওয়ার্কিং কৌশল",
                "মেন্টর খুঁজে বের করা এবং রিলেশনশিপ মেইনটেইন"
            ]
        },
        {
            id: 4,
            title: "ইমোশনাল ইন্টেলিজেন্স (EQ)",
            icon: <Heart size={24} />,
            color: "text-orange-600",
            bg: "bg-orange-100",
            details: [
                "কর্মক্ষেত্রে স্ট্রেস ম্যানেজমেন্ট",
                "কনফ্লিক্ট রেজোলিউশন (Conflict Resolution)",
                "এমপ্যাথি এবং লিডারশিপ",
                "ক্রিটিক্যাল থিংকিং এবং ডিসিশন মেকিং"
            ]
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen font-['Hind_Siliguri']">
            
            {/* 1. Hero Section */}
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
                    
                    <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                        <button 
                            onClick={() => setIsModalOpen(true)} 
                            className="group relative px-8 py-4 bg-blue-600 text-white font-bold rounded-full text-lg shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                এখনই ভর্তি হোন <ArrowRight size={20} />
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </button>
                    </div>
                </div>
            </section>

             {/* 4 Pillars Section (Imported from Home) */}
            <section className="py-16 md:py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent"></div>

                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="text-center mb-12 md:mb-20">
                        <div className="inline-block mb-6">
                            <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">আমাদের দর্শন</h2>
                            <div className="h-1.5 w-24 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full mx-auto mt-3"></div>
                        </div>
                        
                        <div className="max-w-3xl mx-auto mt-4 relative group">
                            <div className="relative bg-slate-900/80 backdrop-blur-xl ring-1 ring-white/10 rounded-2xl p-8 md:p-10 shadow-2xl">
                                <Quote className="absolute top-6 left-6 w-8 h-8 text-blue-500/20 rotate-180" />
                                <p className="text-slate-300 text-base md:text-xl leading-relaxed font-light">
                                    আমরা ক্যারিয়ার গঠনে <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-bold">"4 Pillars of Success"</span> বা চারটি অপরিহার্য স্তম্ভে বিশ্বাসী।
                                </p>
                                <Quote className="absolute bottom-6 right-6 w-8 h-8 text-violet-500/20" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {/* Sales */}
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg"><Briefcase className="text-white w-6 h-6" /></div>
                            <h3 className="text-lg md:text-xl font-bold mb-2">Sales</h3>
                            <p className="text-slate-400 text-sm">আইডিয়া, প্রোডাক্ট বা সার্ভিস—সবকিছুই সেল করার দক্ষতা।</p>
                        </div>
                        {/* Communication */}
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl">
                             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg"><Users className="text-white w-6 h-6" /></div>
                            <h3 className="text-lg md:text-xl font-bold mb-2">Communication</h3>
                            <p className="text-slate-400 text-sm">করপোরেট ও প্রফেশনাল কমিউনিকেশনে পারদর্শিতা।</p>
                        </div>
                        {/* Networking */}
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl">
                             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4 shadow-lg"><TrendingUp className="text-white w-6 h-6" /></div>
                            <h3 className="text-lg md:text-xl font-bold mb-2">Networking</h3>
                            <p className="text-slate-400 text-sm">সঠিক মানুষের সাথে সংযোগ তৈরি ও সম্পর্ক রক্ষা।</p>
                        </div>
                        {/* EQ */}
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl">
                             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 shadow-lg"><Target className="text-white w-6 h-6" /></div>
                            <h3 className="text-lg md:text-xl font-bold mb-2">Emotional Intelligence</h3>
                            <p className="text-slate-400 text-sm">কর্মক্ষেত্রে নিজের ও অন্যের আবেগ ব্যবস্থাপনা।</p>
                        </div>
                    </div>
                </div>
            </section>

             {/* Roadmap Section (Imported from Home) */}
             <section className="py-16 md:py-24 bg-slate-50 relative">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-3">Talent Matchmaking <span className="text-blue-600">Ecosystem</span></h2>
                        <p className="text-slate-600 text-lg">৪ মাসের একটি কমপ্লিট জার্নি</p>
                    </div>

                    <div className="max-w-5xl mx-auto relative">
                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-green-500 -translate-x-1/2 rounded-full opacity-30"></div>
                        
                        <div className="relative md:grid md:grid-cols-2 gap-12 items-center mb-12">
                            <div className="md:text-right md:pr-12">
                                <h3 className="text-xl font-bold text-slate-800 mb-2">১ম ৩ মাস: স্কিল ডেভেলপমেন্ট</h3>
                                <p className="text-slate-600 text-sm">অনলাইন ক্লাস, মেন্টরশিপ এবং ৪টি কোর স্কিল ট্রেনিং।</p>
                            </div>
                            <div className="absolute left-0 md:left-1/2 top-0 md:top-1/2 w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow -translate-x-1/2 hidden md:block"></div>
                            <div className="md:pl-12">
                                 <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Learning" className="w-full h-40 object-cover rounded-xl shadow-md" />
                            </div>
                        </div>

                        <div className="relative md:grid md:grid-cols-2 gap-12 items-center">
                             <div className="md:pr-12 order-2 md:order-1">
                                 <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Internship" className="w-full h-40 object-cover rounded-xl shadow-md" />
                            </div>
                            <div className="absolute left-0 md:left-1/2 top-0 md:top-1/2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow -translate-x-1/2 hidden md:block"></div>
                            <div className="md:pl-12 order-1 md:order-2">
                                <h3 className="text-xl font-bold text-slate-800 mb-2">শেষ ১ মাস: প্র্যাক্টিক্যাল অ্যাপ্লিকেশন</h3>
                                <p className="text-slate-600 text-sm">ইন্টার্নশিপ (অফলাইন/অনলাইন), ইন্ডাস্ট্রিয়াল ভিজিট ও জব প্লেসমেন্ট।</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

             {/* Benefits Section (Imported from Home) */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900">মেম্বারশিপ বেনিফিট</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden group">
                             <h3 className="text-2xl font-bold mb-3">গ্যারান্টেড ইন্টার্নশিপ & জব সাপোর্ট</h3>
                             <p className="text-blue-100 mb-6">কোর্স শেষে নিশ্চিত ১ মাসের ইন্টার্নশিপ ও পার্টনার কোম্পানিতে চাকরির সুযোগ।</p>
                        </div>
                        <div className="md:row-span-2 bg-gradient-to-bl from-rose-500 to-pink-600 rounded-3xl p-6 md:p-8 text-white shadow-2xl">
                             <h3 className="text-2xl font-bold mb-2">এক্সক্লুসিভ গিফট</h3>
                             <ul className="space-y-4 mt-6">
                                 <li className="flex gap-3"><span>🎁</span> <span>ওয়েলকাম কিট (টি-শার্ট, নোটবুক)</span></li>
                                 <li className="flex gap-3"><span>💳</span> <span>মেম্বারশিপ কার্ড</span></li>
                                 <li className="flex gap-3"><span>🎟️</span> <span>ইভেন্টে ২৫% ছাড়</span></li>
                             </ul>
                        </div>
                        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl">
                            <h3 className="text-xl font-bold mb-2">পার্সোনাল ব্র্যান্ডিং</h3>
                            <p className="text-violet-100 text-sm">সিভি রিভিউ, লিংকডইন অপ্টিমাইজেশন।</p>
                        </div>
                        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl">
                            <h3 className="text-xl font-bold mb-2">স্বীকৃতি</h3>
                            <p className="text-orange-100 text-sm">ভেরিফাইড সার্টিফিকেট ও অ্যাওয়ার্ড।</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Detailed Syllabus (Gated Content) */}
            <section className="py-20 bg-slate-50 relative">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">কোর্স মডিউল</h2>
                        <p className="text-slate-600 text-lg">৪টি কোর স্কিল যা আপনাকে এগিয়ে রাখবে সবার চেয়ে</p>
                    </div>

                    {!user ? (
                        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-lg relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                                <div className="bg-slate-900 p-4 rounded-full text-white mb-4 shadow-xl">
                                    <Lock size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">বিস্তারিত দেখতে লগইন করুন</h3>
                                <p className="text-slate-600 mb-6">মডিউলগুলোর বিস্তারিত জানতে আপনাকে অবশ্যই ইউজার হতে হবে।</p>
                                <button 
                                    onClick={handleGoogleLogin} 
                                    className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-lg"
                                >
                                    <LogIn size={20}/> গুগল দিয়ে লগইন করুন
                                </button>
                            </div>
                            <div className="opacity-20 blur-sm pointer-events-none select-none">
                                {modules.slice(0, 2).map((module, index) => (
                                    <div key={index} className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-4 text-left">
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">{module.title}</h3>
                                        <p className="text-slate-500">Lorem ipsum dolor sit amet consectetur...</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto grid gap-6 animate-fade-in">
                            {modules.map((module, index) => (
                                <div 
                                    key={module.id} 
                                    className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${activeModule === index ? 'border-blue-500 shadow-lg ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'}`}
                                >
                                    <div 
                                        className="p-6 md:p-8 cursor-pointer flex items-center justify-between"
                                        onClick={() => setActiveModule(activeModule === index ? null : index)}
                                    >
                                        <div className="flex items-center gap-4 md:gap-6">
                                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl ${module.bg} ${module.color} flex items-center justify-center shrink-0`}>
                                                {module.icon}
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-bold text-slate-800">{module.title}</h3>
                                        </div>
                                        <ChevronDown className={`text-slate-400 transition-transform duration-300 ${activeModule === index ? 'rotate-180' : ''}`} />
                                    </div>
                                    
                                    <div className={`px-6 md:px-8 overflow-hidden transition-all duration-300 ${activeModule === index ? 'max-h-96 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="pt-2 border-t border-slate-100">
                                            <p className="text-slate-500 text-sm mb-4 italic">কেন এই মডিউলটি শিখবেন? বিস্তারিত দেখুন...</p>
                                            <ul className="grid md:grid-cols-2 gap-4 mt-4">
                                                {module.details.map((detail, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 text-slate-600">
                                                        <div className={`mt-1.5 w-2 h-2 rounded-full ${module.color.replace('text', 'bg')}`}></div>
                                                        <span>{detail}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

             {/* Free Resources Section */}
             <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-8 border border-blue-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 text-blue-600"><FileText size={24}/></div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">ফ্রি সিভি মেকিং ও রিভিউ</h3>
                            <p className="text-slate-600 mb-6">আমাদের কোর্সে ভর্তি হলে পাচ্ছেন এক্সপার্টদের দ্বারা সিভি রিভিউ এবং প্রফেশনাল টেমপ্লেট একদম ফ্রি।</p>
                            <button className="text-blue-600 font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform cursor-default">
                                বিস্তারিত দেখুন <ArrowRight size={18}/>
                            </button>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 text-purple-600"><MonitorPlay size={24}/></div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">এক্সক্লুসিভ ফ্রি রিসোর্স</h3>
                            <p className="text-slate-600 mb-6">ইন্টারভিউ হ্যাকস, ইমেইল টেমপ্লেট এবং কর্পোরেট চেকলিস্ট ফ্রি অ্যাক্সেস।</p>
                            <button className="text-purple-600 font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform cursor-default">
                                বিস্তারিত দেখুন <ArrowRight size={18}/>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Pricing & Registration */}
            <section className="py-20 bg-[#0F172A] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                        <div className="text-white space-y-8">
                            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                                ভর্তি এবং <span className="text-blue-400">কোর্স ফি</span>
                            </h2>
                            <p className="text-slate-400 text-lg">
                                আমাদের কোর্সটি ৪টি মডিউলে বিভক্ত। আপনি একবারে পুরো ফি না দিয়ে ধাপে ধাপে পেমেন্ট করে কোর্সটি সম্পন্ন করতে পারেন।
                            </p>
                            
                            <div className="space-y-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                                <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                                    <span className="text-slate-300">অ্যাডমিশন ফি (এককালীন)</span>
                                    <span className="font-bold text-xl text-white">১,৫০০ টাকা</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                                    <span className="text-slate-300">প্রতি মডিউল ফি (৪টি মডিউল)</span>
                                    <span className="font-bold text-xl text-white">২,০০০ টাকা</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-blue-400 font-bold">ভর্তির সময় প্রদেয় (অ্যাডমিশন + ১ম মডিউল)</span>
                                    <span className="font-bold text-2xl text-blue-400">৩,৫০০ টাকা</span>
                                </div>
                            </div>
                        </div>

                        {/* Pricing Card */}
                        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl relative border-4 border-blue-500/50 transform hover:-translate-y-2 transition-transform duration-300">
                            <div className="absolute top-0 right-0 bg-blue-600 text-white px-6 py-2 rounded-bl-3xl font-bold text-sm tracking-wider uppercase">New Batch</div>
                            
                            <h3 className="text-slate-500 font-bold uppercase tracking-wider mb-4">ভর্তি ফি (১ম কিস্তি)</h3>
                            <div className="flex items-end gap-3 mb-8">
                                <span className="text-6xl font-bold text-slate-900 tracking-tight">৳ ৩,৫০০</span>
                                <span className="text-slate-500 text-sm mb-4 font-medium">(অ্যাডমিশন ১৫০০ + মডিউল ১ ২০০০)</span>
                            </div>
                            
                            <div className="space-y-4 mb-8">
                                {[
                                    'লাইফটাইম মেম্বারশিপ',
                                    '১ম মডিউলের ক্লাস এক্সেস',
                                    'স্টাডি ম্যাটেরিয়ালস',
                                    'কমিউনিটি সাপোর্ট'
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                                        <CheckCircle size={20} className="text-green-500 shrink-0"/> {item}
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={() => setIsModalOpen(true)} 
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-xl transition-all text-lg flex items-center justify-center gap-3"
                            >
                                <CreditCard size={22}/> অ্যাপ্লাই ও পেমেন্ট
                            </button>
                            <p className="text-center text-xs text-slate-500 mt-4">পরবর্তী মডিউলগুলোর ফি প্রতি মাসের শুরুতে প্রদেয়</p>
                        </div>
                    </div>
                </div>
            </section>

             {/* Registration Modal */}
             {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg relative shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">ভর্তি ফর্ম</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm hover:shadow transition-all"><X size={20}/></button>
                        </div>
                        
                        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                            <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl mb-6">
                                <p className="text-slate-700 text-sm mb-3 font-medium text-center">নিচের নাম্বারে <strong>৩,৫০০ টাকা (Send Money)</strong> করে ফর্মটি পূরণ করুন।</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-blue-100">
                                        <span className="font-bold text-pink-600 flex items-center gap-2">Bkash (Send Money)</span>
                                        <span className="font-mono text-slate-700 font-bold text-lg select-all">01954666016</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-blue-100">
                                        <span className="font-bold text-orange-600 flex items-center gap-2">Nagad (Send Money)</span>
                                        <span className="font-mono text-slate-700 font-bold text-lg select-all">01954666016</span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">আপনার নাম</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 bg-white" placeholder="পূর্ণ নাম লিখুন" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">মোবাইল</label>
                                        <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 bg-white" placeholder="01XXX..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">ইমেইল</label>
                                        <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 bg-white" placeholder="example@mail.com" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">শিক্ষা প্রতিষ্ঠান</label>
                                    <input type="text" value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 bg-white" placeholder="বিশ্ববিদ্যালয় / কলেজের নাম" />
                                </div>
                                
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-1">
                                        <label className="block text-sm font-bold text-slate-700 mb-1">মেথড</label>
                                        <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value as any})} className="w-full px-2 py-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-900">
                                            <option value="Bkash">Bkash</option>
                                            <option value="Nagad">Nagad</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Transaction ID</label>
                                        <input required type="text" value={formData.transactionId} onChange={e => setFormData({...formData, transactionId: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase placeholder-slate-400 text-slate-900 bg-white" placeholder="TrxID..." />
                                    </div>
                                </div>

                                <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg mt-4 flex items-center justify-center gap-2">
                                    {loading ? 'যাচাই করা হচ্ছে...' : 'পেমেন্ট কনফার্ম করুন'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ecosystem;