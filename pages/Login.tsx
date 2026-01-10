
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, ChevronLeft, Calendar, LogIn, UserPlus, Key, ArrowLeft, Home } from 'lucide-react';
import { signInWithGoogle, signInWithFacebook, loginWithEmail, registerWithEmail, resetPassword } from '../services/firebase';
import { User } from '../types';

interface LoginPageProps {
    user: User | null;
}

const Login: React.FC<LoginPageProps> = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as any)?.from?.pathname || '/dashboard';

    const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
    const [isEventMode, setIsEventMode] = useState(false);
    
    // Auth Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // If user is already logged in, redirect away
    useEffect(() => {
        if (user) {
            navigate(from, { replace: true });
        }
    }, [user, navigate, from]);

    // Custom Error Message Helper
    const getFriendlyErrorMessage = (errorCode: string) => {
        switch (errorCode) {
            case 'auth/invalid-email':
                return "অনুগ্রহ করে সঠিক ইমেইল এড্রেস প্রদান করুন।";
            case 'auth/user-disabled':
                return "দুঃখিত, এই অ্যাকাউন্টটি স্থগিত করা হয়েছে।";
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                return "আপনার দেওয়া ইমেইল অথবা পাসওয়ার্ডটি সঠিক নয়।";
            case 'auth/email-already-in-use':
                return "এই ইমেইল এড্রেস দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট খোলা হয়েছে।";
            case 'auth/weak-password':
                return "পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে।";
            case 'auth/network-request-failed':
                return "ইন্টারনেট সংযোগ বিচ্ছিন্ন হয়েছে। দয়া করে সংযোগ চেক করুন।";
            case 'auth/popup-closed-by-user':
                return "লগইন উইন্ডোটি বন্ধ করা হয়েছে। আবার চেষ্টা করুন।";
            default:
                return "কিছু একটা সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।";
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try {
            await signInWithGoogle();
        } catch (e: any) {
            setError(getFriendlyErrorMessage(e.code));
        }
    };

    const handleFacebookLogin = async () => {
        setError('');
        try {
            await signInWithFacebook();
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
                if (isEventMode && loggedInUser.email !== 'onewayschool.bd@gmail.com') {
                    setError("দুঃখিত, এটি শুধুমাত্র ইভেন্ট এডমিনদের জন্য।");
                    return;
                }
                if (isEventMode) navigate('/event-dashboard');
            } else if (view === 'register') {
                await registerWithEmail(name, email, password);
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

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-['Hind_Siliguri'] relative overflow-hidden">
            {/* Home Back Button */}
            <Link 
                to="/" 
                className="fixed top-6 left-6 flex items-center gap-2 bg-white px-5 py-2.5 rounded-full text-slate-700 font-bold shadow-sm hover:shadow-md transition-all group z-50 border border-slate-100"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span>হোমে ফিরে যান</span>
            </Link>

            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>

            <div className="bg-white rounded-[40px] w-full max-w-[450px] p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)] relative z-10 border border-white/50 animate-fade-in">
                <div className="text-center mb-10">
                    <img src="https://iili.io/f3k62rG.md.png" alt="OWS Logo" className="h-12 mx-auto mb-6 drop-shadow-sm cursor-pointer" onClick={() => navigate('/')} />
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        {isEventMode ? 'ইভেন্ট এডমিন লগইন' : (view === 'login' ? 'স্বাগতম!' : view === 'register' ? 'নতুন অ্যাকাউন্ট' : 'পাসওয়ার্ড উদ্ধার')}
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {isEventMode ? 'ইভেন্ট ড্যাশবোর্ড ম্যানেজ করতে লগইন করুন' : (view === 'login' ? 'আপনার অ্যাকাউন্টে সাইন ইন করুন' : (view === 'register' ? 'আজই আমাদের কমিউনিটিতে যোগ দিন' : 'আপনার ইমেইল দিয়ে রিসেট লিংক নিন'))}
                    </p>
                </div>

                {/* Social Login Options */}
                {(view === 'login' || view === 'register') && !isEventMode && (
                    <div className="flex justify-center gap-4 mb-8">
                        <button onClick={handleGoogleLogin} className="w-14 h-14 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 bg-white shadow-sm" title="Google Login">
                            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" className="w-6 h-6" alt="Google"/>
                        </button>
                        <button onClick={handleFacebookLogin} className="w-14 h-14 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 bg-white shadow-sm" title="Facebook Login">
                            <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-6 h-6" alt="Facebook"/>
                        </button>
                        <button onClick={() => setIsEventMode(true)} className="w-14 h-14 rounded-full border border-purple-100 flex items-center justify-center hover:bg-purple-50 transition-all hover:scale-105 active:scale-95 bg-white shadow-sm" title="Event Admin Login">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </button>
                    </div>
                )}

                {isEventMode && (
                    <div className="mb-6 flex justify-center">
                        <button onClick={() => setIsEventMode(false)} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold">
                            <ChevronLeft size={16}/> সাধারণ লগইনে ফিরে যান
                        </button>
                    </div>
                )}

                {/* Divider */}
                {!isEventMode && view !== 'forgot' && (
                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                        <div className="relative flex justify-center text-[10px] font-bold text-slate-400 uppercase tracking-widest"><span className="px-4 bg-white">অথবা</span></div>
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-5">
                    {view === 'register' && (
                        <div>
                            <label className="text-xs font-bold text-slate-900 ml-1 mb-1.5 block uppercase tracking-wider">আপনার নাম</label>
                            <input type="text" placeholder="পুরো নাম লিখুন" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 transition-all" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                    )}
                    
                    <div>
                        <label className="text-xs font-bold text-slate-900 ml-1 mb-1.5 block uppercase tracking-wider">ইমেইল এড্রেস</label>
                        <input type="email" placeholder="example@email.com" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 transition-all" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>

                    {view !== 'forgot' && (
                        <div>
                            <div className="flex justify-between items-center mb-1.5 px-1">
                                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">পাসওয়ার্ড</label>
                                {view === 'login' && (
                                    <button type="button" onClick={() => setView('forgot')} className="text-[10px] font-bold text-blue-600 hover:underline">পাসওয়ার্ড ভুলে গেছেন?</button>
                                )}
                            </div>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} placeholder="পাসওয়ার্ড দিন" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 transition-all" value={password} onChange={e => setPassword(e.target.value)} required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2">
                                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-xs text-center bg-red-50 p-4 rounded-xl font-bold animate-shake border border-red-100">{error}</p>}
                    {successMsg && <p className="text-green-600 text-xs text-center bg-green-50 p-4 rounded-xl font-bold border border-green-100">{successMsg}</p>}

                    <button type="submit" disabled={loading} className={`w-full text-white font-bold py-4 rounded-2xl transition-all shadow-xl active:scale-[0.98] text-lg flex items-center justify-center gap-2 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#2B3674] hover:bg-blue-700 shadow-blue-900/10'}`}>
                        {loading ? 'প্রক্রিয়াধীন...' : (view === 'login' ? <><LogIn size={20}/> সাইন ইন</> : view === 'register' ? <><UserPlus size={20}/> অ্যাকাউন্ট খুলুন</> : <><Key size={20}/> রিসেট লিংক পাঠান</>)}
                    </button>
                </form>

                <div className="text-center mt-10">
                    <p className="text-slate-500 text-sm">
                        {view === 'login' ? "অ্যাকাউন্ট নেই? " : "অ্যাকাউন্ট আছে? "}
                        <button onClick={() => { setView(view === 'login' ? 'register' : 'login'); setError(''); setSuccessMsg(''); }} className="text-blue-600 font-bold hover:underline ml-1">
                            {view === 'login' ? 'রেজিস্ট্রেশন করুন' : 'লগইন করুন'}
                        </button>
                    </p>
                    {view === 'forgot' && (
                        <button onClick={() => setView('login')} className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-800 flex items-center justify-center gap-1 mx-auto">
                            <ChevronLeft size={14}/> লগইন পেজে ফিরে যান
                        </button>
                    )}
                </div>
            </div>
            
            {/* Footer-like text for login page */}
            <p className="fixed bottom-6 text-slate-400 text-xs font-medium">© 2025 One Way School - Secure Auth Portal</p>
        </div>
    );
};

export default Login;
