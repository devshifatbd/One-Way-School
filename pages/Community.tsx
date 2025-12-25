
import React, { useState, useEffect, useRef } from 'react';
import { Award, ArrowRight, Coins, Download, ShieldCheck, CheckCircle, Search, Zap, Target, Gift, UserCheck, Megaphone, Lock } from 'lucide-react';
import { User, Affiliate } from '../types';
import { saveAffiliate, getUserApplications, getCommunityMemberByPhone, signInWithGoogle, auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface CommunityProps {
    user: User | null;
}

const Community: React.FC<CommunityProps> = ({ user }) => {
    const navigate = useNavigate();
    
    // Certificate State
    const [searchPhone, setSearchPhone] = useState('');
    const [verifiedMember, setVerifiedMember] = useState<any>(null);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [verifyError, setVerifyError] = useState('');
    
    const [certLoading, setCertLoading] = useState(false);
    const certificateRef = useRef<HTMLDivElement>(null);
    const [previewMember, setPreviewMember] = useState<any>(null); // For rendering the hidden cert

    // Check existing application status (Optional logic kept for context)
    const [existingAffiliate, setExistingAffiliate] = useState<Affiliate | null>(null);

    useEffect(() => {
        const checkStatus = async () => {
            if (user) {
                const apps = await getUserApplications(user.uid);
                const affApp = apps.find(app => app.type === 'Affiliate' || app.type === 'Campus Ambassador');
                if (affApp) {
                    setExistingAffiliate(affApp as Affiliate);
                }
            }
        };
        checkStatus();
    }, [user]);

    // --- Certificate Verification Logic ---
    const handleVerifyMember = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // --- 1. Enforce Login for Security ---
        if (!user) {
            setVerifyError("নিরাপত্তার স্বার্থে সার্টিফিকেট যাচাই করার জন্য লগইন প্রয়োজন।");
            return;
        }

        // Normalize input: remove ALL non-digit characters
        let phoneInput = searchPhone.replace(/[^0-9]/g, ''); 
        
        // Handle +880 or 880 prefix
        if (phoneInput.startsWith('880')) phoneInput = phoneInput.substring(3); // Remove 880
        if (phoneInput.startsWith('0')) phoneInput = phoneInput; // Keep 017...
        else phoneInput = '0' + phoneInput; // Ensure it starts with 0
        
        // Basic length validation
        if(phoneInput.length < 10) {
            setVerifyError("সঠিক মোবাইল নম্বর দিন (উদাঃ 017XXXXXXXX)");
            return;
        }
        
        setVerifyLoading(true);
        setVerifyError('');
        setVerifiedMember(null);

        try {
            const member = await getCommunityMemberByPhone(phoneInput);

            if(member) {
                setVerifiedMember(member);
            } else {
                setVerifyError("দুঃখিত, এই নম্বরে কোনো মেম্বার পাওয়া যায়নি।");
            }
        } catch(e: any) {
            console.error("Verification Error:", e);
            if (e.code === 'permission-denied' || e.message?.includes('permission')) {
                setVerifyError("ডাটাবেস এক্সেস সমস্যা। অনুগ্রহ করে পেইজটি রিফ্রেশ দিয়ে আবার চেষ্টা করুন।");
            } else {
                setVerifyError("যাচাইকরণে সমস্যা হয়েছে। ইন্টারনেট কানেকশন চেক করুন।");
            }
        }
        setVerifyLoading(false);
    };

    const generateCertificate = async () => {
        if(!verifiedMember) return;
        setCertLoading(true);
        
        // Prepare data for the hidden template
        setPreviewMember({
            ...verifiedMember,
            nameForCert: verifiedMember.name, 
            issueDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        });

        // Wait for render and images to load
        setTimeout(async () => {
            const element = certificateRef.current;
            if (element) {
                try {
                    // Pre-load check to ensure images are ready
                    const images = Array.from(element.getElementsByTagName('img'));
                    await Promise.all(images.map((img: HTMLImageElement) => {
                        if (img.complete) return Promise.resolve();
                        return new Promise<void>((resolve) => {
                            img.onload = () => resolve();
                            img.onerror = () => resolve(); // Continue even if one image fails
                        });
                    }));

                    const canvas = await html2canvas(element, {
                        scale: 2, // High resolution
                        useCORS: true, // Needed for external images
                        allowTaint: false, 
                        backgroundColor: '#ffffff',
                        width: 1123,
                        height: 794,
                        logging: false,
                        // Avoid scroll issues
                        scrollX: 0,
                        scrollY: 0,
                        windowWidth: 1123,
                        windowHeight: 794
                    });

                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF({
                        orientation: 'landscape',
                        unit: 'px',
                        format: [1123, 794] 
                    });

                    pdf.addImage(imgData, 'PNG', 0, 0, 1123, 794);
                    pdf.save(`OWS_Certificate_${verifiedMember.name}.pdf`);
                } catch (e: any) {
                    console.error("Certificate Gen Error:", e);
                    alert("সার্টিফিকেট ডাউনলোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
                }
            } else {
                alert("টেমপ্লেট লোড হয়নি। দয়া করে পেজ রিফ্রেশ দিন।");
            }
            setCertLoading(false);
            setPreviewMember(null); // Clean up
        }, 2500);
    };

    const handleQuickJoin = async (type: 'Affiliate' | 'Campus Ambassador') => {
        if (!user) {
            alert("আবেদন করার জন্য অনুগ্রহ করে প্রথমে লগইন করুন।");
            return;
        }

        if (window.confirm(`আপনি কি নিশ্চিতভাবে ${type} প্রোগ্রামে জয়েন করতে চান?`)) {
            try {
                // Ensure all fields are defined to prevent undefined error
                const data: Affiliate = {
                    name: user.displayName || 'Unknown User',
                    phone: user.phone || 'N/A',
                    email: user.email || 'N/A',
                    institution: user.institution || '',
                    type: type,
                    imageUrl: user.photoURL || '',
                    userId: user.uid,
                    createdAt: new Date(),
                    status: 'pending',
                    balance: 0,
                    totalEarnings: 0
                };
                
                await saveAffiliate(data);
                
                alert("আপনার আবেদন সফলভাবে জমা হয়েছে! ড্যাশবোর্ডে স্ট্যাটাস দেখুন।");
                setExistingAffiliate(data);
                navigate('/dashboard'); // Redirect to dashboard
            } catch (error) {
                console.error(error);
                alert("আবেদন জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
            }
        }
    };

    // Helper to determine display role
    const getDisplayRole = (member: any) => {
        const simpleCategories = ['Campus Ambassador', 'Volunteer', 'Affiliate'];
        if (member.category && !simpleCategories.includes(member.category)) {
            return (
                <div className="flex flex-col items-center">
                    <span className="text-[#1E3A8A] font-bold text-xl">{member.role}</span>
                    <span className="text-sm text-slate-500 font-medium uppercase tracking-wider mt-1">{member.category}</span>
                </div>
            );
        }
        return <span className="text-[#1E3A8A] font-bold text-xl">{member.role}</span>;
    };

    return (
        <div className="bg-slate-50 min-h-screen font-['Hind_Siliguri']">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-900">
                <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] animate-float"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px] animate-float-delayed"></div>
                
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        আমাদের <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">কমিউনিটি</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
                        শেখা, আয় করা এবং নেতৃত্ব দেওয়ার অনন্য প্ল্যাটফর্ম। আজই যুক্ত হোন আমাদের সাথে।
                    </p>
                </div>
            </section>

             {/* 1. Certificate Download Section */}
             <section className="py-16 md:py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div>
                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-1 md:p-2 shadow-2xl">
                        <div className="bg-slate-900/50 rounded-2xl p-6 md:p-12 flex flex-col md:flex-row items-center gap-10 md:gap-16">
                            
                            {/* Left Content */}
                            <div className="flex-1 text-center md:text-left text-white">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-sm font-bold mb-4">
                                    <Award size={16}/> ভেরিফাইড মেম্বারশিপ
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">আপনার সার্টিফিকেট সংগ্রহ করুন</h2>
                                <p className="text-slate-400 mb-8 leading-relaxed">
                                    আপনি যদি আমাদের রেজিস্টার্ড মেম্বার বা ভলান্টিয়ার হয়ে থাকেন, তবে পাশের বক্সে আপনার মোবাইল নম্বর দিন।
                                </p>
                            </div>

                            {/* Right Card (Search & Download) */}
                            <div className="flex-1 w-full md:w-auto bg-white rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                                
                                <h3 className="font-bold text-slate-800 mb-6 text-xl flex items-center gap-2">
                                    <Search className="text-blue-600"/> মেম্বার যাচাই করুন
                                </h3>

                                {/* Authentication Check Block */}
                                {!user ? (
                                    <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Lock size={24}/>
                                        </div>
                                        <p className="text-slate-600 text-sm mb-4 px-4">সার্টিফিকেট যাচাই করতে লগইন প্রয়োজন।</p>
                                        <button 
                                            onClick={() => signInWithGoogle()} 
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition"
                                        >
                                            লগইন করুন
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleVerifyMember} className="space-y-4">
                                        <div className="relative">
                                            <input 
                                                required 
                                                type="text" 
                                                placeholder="মোবাইল নম্বর (017...)" 
                                                value={searchPhone} 
                                                onChange={e => {setSearchPhone(e.target.value); setVerifyError(''); setVerifiedMember(null);}}
                                                className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-mono text-lg transition-all"
                                            />
                                            <button 
                                                type="submit"
                                                disabled={verifyLoading}
                                                className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-4 rounded-lg font-bold text-sm hover:bg-blue-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                                            >
                                                {verifyLoading ? '...' : 'Verify'}
                                            </button>
                                        </div>
                                        
                                        {verifyError && <p className="text-red-500 text-sm flex items-center gap-1 animate-pulse font-bold bg-red-50 p-2 rounded-lg"><ShieldCheck size={14}/> {verifyError}</p>}

                                        {/* Success Result */}
                                        {verifiedMember && (
                                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in-up">
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-green-100 p-2 rounded-full text-green-600"><UserCheck size={20}/></div>
                                                    <div>
                                                        <p className="text-xs text-green-600 font-bold uppercase tracking-wider">মেম্বার ভেরিফাইড</p>
                                                        <h4 className="font-bold text-slate-800 text-lg">{verifiedMember.name}</h4>
                                                        <p className="text-sm text-slate-600">{verifiedMember.role} {verifiedMember.category ? `(${verifiedMember.category})` : ''}</p>
                                                    </div>
                                                </div>
                                                
                                                <button 
                                                    onClick={generateCertificate}
                                                    disabled={certLoading}
                                                    type="button"
                                                    className="w-full mt-4 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                                                >
                                                    {certLoading ? 'জেনারেট হচ্ছে...' : <><Download size={18}/> সার্টিফিকেট ডাউনলোড</>}
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* HIDDEN CERTIFICATE TEMPLATE */}
            <div style={{ position: 'fixed', top: 0, left: '-9999px', width: '1123px', height: '794px', zIndex: -100 }}>
                {previewMember && (
                    <div ref={certificateRef} className="w-[1123px] h-[794px] relative bg-white text-slate-900 font-['Hind_Siliguri'] box-border p-6">
                        <div className="w-full h-full border-[10px] border-[#1E3A8A] p-1 box-border">
                            <div className="w-full h-full border-[2px] border-[#EA580C] p-3 box-border">
                                <div className="w-full h-full border border-[#1E3A8A]/20 relative flex flex-col justify-between py-10 px-16 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-50/50 to-white">
                                    <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-[0.03]">
                                        <img src="https://iili.io/f3k62rG.md.png" className="w-[500px] h-auto grayscale blur-[0.5px]" alt="Watermark" crossOrigin="anonymous" />
                                    </div>
                                    <div className="relative z-20 flex flex-col justify-between h-full">
                                        <div className="w-full flex flex-col items-center text-center mt-4">
                                            <img src="https://iili.io/f3k62rG.md.png" alt="Logo" className="h-20 object-contain mb-6" crossOrigin="anonymous" />
                                            <h1 className="text-5xl font-bold text-[#1E3A8A] uppercase tracking-wide" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Certificate of Recognition
                                            </h1>
                                        </div>
                                        <div className="w-full flex flex-col items-center justify-center text-center">
                                            <p className="text-xl text-slate-500 font-serif italic mb-1">This certificate is proudly presented to</p>
                                            <div className="w-full max-w-4xl relative">
                                                <h2 className="text-6xl font-bold text-slate-900 capitalize leading-tight mb-6" style={{ fontFamily: 'Hind Siliguri, sans-serif' }}>
                                                    {previewMember.nameForCert}
                                                </h2>
                                            </div>
                                            <p className="text-lg text-slate-600 leading-relaxed max-w-4xl font-light text-center px-10">
                                                For successfully verified membership and valuable contribution as a <span className="font-bold text-[#EA580C]">Community Member</span> at 
                                                One Way School. We appreciate your dedication towards personal development and community service.
                                            </p>
                                        </div>
                                        <div className="flex justify-center gap-16 w-full items-center mb-4">
                                            <div className="text-center w-40">
                                                <p className="text-[#1E3A8A] text-xs uppercase tracking-wider font-bold mb-1">Membership ID</p>
                                                <p className="text-lg font-mono font-bold text-slate-800">OWS-{previewMember.id ? previewMember.id.slice(0,6).toUpperCase() : 'N/A'}</p>
                                            </div>
                                            <div className="w-[1px] h-10 bg-[#1E3A8A]/30"></div>
                                            <div className="text-center min-w-[200px]">
                                                <p className="text-[#1E3A8A] text-xs uppercase tracking-wider font-bold mb-1">Role / Position</p>
                                                <div>
                                                    {getDisplayRole(previewMember)}
                                                </div>
                                            </div>
                                            <div className="w-[1px] h-10 bg-[#1E3A8A]/30"></div>
                                            <div className="text-center w-40">
                                                <p className="text-[#1E3A8A] text-xs uppercase tracking-wider font-bold mb-1">Issue Date</p>
                                                <p className="text-lg font-bold text-slate-800">{previewMember.issueDate}</p>
                                            </div>
                                        </div>
                                        <div className="w-full flex justify-between items-end border-t border-[#1E3A8A]/10 pt-6">
                                            <div className="flex flex-col items-center w-56">
                                                <img src="https://iili.io/KB8jgte.md.png" alt="Sig" className="h-12 object-contain mb-2 z-10 filter grayscale opacity-90" crossOrigin="anonymous" />
                                                <div className="w-full h-[1px] bg-slate-400 mb-2"></div>
                                                <p className="font-bold text-slate-800 text-sm">Sifatur Rahman</p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Founder</p>
                                            </div>
                                            <div className="flex flex-col items-center w-56">
                                                <img src="https://iili.io/KB8j4ou.md.png" alt="Sig" className="h-12 object-contain mb-2 z-10 filter grayscale opacity-90" crossOrigin="anonymous" />
                                                <div className="w-full h-[1px] bg-slate-400 mb-2"></div>
                                                <p className="font-bold text-slate-800 text-sm">Faria Hoque</p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Co-Founder</p>
                                            </div>
                                            <div className="flex flex-col items-center w-56">
                                                <img src="https://iili.io/KTuZeGp.png" alt="Sig" className="h-12 object-contain mb-2 z-10 filter grayscale opacity-90" crossOrigin="anonymous" />
                                                <div className="w-full h-[1px] bg-slate-400 mb-2"></div>
                                                <p className="font-bold text-slate-800 text-sm">Dipta Halder</p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Co-Founder</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Affiliate Program Section (Full Width) */}
            <section className="py-20 bg-white border-t border-slate-100">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-12 items-center">
                        <div className="lg:w-1/2 order-2 lg:order-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-6">
                                <Coins size={16} /> শেয়ার করুন, আর্ন করুন
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                                এফিলিয়েট প্রোগ্রাম
                            </h2>
                            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                                আপনার নেটওয়ার্ক কাজে লাগিয়ে ঘরে বসেই প্যাসিভ ইনকাম করার সেরা সুযোগ। প্রতিটি সফল রেফারেলে আপনি পাচ্ছেন নিশ্চিত কমিশন।
                            </p>

                            <div className="grid sm:grid-cols-2 gap-6 mb-10">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <h4 className="font-bold text-blue-600 mb-2 flex items-center gap-2"><Gift size={18}/> বেনিফিট</h4>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-blue-500"/> ১৫% নিশ্চিত কমিশন</li>
                                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-blue-500"/> মাসিক বেস্ট পারফর্মার বোনাস</li>
                                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-blue-500"/> সেলস ট্রেনিং ও মেন্টরশিপ</li>
                                    </ul>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Target size={18}/> আপনার কাজ</h4>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div> সোশ্যাল মিডিয়ায় প্রমোশন</li>
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div> ইউনিক লিংক শেয়ার করা</li>
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div> স্টুডেন্ট কাউন্সিলিং</li>
                                    </ul>
                                </div>
                            </div>

                            <button 
                                onClick={() => handleQuickJoin('Affiliate')} 
                                className="w-full md:w-auto px-8 py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3 hover:-translate-y-1"
                            >
                                এফিলিয়েট হিসেবে জয়েন করুন <ArrowRight size={20} />
                            </button>
                        </div>
                        <div className="lg:w-1/2 order-1 lg:order-2 relative">
                            <div className="absolute inset-0 bg-blue-600/10 rounded-3xl transform rotate-3 blur-xl"></div>
                            <img 
                                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                                alt="Affiliate" 
                                className="relative rounded-3xl shadow-2xl w-full h-[400px] object-cover border border-slate-100" 
                            />
                            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 animate-float">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-blue-600">
                                    <Zap size={24}/>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase font-bold">Total Earnings</p>
                                    <p className="text-2xl font-bold text-slate-900">৳ ৫০,০০০+</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Ambassador Program Section (Full Width, Alternating Layout) */}
            <section className="py-20 bg-slate-50 border-t border-slate-200">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-12 items-center">
                        <div className="lg:w-1/2 relative">
                             <div className="absolute inset-0 bg-purple-600/10 rounded-3xl transform -rotate-3 blur-xl"></div>
                            <img 
                                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                                alt="Ambassador" 
                                className="relative rounded-3xl shadow-2xl w-full h-[400px] object-cover border border-white" 
                            />
                             <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 animate-float-delayed">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-purple-600">
                                    <Megaphone size={24}/>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase font-bold">Network</p>
                                    <p className="text-2xl font-bold text-slate-900">২০+ ক্যাম্পাস</p>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-1/2">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-bold mb-6">
                                <Award size={16} /> লিড দিন, নেটওয়ার্ক গড়ুন
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                                ক্যাম্পাস এম্বাসেডর
                            </h2>
                            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                                আপনার ক্যাম্পাসে One Way School এর প্রতিনিধি হয়ে লিডারশিপ স্কিল ডেভেলপ করুন। ফিউচার লিডারদের জন্য এটি একটি অনন্য সুযোগ।
                            </p>

                            <div className="grid sm:grid-cols-2 gap-6 mb-10">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <h4 className="font-bold text-purple-600 mb-2 flex items-center gap-2"><Gift size={18}/> বেনিফিট</h4>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-purple-500"/> ভেরিফাইড এম্বাসেডর সার্টিফিকেট</li>
                                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-purple-500"/> এক্সক্লুসিভ মার্চেন্ডাইজ (টি-শার্ট)</li>
                                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-purple-500"/> কর্পোরেট নেটওয়ার্কিং সুযোগ</li>
                                    </ul>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Target size={18}/> আপনার কাজ</h4>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div> ইভেন্ট আয়োজন ও পরিচালনা</li>
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div> স্টুডেন্ট কমিউনিটি বিল্ড করা</li>
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div> ব্র্যান্ড প্রমোশন</li>
                                    </ul>
                                </div>
                            </div>

                            <button 
                                onClick={() => handleQuickJoin('Campus Ambassador')} 
                                className="w-full md:w-auto px-8 py-4 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-3 hover:-translate-y-1"
                            >
                                এম্বাসেডর হিসেবে জয়েন করুন <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
export default Community;
