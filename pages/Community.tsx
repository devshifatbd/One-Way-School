import React, { useState } from 'react';
import { TrendingUp, DollarSign, Award, Users } from 'lucide-react';
import { User } from '../types';
import { saveAffiliate, signInWithGoogle } from '../services/firebase';

interface CommunityProps {
    user: User | null;
}

const Community: React.FC<CommunityProps> = ({ user }) => {
    const [affForm, setAffForm] = useState({
        name: '', phone: '', email: '', 
        class_semester: '', institution: '', type: 'Affiliate'
    });
    const [affImage, setAffImage] = useState<File | null>(null);
    const [affLoading, setAffLoading] = useState(false);

    const handleAffChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const key = e.target.id.startsWith('aff_') ? e.target.id.replace('aff_', '') : e.target.name;
        setAffForm({ ...affForm, [key]: e.target.value });
    };

    const uploadImage = async (file: File) => {
        const formData = new FormData();
        formData.append('key', '6d207e02198a847aa98d0a2a901485a5');
        formData.append('action', 'upload');
        formData.append('source', file);
        formData.append('format', 'json');

        try {
            const response = await fetch('https://freeimage.host/api/1/upload', {
                method: 'POST',
                body: formData
            });
            if(!response.ok) throw new Error("API Error");
            const data = await response.json();
            return data.status_code === 200 ? data.image.url : null;
        } catch (error) {
            console.error("Image upload failed", error);
            return null;
        }
    };

    const handleAffSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert("অনুগ্রহ করে লগইন করুন");
            return;
        }

        setAffLoading(true);
        try {
            let imageUrl = '';
            if (affImage) {
                imageUrl = await uploadImage(affImage) || '';
            }

            const data = {
                ...affForm,
                imageUrl,
                userId: user.uid,
                source: 'community_page'
            };

            await saveAffiliate(data);
            alert("আপনার আবেদন সফলভাবে জমা হয়েছে!");
            setAffForm({ name: '', phone: '', email: '', class_semester: '', institution: '', type: 'Affiliate' });
        } catch (error) {
            alert("Something went wrong");
        } finally {
            setAffLoading(false);
        }
    };

    return (
        <div className="pt-20">
            {/* Header */}
            <div className="bg-slate-900 py-20 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">আমাদের কমিউনিটি</h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                        শিক্ষার্থী এবং প্রফেশনালদের নিয়ে গড়া আমাদের এই বিশাল পরিবারে আপনাকে স্বাগতম।
                    </p>
                </div>
            </div>

            {/* Affiliate & Campus Ambassador Content */}
            <section id="affiliate" className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-br from-slate-900 to-blue-900 text-white">
                 <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                    <div className="absolute -top-20 -left-20 w-60 md:w-96 h-60 md:h-96 bg-blue-500 rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-0 right-0 w-60 md:w-96 h-60 md:h-96 bg-purple-500 rounded-full blur-3xl animate-float-delayed"></div>
                </div>

                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 mb-4 md:mb-6">
                                <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-400" />
                                <span className="text-xs md:text-sm font-medium tracking-wide">Join Our Community Program</span>
                            </div>
                            
                            <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
                                এফিলিয়েট ও ক্যাম্পাস <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">এম্বাসেডর প্রোগ্রাম</span>
                            </h2>
                            
                            <p className="text-slate-300 text-base md:text-lg mb-8 md:mb-10 leading-relaxed">
                                আপনি কি প্যাসিভ ইনকাম করতে চান? অথবা নিজের স্কিল ডেভেলপমেন্টের পাশাপাশি লিডারশিপ প্র্যাকটিস করতে চান? তাহলে আমাদের এই প্রোগ্রামটি আপনার জন্য।
                            </p>

                            <div className="space-y-4 md:space-y-6 mb-8 md:mb-10">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                                        <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg md:text-xl font-bold mb-1">প্যাসিভ ইনকাম</h4>
                                        <p className="text-slate-400 text-xs md:text-sm">রেফারেলের মাধ্যমে নিশ্চিত আয়ের সুযোগ।</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30">
                                        <Award className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg md:text-xl font-bold mb-1">সার্টিফিকেট ও স্কিল ডেভেলপমেন্ট</h4>
                                        <p className="text-slate-400 text-xs md:text-sm">এক্সক্লুসিভ ট্রেনিং সেশন এবং ভেরিফাইড সার্টিফিকেট।</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0 border border-green-500/30">
                                        <Users className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg md:text-xl font-bold mb-1">ইভেন্ট পার্টিসিপেশন</h4>
                                        <p className="text-slate-400 text-xs md:text-sm">আমাদের ইভেন্টগুলোতে ভলেন্টিয়ার এবং অর্গানাইজার হিসেবে কাজ করার অগ্রাধিকার।</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/20 shadow-2xl relative order-1 lg:order-2">
                            <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">আজই জয়েন করুন</h3>
                            
                            <form onSubmit={handleAffSubmit} className="space-y-3 md:space-y-4">
                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-slate-300 mb-1">আপনার নাম</label>
                                    <input type="text" id="aff_name" value={affForm.name} onChange={handleAffChange} placeholder="নাম লিখুন" className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-2.5 md:py-3 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500 transition-colors text-base" />
                                </div>
                                
                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-slate-300 mb-1">মোবাইল নম্বর</label>
                                    <input type="tel" id="aff_phone" value={affForm.phone} onChange={handleAffChange} placeholder="01XXXXXXXXX" className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-2.5 md:py-3 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500 transition-colors text-base" />
                                </div>

                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-slate-300 mb-1">ইমেইল</label>
                                    <input type="email" id="aff_email" value={affForm.email} onChange={handleAffChange} placeholder="example@email.com" className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-2.5 md:py-3 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500 transition-colors text-base" />
                                </div>

                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-slate-300 mb-1">ক্লাস / সেমিস্টার</label>
                                        <input type="text" id="aff_class_semester" value={affForm.class_semester} onChange={handleAffChange} placeholder="ক্লাস / সেমিস্টার" className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-2.5 md:py-3 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500 transition-colors text-base" />
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-slate-300 mb-1">শিক্ষা প্রতিষ্ঠান</label>
                                        <input type="text" id="aff_institution" value={affForm.institution} onChange={handleAffChange} placeholder="প্রতিষ্ঠানের নাম" className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-2.5 md:py-3 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500 transition-colors text-base" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-slate-300 mb-1">আগ্রহের ধরণ</label>
                                    <select id="aff_type" value={affForm.type} onChange={handleAffChange} className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-2.5 md:py-3 focus:outline-none focus:border-blue-500 text-white transition-colors appearance-none cursor-pointer text-base">
                                        <option className="bg-slate-800" value="Affiliate">এফিলিয়েট মার্কেটিং</option>
                                        <option className="bg-slate-800" value="Campus Ambassador">ক্যাম্পাস এম্বাসেডর</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs md:text-sm text-slate-300 mb-1">আপনার ছবি আপলোড করুন</label>
                                    <input type="file" accept="image/*" onChange={(e) => setAffImage(e.target.files?.[0] || null)} className="w-full text-xs md:text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
                                </div>

                                <button disabled={affLoading} type="submit" className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 mt-2 flex items-center justify-center gap-2 text-base">
                                    {affLoading ? "অপেক্ষা করুন..." : "আবেদন জমা দিন"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Community;
