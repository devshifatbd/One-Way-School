
import React, { useState } from 'react';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { ArrowRight, CheckCircle, Briefcase, Users, MessageCircle, Star, Lock, Target, Gift, FileText, Check, ChevronDown, X, Zap, Brain, TrendingUp, ShieldCheck, AlertTriangle, SearchX, TrendingDown, AlertCircle, User as UserIcon, CheckCircle2, Layout } from 'lucide-react';
import { saveEcosystemApplication } from '../services/firebase';
import { User } from '../types';

interface EcosystemProps {
    user: User | null;
}

const Ecosystem: React.FC<EcosystemProps> = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paymentData, setPaymentData] = useState({ transactionId: '', paymentMethod: 'Bkash' });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [expandedModule, setExpandedModule] = useState<number | null>(null);

    // Login Modal Context
    const { openLoginModal } = useOutletContext<{ openLoginModal: () => void }>() || { openLoginModal: () => {} };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        
        if(!user) return;

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

    const handleLoginClick = () => {
        setIsModalOpen(false); // Close registration modal
        openLoginModal(); // Open login modal
    };

    const modules = [
        {
            id: 1,
            title: "মডিউল ১: সেলস সাইকোলজি এবং ব্রেইন হ্যাকিং",
            subtitle: "মানুষের মন পড়ার এবং যেকোনো কিছু বিক্রি করার গোপন সূত্র",
            icon: <Brain size={24} />,
            color: "text-rose-600",
            bg: "bg-rose-50",
            border: "border-rose-200",
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
            border: "border-purple-200",
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
            border: "border-blue-200",
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
            border: "border-emerald-200",
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

            {/* Reality Check Stats */}
            <section className="py-20 bg-white relative">
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <span className="inline-flex items-center gap-2 text-red-600 font-bold bg-red-50 px-4 py-1 rounded-full text-sm mb-4 border border-red-100">
                        <AlertTriangle size={16} /> Reality Check
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-12">
                        বাংলাদেশের <span className="text-red-600">বেকারত্বের</span> রূঢ় বাস্তবতা
                    </h2>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all group">
                            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition-transform">
                                <SearchX size={32}/>
                            </div>
                            <h3 className="text-4xl font-bold text-slate-800 mb-2">৪৭%</h3>
                            <p className="text-slate-600 font-medium">শিক্ষিত গ্র্যাজুয়েট বেকার</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all group">
                            <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
                                <TrendingDown size={32}/>
                            </div>
                            <h3 className="text-4xl font-bold text-slate-800 mb-2">৮ লক্ষ+</h3>
                            <p className="text-slate-600 font-medium">প্রতি বছর নতুন চাকরিপ্রার্থী</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all group">
                            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                                <ShieldCheck size={32}/>
                            </div>
                            <h3 className="text-4xl font-bold text-slate-800 mb-2">৩০%</h3>
                            <p className="text-slate-600 font-medium">কোম্পানির দক্ষ লোকবলের অভাব</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Ecosystem? (Features) */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">কেন Ecosystem Pro?</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">কারণ গতানুগতিক কোর্স করে সার্টিফিকেট জমানোর দিন শেষ। এখন যুগ দক্ষতার।</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4"><Zap size={24}/></div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2">হ্যান্ডস-অন ট্রেনিং</h4>
                            <p className="text-sm text-slate-500">শুধুমাত্র ভিডিও লেকচার নয়, রিয়েল লাইফ অ্যাসাইনমেন্ট এবং প্র্যাকটিক্যাল টাস্ক।</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4"><Users size={24}/></div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2">ইন্ডাস্ট্রি মেন্টর</h4>
                            <p className="text-sm text-slate-500">ক্লাস নিবেন দেশের স্বনামধন্য কোম্পানির এইচআর এবং ডিপার্টমেন্ট হেডরা।</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4"><Briefcase size={24}/></div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2">গ্যারান্টেড ইন্টার্নশিপ</h4>
                            <p className="text-sm text-slate-500">কোর্স শেষে পার্টনার কোম্পানিতে নিশ্চিত ইন্টার্নশিপের সুযোগ।</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-4"><Layout size={24}/></div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2">সিভি & পোর্টফোলিও</h4>
                            <p className="text-sm text-slate-500">প্রফেশনাল সিভি রাইটিং এবং পোর্টফোলিও মেকিং ওয়ার্কশপ।</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Course Modules Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-16">
                        <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">Course Curriculum</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mt-2 mb-4">কী শিখবেন আপনি?</h2>
                        <p className="text-slate-600">৪টি পাওয়ার-প্যাকড মডিউল যা আপনাকে বদলে দিবে</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {modules.map((module) => (
                            <div 
                                key={module.id} 
                                className={`rounded-3xl border transition-all duration-300 hover:shadow-xl ${module.bg} ${module.border} overflow-hidden group`}
                            >
                                <div className="p-8 cursor-pointer" onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex gap-4">
                                            <div className={`w-14 h-14 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm ${module.color}`}>
                                                {module.icon}
                                            </div>
                                            <div>
                                                <h3 className={`text-xl font-bold mb-1 ${module.color}`}>{module.title}</h3>
                                                <p className="text-slate-600 text-sm font-medium">{module.subtitle}</p>
                                            </div>
                                        </div>
                                        <div className={`p-2 rounded-full bg-white/50 transition-transform duration-300 ${expandedModule === module.id ? 'rotate-180' : ''}`}>
                                            <ChevronDown size={20} className="text-slate-500"/>
                                        </div>
                                    </div>
                                    
                                    <div className={`grid transition-all duration-500 ease-in-out ${expandedModule === module.id ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0'}`}>
                                        <div className="overflow-hidden">
                                            <div className="bg-white/60 rounded-2xl p-6 backdrop-blur-sm">
                                                <ul className="space-y-3">
                                                    {module.details.map((item, idx) => (
                                                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                                                            <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${module.color}`}/>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing / CTA Section */}
            <section className="py-20 bg-[#1E293B] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]"></div>
                
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">আপনার সিট নিশ্চিত করুন</h2>
                    <p className="text-slate-300 mb-10 max-w-2xl mx-auto">
                        প্রতি ব্যাচে আসন সংখ্যা সীমিত। আমাদের পরবর্তী ব্যাচের ক্লাস শুরু হতে যাচ্ছে খুব শীঘ্রই।
                    </p>
                    
                    <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-left w-full max-w-sm">
                            <p className="text-sm text-slate-400 uppercase font-bold mb-1">ভর্তি ফি (লাইফটাইম মেম্বারশিপ)</p>
                            <h3 className="text-3xl font-bold text-white mb-4">১,৫০০ টাকা</h3>
                            <ul className="space-y-2 text-sm text-slate-300 mb-6">
                                <li className="flex gap-2"><Check size={16} className="text-green-400"/> লাইফটাইম এক্সেস</li>
                                <li className="flex gap-2"><Check size={16} className="text-green-400"/> ওয়েলকাম কিট</li>
                                <li className="flex gap-2"><Check size={16} className="text-green-400"/> আইডি কার্ড</li>
                            </ul>
                        </div>
                        
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-2xl text-left w-full max-w-sm shadow-xl transform scale-105 border border-white/20">
                            <div className="absolute top-4 right-4 bg-yellow-400 text-slate-900 text-xs font-bold px-2 py-1 rounded">POPULAR</div>
                            <p className="text-sm text-blue-100 uppercase font-bold mb-1">১ম মডিউল ফি</p>
                            <h3 className="text-3xl font-bold text-white mb-4">২,০০০ টাকা</h3>
                            <ul className="space-y-2 text-sm text-blue-50 mb-6">
                                <li className="flex gap-2"><Check size={16}/> ৮টি লাইভ ক্লাস</li>
                                <li className="flex gap-2"><Check size={16}/> মেন্টরশিপ সেশন</li>
                                <li className="flex gap-2"><Check size={16}/> প্র্যাকটিক্যাল টাস্ক</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12">
                        <button onClick={() => setIsModalOpen(true)} className="bg-white text-slate-900 px-10 py-4 rounded-full font-bold text-xl hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2 mx-auto">
                            এখনই পেমেন্ট করুন <ArrowRight size={24}/>
                        </button>
                        <p className="mt-4 text-sm text-slate-400">সর্বমোট ৩,৫০০ টাকা দিয়ে যাত্রা শুরু করুন</p>
                    </div>
                </div>
            </section>

            {/* Registration Modal */}
             {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg relative shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">ভর্তি প্রক্রিয়া</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm hover:shadow transition-all"><X size={20}/></button>
                        </div>
                        
                        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                            {!user ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"><Lock size={32}/></div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">লগইন প্রয়োজন</h3>
                                    <p className="text-slate-500 mb-6 px-4">ভর্তি সম্পন্ন করতে অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন।</p>
                                    <button onClick={handleLoginClick} className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition flex justify-center items-center gap-2 shadow-lg">
                                        লগইন করুন <ArrowRight size={18}/>
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
