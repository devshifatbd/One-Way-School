
import React, { useState } from 'react';
import { Eye, EyeOff, Calendar, LogIn, UserPlus, Key, ChevronLeft, X, ShieldCheck, LayoutDashboard, Ticket, UserCog, Briefcase } from 'lucide-react';
import { signInWithGoogle, signInWithFacebook, loginWithEmail, registerWithEmail, resetPassword, getUserProfile } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
    
    // Admin Selection States
    const [showAdminSelection, setShowAdminSelection] = useState(false);
    const [selectedAdminType, setSelectedAdminType] = useState<'event' | 'job' | null>(null);
    
    // Auth Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const ADMIN_EMAILS = ['onewayschool.bd@gmail.com', 'onewayschool.bd@gamil.com', 'admin@ows.com'];

    // Custom Error Message Helper
    const getFriendlyErrorMessage = (errorCode: string) => {
        switch (errorCode) {
            case 'auth/invalid-email': return "অনুগ্রহ করে সঠিক ইমেইল এড্রেস প্রদান করুন।";
            case 'auth/user-disabled': return "দুঃখিত, এই অ্যাকাউন্টটি স্থগিত করা হয়েছে।";
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential': return "আপনার দেওয়া ইমেইল অথবা পাসওয়ার্ডটি সঠিক নয়।";
            case 'auth/email-already-in-use': return "এই ইমেইল এড্রেস দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট খোলা হয়েছে।";
            case 'auth/weak-password': return "পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে।";
            case 'auth/network-request-failed': return "ইন্টারনেট সংযোগ বিচ্ছিন্ন হয়েছে। দয়া করে সংযোগ চেক করুন।";
            case 'auth/popup-closed-by-user': return "লগইন উইন্ডোটি বন্ধ করা হয়েছে। আবার চেষ্টা করুন।";
            default: return "কিছু একটা সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।";
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try {
            await signInWithGoogle();
            onClose();
        } catch (e: any) {
            setError(getFriendlyErrorMessage(e.code));
        }
    };

    const handleFacebookLogin = async () => {
        setError('');
        try {
            await signInWithFacebook();
            onClose();
        } catch (e: any) {
            setError(getFriendlyErrorMessage(e.code));
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (view === 'login') {
                const loggedInUser = await loginWithEmail(email, password);
                
                // Admin Routing Logic based on selection
                if (selectedAdminType) {
                    // Fetch profile to check role
                    let isAdmin = false;
                    try {
                        const profile = await getUserProfile(loggedInUser.uid);
                        const role = profile?.role;
                        const isHardcodedAdmin = loggedInUser.email && ADMIN_EMAILS.includes(loggedInUser.email);
                        isAdmin = !!(isHardcodedAdmin || role === 'admin' || role === 'moderator' || role === 'super_admin');
                    } catch (err) {
                        console.error("Profile fetch error", err);
                    }

                    if (isAdmin) {
                        if (selectedAdminType === 'event') {
                            navigate('/event-dashboard');
                        } else if (selectedAdminType === 'job') {
                            navigate('/admin'); // Main/Job Dashboard
                        }
                        onClose();
                    } else {
                        setError("দুঃখিত, আপনার এই ড্যাশবোর্ডে প্রবেশ করার অনুমতি নেই।");
                        setLoading(false);
                        return;
                    }
                } else {
                    // Normal User Login
                    onClose();
                }
            } else if (view === 'register') {
                await registerWithEmail(name, email, password);
                onClose();
            } else {
                await resetPassword(email);
                setSuccessMsg("পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।");
            }
        } catch (e: any) {
            setError(getFriendlyErrorMessage(e.code));
        } finally {
            setLoading(false);
        }
    };

    const resetState = () => {
        setShowAdminSelection(false);
        setSelectedAdminType(null);
        setView('login');
        setError('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-['Hind_Siliguri']">
            <div className="bg-white rounded-[40px] w-full max-w-[450px] p-8 md:p-10 shadow-2xl relative animate-fade-in-up border border-white/50 max-h-[90vh] overflow-y-auto custom-scrollbar">
                
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                    <X size={20} />
                </button>

                <div className="text-center mb-8">
                    <img src="https://iili.io/f3k62rG.md.png" alt="OWS Logo" className="h-10 mx-auto mb-4 drop-shadow-sm" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">
                        {showAdminSelection && !selectedAdminType ? 'প্যানেল নির্বাচন করুন' : 
                         selectedAdminType === 'event' ? 'ইভেন্ট এডমিন লগইন' : 
                         selectedAdminType === 'job' ? 'জব পোর্টাল এডমিন' : 
                         (view === 'login' ? 'স্বাগতম!' : view === 'register' ? 'নতুন অ্যাকাউন্ট' : 'পাসওয়ার্ড উদ্ধার')}
                    </h1>
                    <p className="text-slate-500 text-xs">
                        {showAdminSelection && !selectedAdminType ? 'আপনি কোথায় লগইন করতে চান?' : 
                         selectedAdminType ? 'সিস্টেম ম্যানেজ করতে লগইন করুন' : 
                         (view === 'login' ? 'আপনার অ্যাকাউন্টে সাইন ইন করুন' : (view === 'register' ? 'আজই আমাদের কমিউনিটিতে যোগ দিন' : 'আপনার ইমেইল দিয়ে রিসেট লিংক নিন'))}
                    </p>
                </div>

                {/* --- 1. ADMIN SELECTION SCREEN (Step 1) --- */}
                {showAdminSelection && !selectedAdminType ? (
                    <div className="space-y-4">
                        <button onClick={() => setSelectedAdminType('event')} className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50 transition-all group text-left shadow-sm hover:shadow-md">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                <Ticket size={24}/>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">ইভেন্ট ড্যাশবোর্ড</h3>
                                <p className="text-xs text-slate-500">ইভেন্ট এবং ওয়ার্কশপ ম্যানেজমেন্ট</p>
                            </div>
                        </button>

                        <button onClick={() => setSelectedAdminType('job')} className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group text-left shadow-sm hover:shadow-md">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <Briefcase size={24}/>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">জব পোর্টাল</h3>
                                <p className="text-xs text-slate-500">জব, ব্লগ এবং স্টুডেন্ট ম্যানেজমেন্ট</p>
                            </div>
                        </button>

                        <div className="mt-6 flex justify-center">
                            <button onClick={resetState} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold">
                                <ChevronLeft size={14}/> সাধারণ লগইনে ফিরে যান
                            </button>
                        </div>
                    </div>
                ) : (
                    /* --- 2. LOGIN FORM (Standard or Admin Specific) --- */
                    <>
                        {/* Social Login Options (Only for Normal Login View) */}
                        {(view === 'login' || view === 'register') && !selectedAdminType && (
                            <div className="flex justify-center gap-4 mb-6">
                                <button onClick={handleGoogleLogin} className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 bg-white shadow-sm" title="Google Login">
                                    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" className="w-5 h-5" alt="Google"/>
                                </button>
                                <button onClick={handleFacebookLogin} className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 bg-white shadow-sm" title="Facebook Login">
                                    <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5" alt="Facebook"/>
                                </button>
                                {/* Admin Entry Point Icon */}
                                <button onClick={() => setShowAdminSelection(true)} className="w-12 h-12 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center hover:bg-slate-200 transition-all hover:scale-105 active:scale-95 shadow-sm group" title="Admin Login">
                                    <UserCog className="w-5 h-5 text-slate-500 group-hover:text-slate-800" />
                                </button>
                            </div>
                        )}

                        {/* Back Button for Admin Login Mode */}
                        {selectedAdminType && (
                            <div className="mb-6 flex justify-center">
                                <button onClick={() => setSelectedAdminType(null)} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold">
                                    <ChevronLeft size={14}/> ফিরে যান
                                </button>
                            </div>
                        )}

                        {/* Divider */}
                        {!selectedAdminType && view !== 'forgot' && (
                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                                <div className="relative flex justify-center text-[10px] font-bold text-slate-400 uppercase tracking-widest"><span className="px-3 bg-white">অথবা</span></div>
                            </div>
                        )}

                        <form onSubmit={handleAuth} className="space-y-4">
                            {view === 'register' && !selectedAdminType && (
                                <div>
                                    <label className="text-xs font-bold text-slate-900 ml-1 mb-1 block uppercase tracking-wider">আপনার নাম</label>
                                    <input type="text" placeholder="পুরো নাম লিখুন" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 transition-all" value={name} onChange={e => setName(e.target.value)} required />
                                </div>
                            )}
                            
                            <div>
                                <label className="text-xs font-bold text-slate-900 ml-1 mb-1 block uppercase tracking-wider">ইমেইল এড্রেস</label>
                                <input type="email" placeholder="example@email.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 transition-all" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>

                            {view !== 'forgot' && (
                                <div>
                                    <div className="flex justify-between items-center mb-1 px-1">
                                        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">পাসওয়ার্ড</label>
                                        {view === 'login' && !selectedAdminType && (
                                            <button type="button" onClick={() => setView('forgot')} className="text-[10px] font-bold text-blue-600 hover:underline">পাসওয়ার্ড ভুলে গেছেন?</button>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} placeholder="পাসওয়ার্ড দিন" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 transition-all" value={password} onChange={e => setPassword(e.target.value)} required />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
                                            {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {error && <p className="text-red-500 text-xs text-center bg-red-50 p-3 rounded-xl font-bold animate-shake border border-red-100">{error}</p>}
                            {successMsg && <p className="text-green-600 text-xs text-center bg-green-50 p-3 rounded-xl font-bold border border-green-100">{successMsg}</p>}

                            <button type="submit" disabled={loading} className={`w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-xl active:scale-[0.98] text-sm flex items-center justify-center gap-2 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#2B3674] hover:bg-blue-700 shadow-blue-900/10'}`}>
                                {loading ? 'প্রক্রিয়াধীন...' : (view === 'login' ? <><LogIn size={18}/> সাইন ইন</> : view === 'register' ? <><UserPlus size={18}/> অ্যাকাউন্ট খুলুন</> : <><Key size={18}/> রিসেট লিংক পাঠান</>)}
                            </button>
                        </form>

                        {!selectedAdminType && (
                            <div className="text-center mt-6">
                                <p className="text-slate-500 text-xs">
                                    {view === 'login' ? "অ্যাকাউন্ট নেই? " : "অ্যাকাউন্ট আছে? "}
                                    <button onClick={() => { setView(view === 'login' ? 'register' : 'login'); setError(''); setSuccessMsg(''); }} className="text-blue-600 font-bold hover:underline ml-1">
                                        {view === 'login' ? 'রেজিস্ট্রেশন করুন' : 'লগইন করুন'}
                                    </button>
                                </p>
                                {view === 'forgot' && (
                                    <button onClick={() => setView('login')} className="mt-3 text-xs font-bold text-slate-400 hover:text-slate-800 flex items-center justify-center gap-1 mx-auto">
                                        <ChevronLeft size={14}/> লগইন পেজে ফিরে যান
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default LoginModal;
