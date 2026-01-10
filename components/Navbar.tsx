
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard, ChevronDown, Calendar, ClipboardCheck } from 'lucide-react';
import { User } from '../types';
import { logout } from '../services/firebase';

interface NavbarProps {
    user: User | null;
    openLoginModal?: () => void; // New Prop
}

const Navbar: React.FC<NavbarProps> = ({ user, openLoginModal }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // State for mobile accordions
    const [mobileEventOpen, setMobileEventOpen] = useState(false);
    const [mobileCommunityOpen, setMobileCommunityOpen] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const ADMIN_EMAILS = ['onewayschool.bd@gmail.com', 'onewayschool.bd@gamil.com', 'admin@ows.com'];
    const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const scrollToTop = () => {
        setIsMenuOpen(false);
        setMobileEventOpen(false);
        setMobileCommunityOpen(false);
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

    const handleLoginClick = () => {
        setIsMenuOpen(false);
        if (openLoginModal) {
            openLoginModal();
        } else {
            navigate('/login', { state: { from: location } });
        }
    };

    const eventSubMenus = [
        { title: 'ন্যাশনাল টেক কার্ণিভাল', link: '/event/national-tech-carnival' },
        { title: 'ন্যাশনাল টেক এওয়ার্ড', link: '/event/national-tech-award' },
        { title: 'রাইজ অব ব্রিলিয়ান্স', link: '/event/rise-of-brilliance' },
        { title: 'রাইজ অব ব্রিলিয়ান্স এওয়ার্ড', link: '/event/rise-of-brilliance-award' },
        { title: 'এস.এস.সি কৃতি সংবর্ধনা', link: '/event/ssc-kriti-songbordhona' },
        { title: 'এইচ.এস.সি কৃতি সংবর্ধনা', link: '/event/hsc-kriti-songbordhona' },
    ];

    const communitySubMenus = [
        { title: 'ক্যাম্পাস এম্বাসেডর', link: '/community/ambassador' },
        { title: 'OWS এফিলিয়েট', link: '/community/affiliate' },
        { title: 'সার্টফিকেট পোর্টাল', link: '/community/certificate' },
    ];

    return (
        <header className="fixed w-full top-0 z-50 pt-4 px-4 md:pt-6 transition-all duration-300 font-['Hind_Siliguri']">
            <div className="container mx-auto">
                <div className="nav-pill rounded-full px-4 py-2 md:px-6 md:py-3 flex justify-between items-center max-w-7xl mx-auto">
                    
                    <Link to="/" onClick={scrollToTop} className="cursor-pointer flex items-center gap-2 pl-2 shrink-0">
                        <img src="https://iili.io/f3k62rG.md.png" alt="OWS Logo" className="h-8 md:h-10 object-contain drop-shadow-sm hover:scale-105 transition-transform" />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden xl:flex items-center space-x-1 bg-slate-100/50 rounded-full px-2 py-1 border border-white/50">
                        <Link to="/" onClick={scrollToTop} className="px-3 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all duration-300">হোম</Link>
                        <Link to="/about" className="px-3 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all duration-300">আমাদের সম্পর্কে</Link>
                        <Link to="/ecosystem" className="px-3 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all duration-300">ইকোসিস্টেম</Link>
                        <Link to="/self-assessment" className="px-3 py-2 rounded-full text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-white transition-all duration-300 flex items-center gap-1">
                            <ClipboardCheck size={16}/> সেলফ এসেসমেন্ট
                        </Link>
                        <Link to="/workshop" className="px-3 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all duration-300">ওয়ার্কশপ</Link>

                        <div className="relative group">
                            <button className="flex items-center gap-1 px-3 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all duration-300">
                                ইভেন্ট <ChevronDown size={14} className="group-hover:rotate-180 transition-transform"/>
                            </button>
                            <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-xl border border-slate-100 mt-2 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                {eventSubMenus.map((item, idx) => (
                                    <Link key={idx} to={item.link} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                        {item.title}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="relative group">
                            <button className="flex items-center gap-1 px-3 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all duration-300">
                                কমিউনিটি <ChevronDown size={14} className="group-hover:rotate-180 transition-transform"/>
                            </button>
                            <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-xl border border-slate-100 mt-2 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                {communitySubMenus.map((item, idx) => (
                                    <Link key={idx} to={item.link} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                        {item.title}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <Link to="/jobs" className="px-3 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-white transition-all duration-300">জবস</Link>
                        <Link to="/blog" className="px-3 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all duration-300">ব্লগ</Link>
                    </nav>

                    <div className="flex items-center gap-3 shrink-0">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={handleDashboardClick} 
                                    className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm"
                                >
                                    <LayoutDashboard size={16} />
                                    <span className="hidden md:inline">ড্যাশবোর্ড</span>
                                </button>
                                <button onClick={() => { logout(); navigate('/'); }} className="p-2 rounded-full bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors" title="Logout">
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <button onClick={handleLoginClick} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-sm px-4 py-2 hover:bg-slate-100 rounded-full transition-all">
                                <UserIcon size={16} /> লগইন
                            </button>
                        )}

                        <button className="xl:hidden w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full text-slate-800 hover:bg-slate-200 transition-colors" onClick={toggleMenu}>
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Content */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 w-full px-4 mt-2 transition-all duration-300 origin-top animate-fade-in-down h-[85vh] overflow-y-auto">
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 flex flex-col space-y-3 max-w-6xl mx-auto">
                        {!user && (
                            <button onClick={handleLoginClick} className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 rounded-xl mb-2">
                                <UserIcon size={18} /> লগইন করুন
                            </button>
                        )}
                        
                        <Link to="/" onClick={scrollToTop} className="text-left text-base font-medium text-slate-800 hover:text-blue-600 p-3 rounded-xl hover:bg-blue-50 transition-colors">হোম</Link>
                        <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-left text-base font-medium text-slate-800 hover:text-blue-600 p-3 rounded-xl hover:bg-blue-50 transition-colors">আমাদের সম্পর্কে</Link>
                        <Link to="/ecosystem" onClick={() => setIsMenuOpen(false)} className="text-left text-base font-medium text-slate-800 hover:text-blue-600 p-3 rounded-xl hover:bg-blue-50 transition-colors">ইকোসিস্টেম</Link>
                        <Link to="/self-assessment" onClick={() => setIsMenuOpen(false)} className="text-left text-base font-bold text-blue-600 hover:text-blue-700 p-3 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2"><ClipboardCheck size={20}/> সেলফ এসেসমেন্ট</Link>
                        <Link to="/workshop" onClick={() => setIsMenuOpen(false)} className="text-left text-base font-medium text-slate-800 hover:text-blue-600 p-3 rounded-xl hover:bg-blue-50 transition-colors">ওয়ার্কশপ</Link>
                        
                        {/* Mobile Events Dropdown */}
                        <div>
                            <button onClick={() => setMobileEventOpen(!mobileEventOpen)} className="w-full flex justify-between items-center text-left text-base font-medium text-slate-800 p-3 rounded-xl hover:bg-blue-50 transition-colors">
                                <span>ইভেন্ট</span>
                                <ChevronDown size={16} className={`transition-transform ${mobileEventOpen ? 'rotate-180' : ''}`}/>
                            </button>
                            {mobileEventOpen && (
                                <div className="ml-4 pl-4 border-l-2 border-slate-100 mt-1 space-y-1">
                                    {eventSubMenus.map((item, idx) => (
                                        <Link key={idx} to={item.link} onClick={() => setIsMenuOpen(false)} className="block py-2 text-sm text-slate-600 hover:text-blue-600">
                                            {item.title}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Mobile Community Dropdown */}
                        <div>
                            <button onClick={() => setMobileCommunityOpen(!mobileCommunityOpen)} className="w-full flex justify-between items-center text-left text-base font-medium text-slate-800 p-3 rounded-xl hover:bg-blue-50 transition-colors">
                                <span>কমিউনিটি</span>
                                <ChevronDown size={16} className={`transition-transform ${mobileCommunityOpen ? 'rotate-180' : ''}`}/>
                            </button>
                            {mobileCommunityOpen && (
                                <div className="ml-4 pl-4 border-l-2 border-slate-100 mt-1 space-y-1">
                                    {communitySubMenus.map((item, idx) => (
                                        <Link key={idx} to={item.link} onClick={() => setIsMenuOpen(false)} className="block py-2 text-sm text-slate-600 hover:text-blue-600">
                                            {item.title}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link to="/jobs" onClick={() => setIsMenuOpen(false)} className="text-left text-base font-medium text-slate-800 hover:text-blue-600 p-3 rounded-xl hover:bg-blue-50 transition-colors">জবস</Link>
                        <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="text-left text-base font-medium text-slate-800 hover:text-blue-600 p-3 rounded-xl hover:bg-blue-50 transition-colors">ব্লগ</Link>
                        
                        {user && (
                            <div className="pt-2 border-t border-slate-100">
                                <button onClick={handleDashboardClick} className="w-full text-left text-base font-bold text-blue-700 p-3 rounded-xl hover:bg-blue-50 flex items-center gap-2">
                                    <LayoutDashboard size={18} /> ড্যাশবোর্ড
                                </button>
                                <button onClick={() => { logout(); navigate('/'); setIsMenuOpen(false); }} className="w-full text-left text-base font-medium text-red-500 p-3 rounded-xl hover:bg-red-50 flex items-center gap-2">
                                    <LogOut size={18} /> লগআউট
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
