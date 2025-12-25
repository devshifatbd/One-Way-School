import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { User } from '../types';
import { signInWithGoogle, signInWithFacebook, logout, loginWithEmail, registerWithEmail, resetPassword } from '../services/firebase';

interface NavbarProps {
    user: User | null;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
    
    // Auth Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    // Admin Emails List (Should match AdminDashboard)
    const ADMIN_EMAILS = ['onewayschool.bd@gmail.com', 'onewayschool.bd@gamil.com'];
    const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const scrollToTop = () => {
        setIsMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDashboardClick = () => {
        if (isAdmin) {
            navigate('/admin');
        } else {
            navigate('/dashboard');
        }
        setIsMenuOpen(false);
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setName('');
        setError('');
        setSuccessMsg('');
        setView('login');
    };

    const handleGoogleLogin = async () => {
        try {
            const loggedInUser = await signInWithGoogle();
            setIsLoginModalOpen(false);
            if (loggedInUser.email && ADMIN_EMAILS.includes(loggedInUser.email)) {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (e: any) { 
            console.error(e);
            setError(e.message || "Google Login Failed. Check console."); 
        }
    };

    const handleFacebookLogin = async () => {
        try {
            const loggedInUser = await signInWithFacebook();
            setIsLoginModalOpen(false);
            if (loggedInUser.email && ADMIN_EMAILS.includes(loggedInUser.email)) {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (e: any) { 
            console.error(e);
            setError("Facebook Login Failed. Ensure Facebook Provider is enabled in Firebase."); 
        }
    };

    const handleUserAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            let loggedInUser;
            if (view === 'login') {
                loggedInUser = await loginWithEmail(email, password);
            } else {
                loggedInUser = await registerWithEmail(name, email, password);
            }
            
            setIsLoginModalOpen(false);
            resetForm();
            
            if (loggedInUser.email && ADMIN_EMAILS.includes(loggedInUser.email)) {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Authentication failed");
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        if (!email) {
            setError("Please enter your email address.");
            return;
        }
        try {
            await resetPassword(email);
            setSuccessMsg("Password reset email sent! Check your inbox.");
        } catch (e: any) {
            setError(e.message || "Failed to send reset email.");
        }
    };

    return (
        <>
            <header className="fixed w-full top-0 z-50 pt-4 px-4 md:pt-6 transition-all duration-300">
                <div className="container mx-auto">
                    <div className="nav-pill rounded-full px-4 py-2 md:px-6 md:py-3 flex justify-between items-center max-w-6xl mx-auto">
                        
                        {/* Logo */}
                        <Link to="/" onClick={scrollToTop} className="cursor-pointer flex items-center gap-2 pl-2">
                            <img src="https://iili.io/f3k62rG.md.png" alt="OWS Logo" className="h-8 md:h-10 object-contain drop-shadow-sm hover:scale-105 transition-transform" />
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center space-x-1 bg-slate-100/50 rounded-full px-2 py-1 border border-white/50">
                            <Link to="/" onClick={scrollToTop} className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all duration-300">হোম</Link>
                            <Link to="/about" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all duration-300">আমাদের সম্পর্কে</Link>
                            <Link to="/ecosystem" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all duration-300">ইকোসিস্টেম</Link>
                            <Link to="/community" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all duration-300">কমিউনিটি</Link>
                            <Link to="/jobs" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-white transition-all duration-300">জবস</Link>
                            <Link to="/blog" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all duration-300">ব্লগ</Link>
                        </nav>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            {user ? (
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={handleDashboardClick} 
                                        className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm"
                                    >
                                        <LayoutDashboard size={16} />
                                        <span>ড্যাশবোর্ড</span>
                                    </button>

                                    <button onClick={() => { logout(); navigate('/'); }} className="p-2 rounded-full bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors" title="Logout">
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => setIsLoginModalOpen(true)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-sm px-3 py-2 hover:bg-slate-100 rounded-full transition-all">
                                    <UserIcon size={16} /> লগইন
                                </button>
                            )}

                            {/* Mobile Toggle */}
                            <button className="md:hidden w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full text-slate-800 hover:bg-slate-200 transition-colors" onClick={toggleMenu}>
                                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="absolute top-full left-0 w-full px-4 mt-2 transition-all duration-300 origin-top animate-fade-in-down">
                        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 flex flex-col space-y-3 max-w-6xl mx-auto">
                            {user && (
                                <div 
                                    onClick={handleDashboardClick} 
                                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl mb-2 cursor-pointer shadow-sm active:scale-95 transition-transform"
                                >
                                    <div className="bg-white p-2 rounded-full text-blue-600 shadow-sm">
                                        <LayoutDashboard size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-lg">ড্যাশবোর্ড</p>
                                        <p className="text-xs text-slate-500">{isAdmin ? 'এডমিন প্যানেল' : 'প্রোফাইল দেখুন'}</p>
                                    </div>
                                </div>
                            )}
                            <Link to="/" onClick={scrollToTop} className="text-left text-base font-medium text-slate-800 hover:text-blue-600 p-3 rounded-xl hover:bg-blue-50 transition-colors">হোম</Link>
                            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-left text-base font-medium text-slate-800 hover:text-blue-600 p-3 rounded-xl hover:bg-blue-50 transition-colors">আমাদের সম্পর্কে</Link>
                            <Link to="/ecosystem" onClick={() => setIsMenuOpen(false)} className="text-left text-base font-medium text-slate-800 hover:text-blue-600 p-3 rounded-xl hover:bg-blue-50 transition-colors">ইকোসিস্টেম</Link>
                            <Link to="/community" onClick={() => setIsMenuOpen(false)} className="text-left text-base font-medium text-slate-800 hover:text-blue-600 p-3 rounded-xl hover:bg-blue-50 transition-colors">কমিউনিটি</Link>
                            <Link to="/jobs" onClick={() => setIsMenuOpen(false)} className="text-left text-base font-medium text-slate-800 hover:text-blue-600 p-3 rounded-xl hover:bg-blue-50 transition-colors">জবস</Link>
                            <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="text-left text-base font-medium text-slate-800 hover:text-blue-600 p-3 rounded-xl hover:bg-blue-50 transition-colors">ব্লগ</Link>
                        </div>
                    </div>
                )}
            </header>

            {/* Login Modal - Aura Style Updated */}
            {isLoginModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#F5F5F5]/90 backdrop-blur-sm animate-fade-in font-sans">
                    <div className="bg-white rounded-[32px] w-full max-w-[420px] p-8 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] relative border border-white/50">
                        <button onClick={() => {setIsLoginModalOpen(false); resetForm();}} className="absolute top-6 right-6 text-slate-300 hover:text-slate-600 transition-colors">
                            <X size={24}/>
                        </button>
                        
                        <div className="text-center mb-8">
                            <div className="flex flex-col items-center justify-center mb-4">
                                 {/* OWS Logo */}
                                 <img src="https://iili.io/f3k62rG.md.png" alt="OWS Logo" className="h-10 object-contain mb-3 drop-shadow-sm" />
                            </div>
                            
                            <h2 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">
                                {view === 'login' && 'Welcome back'}
                                {view === 'register' && 'Create account'}
                                {view === 'forgot' && 'Reset Password'}
                            </h2>
                            <p className="text-slate-500 text-sm">
                                {view === 'login' && 'Please enter your details to sign in'}
                                {view === 'register' && 'Join the community today'}
                                {view === 'forgot' && 'Enter email to receive reset link'}
                            </p>
                        </div>

                        {/* Login / Register View */}
                        {(view === 'login' || view === 'register') && (
                            <>
                                {/* Social Buttons (Real Logos) */}
                                <div className="flex justify-center gap-4 mb-8">
                                    <button onClick={handleGoogleLogin} className="w-14 h-14 rounded-full border border-[#E5E7EB] flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 group bg-white shadow-sm">
                                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" className="w-6 h-6" alt="Google"/>
                                    </button>
                                    <button onClick={handleFacebookLogin} className="w-14 h-14 rounded-full border border-[#E5E7EB] flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 group bg-white shadow-sm">
                                        <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-6 h-6" alt="Facebook"/>
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E5E7EB]"></div></div>
                                    <div className="relative flex justify-center text-[10px] font-bold text-slate-400 uppercase tracking-widest"><span className="px-4 bg-white">OR</span></div>
                                </div>

                                {/* Auth Form */}
                                <form onSubmit={handleUserAuth} className="space-y-4">
                                    {view === 'register' && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-900 ml-1">Your Name</label>
                                            <input type="text" placeholder="Enter your name" className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-0 transition-all" value={name} onChange={e => setName(e.target.value)} required />
                                        </div>
                                    )}
                                    
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-900 ml-1">Your Email Address</label>
                                        <input type="email" placeholder="Enter your email" className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-0 transition-all" value={email} onChange={e => setEmail(e.target.value)} required />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-900 ml-1">Password</label>
                                        <div className="relative">
                                            <input type={showPassword ? "text" : "password"} placeholder="Enter your password" className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-0 transition-all" value={password} onChange={e => setPassword(e.target.value)} required />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
                                                {showPassword ? <EyeOff size={18} strokeWidth={1.5}/> : <Eye size={18} strokeWidth={1.5}/>}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-1">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer" />
                                            <span className="text-xs text-slate-500 group-hover:text-slate-800 transition-colors">Remember me</span>
                                        </label>
                                        {view === 'login' && (
                                            <button type="button" onClick={() => setView('forgot')} className="text-xs font-bold text-slate-900 hover:underline decoration-2 underline-offset-4">Forgot password?</button>
                                        )}
                                    </div>

                                    {error && <p className="text-red-500 text-xs text-center bg-red-50 p-2 rounded-lg font-medium animate-pulse">{error}</p>}

                                    <button type="submit" className="w-full bg-[#1C1C1E] hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.99] text-base mt-2">
                                        {view === 'login' ? 'Sign in' : 'Sign up'}
                                    </button>
                                </form>

                                <div className="text-center mt-6 text-slate-500 text-sm font-medium">
                                    {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                                    <button onClick={() => { setView(view === 'login' ? 'register' : 'login'); setError(''); }} className="text-slate-900 font-bold hover:underline decoration-2 underline-offset-4 ml-1">
                                        {view === 'login' ? 'Sign up' : 'Sign in'}
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Forgot Password View */}
                        {view === 'forgot' && (
                            <form onSubmit={handlePasswordReset} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-900 ml-1">Enter your email</label>
                                    <input type="email" placeholder="name@example.com" className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-0 transition-all" value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>

                                {error && <p className="text-red-500 text-xs text-center bg-red-50 p-2 rounded-lg font-medium">{error}</p>}
                                {successMsg && <p className="text-green-600 text-xs text-center bg-green-50 p-2 rounded-lg font-medium">{successMsg}</p>}

                                <button type="submit" className="w-full bg-[#1C1C1E] hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.99] text-base mt-2">
                                    Send Reset Link
                                </button>

                                <button type="button" onClick={() => setView('login')} className="w-full flex items-center justify-center gap-1 text-slate-500 text-sm font-bold hover:text-slate-800 transition-colors py-2">
                                    <ChevronLeft size={16}/> Back to Login
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;