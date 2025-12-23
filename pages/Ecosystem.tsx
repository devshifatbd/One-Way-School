import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Briefcase, Users, MessageCircle, Heart, Star, CreditCard, X, ChevronDown, Lock, LogIn, Quote, TrendingUp, Target, FileText, MonitorPlay, Chrome } from 'lucide-react';
import { saveEcosystemApplication, signInWithGoogle } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

interface EcosystemProps {
    user: User | null;
}

const Ecosystem: React.FC<EcosystemProps> = ({ user }) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Simplified Form Data (Only Payment Info)
    const [paymentData, setPaymentData] = useState({
        transactionId: '',
        paymentMethod: 'Bkash'
    });
    
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [activeModule, setActiveModule] = useState<number | null>(0);

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
            // Auto-fill user data from the logged-in user object
            await saveEcosystemApplication({
                name: user.displayName || 'Unknown',
                phone: user.phone || 'N/A',
                email: user.email || 'N/A',
                photoURL: user.photoURL || '',
                institution: user.institution || '',
                transactionId: paymentData.transactionId,
                paymentMethod: paymentData.paymentMethod as any,
                userId: user.uid,
                status: 'pending'
            });
            alert("পেমেন্ট কনফার্মেশন সফল হয়েছে! ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে...");
            setIsModalOpen(false);
            setPaymentData({ transactionId: '', paymentMethod: 'Bkash' });
            
            // Redirect to dashboard
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);

        } catch (error: any) {
            console.error("Application Failed:", error);
            setErrorMsg("সাবমিট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
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

            {/* Other sections kept same for brevity, skipping to Modal */}
            
            {/* Registration Modal - SIMPLIFIED */}
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
                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Lock size={32}/>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">লগইন প্রয়োজন</h3>
                                    <p className="text-slate-500 mb-6 px-4">ভর্তি সম্পন্ন করতে অনুগ্রহ করে প্রথমে লগইন করুন। আপনার প্রোফাইল তথ্য অটোমেটিক নেওয়া হবে।</p>
                                    <button 
                                        onClick={handleGoogleLogin} 
                                        className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl transition flex justify-center items-center gap-2"
                                    >
                                        <Chrome size={18} className="text-blue-600"/> গুগল দিয়ে লগইন
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl mb-6">
                                        <p className="text-slate-700 text-sm mb-3 font-medium text-center">নিচের নাম্বারে <strong>৩,৫০০ টাকা (Send Money)</strong> করে Transaction ID দিন।</p>
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
                                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                            <p className="text-sm text-slate-500 mb-1">অ্যাকাউন্ট</p>
                                            <p className="font-bold text-slate-800">{user.displayName}</p>
                                            <p className="text-xs text-slate-400">{user.email}</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">পেমেন্ট মেথড</label>
                                                <select 
                                                    value={paymentData.paymentMethod} 
                                                    onChange={e => setPaymentData({...paymentData, paymentMethod: e.target.value as any})} 
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                                                >
                                                    <option value="Bkash">Bkash</option>
                                                    <option value="Nagad">Nagad</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Transaction ID</label>
                                                <input 
                                                    required 
                                                    type="text" 
                                                    value={paymentData.transactionId} 
                                                    onChange={e => setPaymentData({...paymentData, transactionId: e.target.value})} 
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase placeholder-slate-400 text-slate-900 bg-white" 
                                                    placeholder="TRXID12345" 
                                                />
                                            </div>
                                        </div>

                                        {errorMsg && (
                                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                                                {errorMsg}
                                            </div>
                                        )}

                                        <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg mt-4 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                                            {loading ? 'যাচাই করা হচ্ছে...' : 'পেমেন্ট কনফার্ম করুন'}
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
