import React, { useState, useEffect, useRef } from 'react';
import { Award, Users, Lock, ArrowRight, Coins, Download, ShieldCheck } from 'lucide-react';
import { User, Affiliate } from '../types';
import { saveAffiliate, getUserApplications, getCommunityMemberByPhone, signInWithGoogle } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface CommunityProps {
    user: User | null;
}

const Community: React.FC<CommunityProps> = ({ user }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Check existing application status
    const [existingAffiliate, setExistingAffiliate] = useState<Affiliate | null>(null);
    const [appLoading, setAppLoading] = useState(false);

    // Certificate State
    const [certName, setCertName] = useState('');
    const [certPhone, setCertPhone] = useState('');
    const [certLoading, setCertLoading] = useState(false);
    const certificateRef = useRef<HTMLDivElement>(null);
    const [previewMember, setPreviewMember] = useState<any>(null);

    useEffect(() => {
        const checkStatus = async () => {
            if (user) {
                setAppLoading(true);
                const apps = await getUserApplications(user.uid);
                const affApp = apps.find(app => app.type === 'Affiliate' || app.type === 'Campus Ambassador');
                if (affApp) {
                    setExistingAffiliate(affApp as Affiliate);
                }
                setAppLoading(false);
            }
        };
        checkStatus();
    }, [user]);

    const handleQuickJoin = async (type: 'Affiliate' | 'Campus Ambassador') => {
        if (!user) {
            alert("অনুগ্রহ করে প্রথমে লগইন করুন।");
            return;
        }

        if (window.confirm(`আপনি কি নিশ্চিতভাবে ${type} প্রোগ্রামে জয়েন করতে চান?`)) {
            setLoading(true);
            try {
                const data: Affiliate = {
                    name: user.displayName || 'Unknown',
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
                alert("আপনার আবেদন সফলভাবে জমা হয়েছে!");
                setExistingAffiliate(data);
            } catch (error) {
                alert("Something went wrong");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch(e) { console.error(e); }
    };

    const generateCertificate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCertLoading(true);
        setPreviewMember(null);

        try {
            // Verify User in DB
            const member = await getCommunityMemberByPhone(certPhone);
            
            if (!member) {
                alert("দুঃখিত, আমাদের ডাটাবেজে আপনার তথ্য পাওয়া যায়নি। সঠিক মোবাইল নম্বর দিন।");
                setCertLoading(false);
                return;
            }

            // Set data for preview to render
            setPreviewMember({
                ...member,
                nameForCert: certName || member.name,
                issueDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
            });

            // Wait a bit for DOM to render the certificate
            setTimeout(async () => {
                if (certificateRef.current) {
                    const canvas = await html2canvas(certificateRef.current, {
                        scale: 3, // High resolution for crisp text
                        useCORS: true, // For external images
                        logging: false,
                        backgroundColor: '#ffffff'
                    });

                    const imgData = canvas.toDataURL('image/png');
                    // A4 Landscape dimensions in px at 96 DPI is approx 1123x794
                    // We match the PDF size to the canvas aspect ratio
                    const pdf = new jsPDF({
                        orientation: 'landscape',
                        unit: 'px',
                        format: [canvas.width / 3, canvas.height / 3] // Adjusting for scale factor
                    });

                    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3);
                    pdf.save(`OWS_Certificate_${member.name}.pdf`);
                }
                setCertLoading(false);
            }, 2000); // Slightly longer wait to ensure fonts load

        } catch (error) {
            console.error(error);
            alert("Error generating certificate.");
            setCertLoading(false);
        }
    };

    // Helper to determine display role based on category
    const getDisplayRole = (member: any) => {
        const simpleCategories = ['Campus Ambassador', 'Volunteer'];
        if (member.category && !simpleCategories.includes(member.category)) {
            // For Central, Division, District etc. show Category AND Role
            return (
                <div className="flex flex-col items-center">
                    <span className="text-[#1e3a8a] font-bold">{member.role}</span>
                    <span className="text-sm text-slate-500 font-normal uppercase tracking-wider mt-1">{member.category}</span>
                </div>
            );
        }
        // For CA/Volunteer or if no category, just show Role
        return <span className="text-[#1e3a8a] font-bold">{member.role}</span>;
    };

    return (
        <div className="bg-slate-50 min-h-screen">
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
             <section className="py-16 bg-white border-b border-slate-200">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12 shadow-sm border border-blue-100 flex flex-col md:flex-row items-center gap-10">
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">কমিউনিটি মেম্বারশিপ সার্টিফিকেট</h2>
                            <p className="text-slate-600 mb-6">আপনি যদি আমাদের রেজিস্টার্ড কমিউনিটি মেম্বার হয়ে থাকেন, তবে আপনার সার্টিফিকেটটি এখান থেকে ডাউনলোড করুন।</p>
                            {!user && (
                                <button onClick={handleGoogleLogin} className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-full font-bold hover:bg-slate-100 transition shadow-sm">
                                    <ShieldCheck size={18}/> ভেরিফিকেশনের জন্য লগইন করুন
                                </button>
                            )}
                        </div>
                        
                        <div className="flex-1 w-full md:w-auto bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                            <h3 className="font-bold text-slate-800 mb-4 text-center">সার্টিফিকেট জেনারেটর</h3>
                            <form onSubmit={generateCertificate} className="space-y-4">
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="আপনার নাম (বাংলায় বা ইংরেজিতে)" 
                                    value={certName} 
                                    onChange={e => setCertName(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                                />
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="রেজিস্টার্ড মোবাইল নম্বর" 
                                    value={certPhone} 
                                    onChange={e => setCertPhone(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                                />
                                <button 
                                    disabled={!user || certLoading} 
                                    type="submit" 
                                    className={`w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${!user ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'}`}
                                >
                                    {certLoading ? 'জেনারেট হচ্ছে...' : <><Download size={18}/> সার্টিফিকেট ডাউনলোড</>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* HIDDEN CERTIFICATE TEMPLATE */}
            <div style={{ position: 'absolute', top: -9999, left: -9999 }}>
                {previewMember && (
                    <div ref={certificateRef} className="w-[1123px] h-[794px] relative bg-white overflow-hidden text-slate-900 font-['Hind_Siliguri']">
                        
                        {/* --- Background & Border --- */}
                        <div className="absolute inset-0 bg-white"></div>
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        <div className="absolute inset-6 border-[8px] border-[#1e3a8a] z-10"></div>
                        <div className="absolute inset-9 border-[2px] border-[#DAA520] z-10"></div>

                        {/* --- Content Area --- */}
                        <div className="relative z-20 h-full w-full flex flex-col items-center pt-24 pb-12 px-20 text-center">
                            
                            <img src="https://iili.io/f3k62rG.md.png" alt="Logo" className="h-20 object-contain mb-6" />

                            <h1 className="text-5xl font-serif font-bold text-[#1e3a8a] tracking-wide mb-2 uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
                                Certificate of Recognition
                            </h1>
                            <p className="text-lg text-[#DAA520] font-medium tracking-[0.3em] uppercase mb-10">
                                Official Membership
                            </p>

                            <p className="text-xl text-slate-500 font-serif italic mb-4">This certificate is proudly presented to</p>

                            <div className="w-full max-w-3xl border-b-2 border-slate-300 pb-4 mb-6">
                                <h2 className="text-5xl font-bold text-slate-900 capitalize" style={{ fontFamily: 'Hind Siliguri, sans-serif' }}>
                                    {previewMember.nameForCert}
                                </h2>
                            </div>

                            <p className="text-xl text-slate-600 leading-relaxed max-w-4xl mb-8">
                                For successfully securing a verified position as a <span className="font-bold text-[#1e3a8a]">Community Member</span> at 
                                One Way School. We recognize your dedication towards personal development and leadership.
                            </p>

                            <div className="flex justify-center gap-16 mb-16 w-full px-20 items-start">
                                <div className="text-center">
                                    <p className="text-slate-400 text-sm uppercase tracking-wider font-bold mb-1">Membership ID</p>
                                    <p className="text-xl font-mono font-bold text-slate-800">OWS-{previewMember.id ? previewMember.id.slice(0,6).toUpperCase() : 'PENDING'}</p>
                                </div>
                                <div className="text-center border-l border-r border-slate-200 px-16 min-w-[300px]">
                                    <p className="text-slate-400 text-sm uppercase tracking-wider font-bold mb-2">Role / Position</p>
                                    <div className="text-xl">
                                        {getDisplayRole(previewMember)}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-400 text-sm uppercase tracking-wider font-bold mb-1">Date of Issue</p>
                                    <p className="text-xl font-bold text-slate-800">{previewMember.issueDate}</p>
                                </div>
                            </div>

                            <div className="absolute bottom-16 left-0 w-full px-28 flex justify-between items-end">
                                
                                {/* Signature 1 */}
                                <div className="flex flex-col items-center w-56">
                                    <img src="https://iili.io/KB8jgte.md.png" alt="Sig" className="h-14 object-contain mb-[-15px] z-10 filter grayscale brightness-50" />
                                    <div className="w-full h-[1px] bg-slate-400 mb-2"></div>
                                    <p className="font-bold text-slate-800 text-base">Sifatur Rahman</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Founder</p>
                                </div>

                                {/* Signature 2 */}
                                <div className="flex flex-col items-center w-56">
                                    <img src="https://iili.io/KB8j4ou.md.png" alt="Sig" className="h-14 object-contain mb-[-15px] z-10 filter grayscale brightness-50" />
                                    <div className="w-full h-[1px] bg-slate-400 mb-2"></div>
                                    <p className="font-bold text-slate-800 text-base">Faria Hoque</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Co-Founder</p>
                                </div>

                                {/* Signature 3 - FIXED SPELLING */}
                                <div className="flex flex-col items-center w-56">
                                    <img src="https://iili.io/KTuZeGp.png" alt="Sig" className="h-14 object-contain mb-[-15px] z-10 filter grayscale brightness-50" />
                                    <div className="w-full h-[1px] bg-slate-400 mb-2"></div>
                                    <p className="font-bold text-slate-800 text-base">Dipta Halder</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Co-Founder</p>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Affiliate Section */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-6">
                                <Coins size={16} /> প্যাসিভ ইনকাম
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                                এফিলিয়েট হয়ে <br/> <span className="text-blue-600">আয় করুন ঘরে বসেই</span>
                            </h2>
                            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                                আপনার পরিচিতদের মাঝে আমাদের কোর্স রেফার করুন এবং প্রতিটি সফল রেফারেলে পান <span className="font-bold text-slate-900 bg-yellow-100 px-2 rounded">১৫% ইনস্ট্যান্ট বোনাস</span>।
                            </p>
                            <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                                {!user ? (
                                    <div className="text-center">
                                        <p className="text-slate-600 mb-4 font-medium">জয়েন করতে হলে প্রথমে লগইন করুন</p>
                                        <button disabled className="w-full bg-slate-200 text-slate-400 font-bold py-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"><Lock size={18} /> লগইন প্রয়োজন</button>
                                    </div>
                                ) : (
                                    <button onClick={() => handleQuickJoin('Affiliate')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
                                        এক ক্লিকে জয়েন করুন <ArrowRight size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-3xl rotate-3 opacity-20 blur-lg"></div>
                            <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Affiliate Marketing" className="relative rounded-3xl shadow-2xl w-full" />
                        </div>
                    </div>
                </div>
            </section>

             {/* 3. Campus Ambassador Section */}
             <section className="py-20 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-3xl -rotate-3 opacity-20 blur-lg"></div>
                            <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Campus Ambassador" className="relative rounded-3xl shadow-2xl w-full" />
                        </div>
                        <div className="order-1 lg:order-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-bold mb-6">
                                <Award size={16} /> লিডারশিপ প্রোগ্রাম
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                                ক্যাম্পাস <span className="text-purple-600">এম্বাসেডর</span>
                            </h2>
                            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                                আপনার ক্যাম্পাসে One Way School এর প্রতিনিধি হোন। লিডারশিপ স্কিল বাড়ানোর পাশাপাশি ইভেন্ট অর্গানাইজ করা এবং টিম ম্যানেজমেন্ট শেখার সেরা সুযোগ।
                            </p>
                             <div className="bg-slate-50 p-6 rounded-2xl border border-purple-100 shadow-sm">
                                {!user ? (
                                    <div className="text-center">
                                        <p className="text-slate-600 mb-4 font-medium">জয়েন করতে হলে প্রথমে লগইন করুন</p>
                                        <button disabled className="w-full bg-slate-200 text-slate-400 font-bold py-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"><Lock size={18} /> লগইন প্রয়োজন</button>
                                    </div>
                                ) : (
                                    <button onClick={() => handleQuickJoin('Campus Ambassador')} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2">
                                        এম্বাসেডর হিসেবে জয়েন করুন <ArrowRight size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
export default Community;