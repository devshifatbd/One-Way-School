
import React, { useState, useRef } from 'react';
import { Award, Search, Lock, Download, ShieldCheck, UserCheck } from 'lucide-react';
import { User } from '../types';
import { getCommunityMemberByPhone } from '../services/firebase';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useOutletContext } from 'react-router-dom';

interface CertificatePortalProps {
    user: User | null;
}

const CertificatePortal: React.FC<CertificatePortalProps> = ({ user }) => {
    const [searchPhone, setSearchPhone] = useState('');
    const [verifiedMember, setVerifiedMember] = useState<any>(null);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [verifyError, setVerifyError] = useState('');
    
    const [certLoading, setCertLoading] = useState(false);
    const certificateRef = useRef<HTMLDivElement>(null);
    const [previewMember, setPreviewMember] = useState<any>(null);

    // Login Modal Context
    const { openLoginModal } = useOutletContext<{ openLoginModal: () => void }>() || { openLoginModal: () => {} };

    const handleVerifyMember = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) {
            // Using modal instead of direct Google sign-in for consistency
            openLoginModal();
            return;
        }

        let phoneInput = searchPhone.replace(/[^0-9]/g, ''); 
        if (phoneInput.startsWith('880')) phoneInput = phoneInput.substring(3);
        if (!phoneInput.startsWith('0')) phoneInput = '0' + phoneInput;
        
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
            setVerifyError("যাচাইকরণে সমস্যা হয়েছে। ইন্টারনেট কানেকশন চেক করুন।");
        }
        setVerifyLoading(false);
    };

    const generateCertificate = async () => {
        if(!verifiedMember) return;
        setCertLoading(true);
        
        setPreviewMember({
            ...verifiedMember,
            nameForCert: verifiedMember.name, 
            issueDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        });

        setTimeout(async () => {
            const element = certificateRef.current;
            if (element) {
                try {
                    const canvas = await html2canvas(element, {
                        scale: 2,
                        useCORS: true,
                        allowTaint: false, 
                        backgroundColor: '#ffffff',
                        width: 1123,
                        height: 794,
                        logging: false,
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
            }
            setCertLoading(false);
            setPreviewMember(null); 
        }, 2500);
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
            {/* Header */}
            <div className="bg-[#1e293b] py-20 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">সার্টিফিকেট পোর্টাল</h1>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                        আপনার অর্জন যাচাই করুন এবং সার্টিফিকেট ডাউনলোড করুন।
                    </p>
                </div>
            </div>

            {/* Verification Section */}
            <section className="py-16 md:py-20 relative">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 shadow-2xl border border-slate-100">
                        <div className="flex flex-col md:flex-row items-center gap-10">
                            
                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-100 text-yellow-700 text-sm font-bold mb-4">
                                    <Award size={16}/> ভেরিফাইড মেম্বারশিপ
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">আপনার সার্টিফিকেট সংগ্রহ করুন</h2>
                                <p className="text-slate-600 mb-6 leading-relaxed">
                                    আপনি যদি আমাদের রেজিস্টার্ড মেম্বার, ভলান্টিয়ার বা এম্বাসেডর হয়ে থাকেন, তবে আপনার মোবাইল নম্বর দিয়ে যাচাই করুন।
                                </p>
                            </div>

                            <div className="flex-1 w-full md:w-auto bg-slate-50 rounded-2xl p-6 border border-slate-200 relative">
                                <h3 className="font-bold text-slate-800 mb-6 text-lg flex items-center gap-2">
                                    <Search className="text-blue-600" size={20}/> মেম্বার যাচাই করুন
                                </h3>

                                {!user ? (
                                    <div className="text-center py-6">
                                        <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Lock size={24}/>
                                        </div>
                                        <p className="text-slate-600 text-sm mb-4 px-4">সার্টিফিকেট যাচাই করতে লগইন প্রয়োজন।</p>
                                        <button onClick={openLoginModal} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition">
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
                                                className="w-full pl-4 pr-12 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-mono"
                                            />
                                            <button 
                                                type="submit"
                                                disabled={verifyLoading}
                                                className="absolute right-1 top-1 bottom-1 bg-slate-900 text-white px-4 rounded-lg font-bold text-sm hover:bg-blue-600 transition-colors disabled:bg-slate-300"
                                            >
                                                {verifyLoading ? '...' : 'Verify'}
                                            </button>
                                        </div>
                                        
                                        {verifyError && <p className="text-red-500 text-sm flex items-center gap-1 font-bold bg-red-50 p-2 rounded-lg"><ShieldCheck size={14}/> {verifyError}</p>}

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
        </div>
    );
};

export default CertificatePortal;
