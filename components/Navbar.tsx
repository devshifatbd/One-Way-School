import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User as UserIcon, LogOut, Mail, Chrome, LayoutDashboard } from 'lucide-react';
import { User } from '../types';
import { signInWithGoogle, logout, loginWithEmail, registerWithEmail } from '../services/firebase';

interface NavbarProps {
    user: User | null;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    
    // Auth Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const location = useLocation();
    const navigate = useNavigate();

    // Admin Emails List (Should match AdminDashboard)
    const ADMIN_EMAILS = ['onewayschool.bd@gmail.com', 'onewayschool.bd@gamil.com'];
    const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const scrollToSection = (id: string) => {
        setIsMenuOpen(false);
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            if (id === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
            else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
            setIsLoginModalOpen(false);
            navigate('/dashboard'); // Send to dashboard after login
        } catch (e: any) { 
            console.error(e);
            setError(e.message || "Google Login Failed. Check console."); 
        }
    };

    const handleUserAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (authMode === 'login') {
                await loginWithEmail(email, password);
            } else {
                await registerWithEmail(name, email, password);
            }
            setIsLoginModalOpen(false);
            navigate('/dashboard'); // Send to dashboard after login
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Authentication failed");
        }
    };

    return (
        <>
            <header className="fixed w-full top-0 z-50 pt-4 px-4 md:pt-6 transition-all duration-300">
                <div className="container mx-auto">
                    <div className="nav-pill rounded-full px-4 py-2 md:px-6 md:py-3 flex justify-between items-center max-w-6xl mx-auto">
                        
                        {/* Logo */}
                        <div onClick={() => scrollToSection('home')} className="cursor-pointer flex items-center gap-2 pl-2">
                            <img src="https://iili.io/f3k62rG.md.png" alt="OWS Logo" className="h-8 md:h-10 object-contain drop-shadow-sm hover:scale-105 transition-transform" />
                        </div>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center space-x-1 bg-slate-100/50 rounded-full px-2 py-1 border border-white/50">
                            <button onClick={() => scrollToSection('home')} className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all duration-300">হোম</button>
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
                                    {isAdmin && (
                                        <Link to="/admin" className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-slate-800 transition-colors">
                                            <LayoutDashboard size={14} /> Admin
                                        </Link>
                                    )}
                                    
                                    {/* DASHBOARD TEXT BUTTON (Replaces Avatar) */}
                                    <button 
                                        onClick={() => navigate('/dashboard')} 
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
                                    onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl mb-2 cursor-pointer shadow-sm active:scale-95 transition-transform"
                                >
                                    <div className="bg-white p-2 rounded-full text-blue-600 shadow-sm">
                                        <LayoutDashboard size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-lg">ড্যাশবোর্ড</p>
                                        <p className="text-xs text-slate-500">প্রোফাইল দেখুন</p>
                                    </div>
                                </div>
                            )}
                            <button onClick={() => scrollToSection('home')} className="text-left text-base font-medium text-slate-800 hover:text-blue-600 p-3 rounded-xl hover:bg-blue-50 transition-colors">হোম</button>
                            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-left text-base font-medium text-slate-800 hover:text-blue-600 p-3 rounded-xl hover:bg-blue-50 transition-colors">আমাদের সম্পর্কে</Link>
                            <Link to="/ecosystem" onClick={() => setIsMenuOpen(false)} className="text-left text-base font-medium text-slate-800 hover:text-blue-600 p-3 rounded-xl hover:bg-blue-50 transition-colors">ইকোসিস্টেম</Link>
                            <Link to="/community" onClick={() => setIsMenuOpen(false)} className="text-left text-base font-medium text-slate-800 hover:text-blue-600 p-3 rounded-xl hover:bg-blue-50 transition-colors">কমিউনিটি</Link>
                            <Link to="/jobs" onClick={() => setIsMenuOpen(false)} className="text-left text-base font-medium text-slate-800 hover:text-blue-600 p-3 rounded-xl hover:bg-blue-50 transition-colors">জবস</Link>
                            <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="text-left text-base font-medium text-slate-800 hover:text-blue-600 p-3 rounded-xl hover:bg-blue-50 transition-colors">ব্লগ</Link>
                            {isAdmin && (
                                <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-left text-base font-bold text-white bg-slate-900 p-3 rounded-xl flex items-center gap-2">
                                    <LayoutDashboard size={18} /> এডমিন ড্যাশবোর্ড
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Login Modal */}
            {isLoginModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
                        <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24}/></button>
                        
                        <div className="p-8">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-center text-slate-800 mb-6">
                                    {authMode === 'login' ? 'অ্যাকাউন্টে লগইন করুন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
                                </h3>
                                
                                <form onSubmit={handleUserAuth} className="space-y-4">
                                    {authMode === 'register' && (
                                        <input type="text" placeholder="আপনার নাম" className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" value={name} onChange={e => setName(e.target.value)} required />
                                    )}
                                    <input type="email" placeholder="ইমেইল" className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={e => setEmail(e.target.value)} required />
                                    <input type="password" placeholder="পাসওয়ার্ড" className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={e => setPassword(e.target.value)} required />
                                    
                                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition flex justify-center items-center gap-2">
                                        {authMode === 'login' ? <><UserIcon size={18}/> লগইন</> : <><Mail size={18}/> রেজিস্টার</>}
                                    </button>
                                </form>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">অথবা</span></div>
                                </div>

                                <button onClick={handleGoogleLogin} className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl transition flex justify-center items-center gap-2">
                                    <Chrome size={18} className="text-blue-600"/> গুগল দিয়ে লগইন
                                </button>

                                <div className="text-center mt-4">
                                    <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setError(''); }} className="text-blue-600 font-bold text-sm hover:underline">
                                        {authMode === 'login' ? 'অ্যাকাউন্ট নেই? রেজিস্টার করুন' : 'লগইন পেইজে ফিরে যান'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;