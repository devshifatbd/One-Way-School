import React, { useState } from 'react';
import { 
    ArrowRight, Star, Zap, CheckCircle2, Users, Sparkles, Code2, 
    Globe, Briefcase, TrendingUp, Target, CheckCircle, Phone, 
    Mail, MapPin, ChevronDown, Quote, DollarSign, Award, Gift, UserCircle 
} from 'lucide-react';
import { User } from '../types';
import { saveLead, saveAffiliate, signInWithGoogle } from '../services/firebase';

interface HomeProps {
    user: User | null;
}

const Home: React.FC<HomeProps> = ({ user }) => {
    // Main Lead Form State
    const [leadForm, setLeadForm] = useState({
        name: '', phone: '', email: '', profession: '', goal: '',
        class_semester: '', institution_type: '', institution_name: '',
        company_name: '', designation: ''
    });
    const [leadImage, setLeadImage] = useState<File | null>(null);
    const [leadLoading, setLeadLoading] = useState(false);
    const [leadSuccess, setLeadSuccess] = useState(false);

    // Affiliate Form State
    const [affForm, setAffForm] = useState({
        name: '', phone: '', email: '', 
        class_semester: '', institution: '', type: 'Affiliate'
    });
    const [affImage, setAffImage] = useState<File | null>(null);
    const [affLoading, setAffLoading] = useState(false);

    // --- Helpers ---
    const handleLeadChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setLeadForm({ ...leadForm, [e.target.name]: e.target.value });
    };

    const handleAffChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setAffForm({ ...affForm, [e.target.id.replace('aff_', '')]: e.target.value });
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

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    };

    // --- Handlers ---
    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert("অনুগ্রহ করে লগইন করুন");
            return;
        }

        setLeadLoading(true);
        try {
            let imageUrl = '';
            if (leadImage) {
                imageUrl = await uploadImage(leadImage) || '';
            }

            const data = {
                name: leadForm.name,
                phone: leadForm.phone,
                email: leadForm.email,
                profession: leadForm.profession,
                goal: leadForm.goal,
                imageUrl,
                userId: user.uid,
                source: 'web_landing_v2',
                details: leadForm.profession === 'student' ? {
                    class_semester: leadForm.class_semester,
                    institution_type: leadForm.institution_type,
                    institution_name: leadForm.institution_name
                } : {
                    company_name: leadForm.company_name,
                    designation: leadForm.designation
                }
            };

            await saveLead(data);
            setLeadSuccess(true);
            setLeadForm({
                name: '', phone: '', email: '', profession: '', goal: '',
                class_semester: '', institution_type: '', institution_name: '',
                company_name: '', designation: ''
            });
        } catch (error) {
            alert("Something went wrong");
        } finally {
            setLeadLoading(false);
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
                source: 'affiliate_program'
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
        <div>
            {/* Hero Section */}
            <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-900">
                <div className="absolute top-[-10%] right-[-5%] w-[400px] md:w-[700px] h-[400px] md:h-[700px] bg-blue-600/20 rounded-full blur-[100px] animate-float"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-600/20 rounded-full blur-[100px] animate-float-delayed"></div>
                
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-center lg:text-left order-2 lg:order-1">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 mb-8 animate-fade-in-up">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-sm font-medium tracking-wide">বাংলাদেশের সেরা ক্যারিয়ার প্লাটফর্ম</span>
                            </div>
                            
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                                নিজেকে গড়ুন <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">আগামীর জন্য</span>
                            </h1>
                            
                            <p className="text-lg md:text-xl text-slate-300 mb-8 font-light leading-relaxed">
                                দক্ষতা, দিকনির্দেশনা এবং সাফল্যের পথে আপনার <span className="text-white font-medium border-b-2 border-blue-500">একমুখী যাত্রা</span>।
                                আমরা কাঁচা মাটিকে দক্ষ মানবসম্পদে রূপান্তর করি।
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                                <button onClick={() => scrollToSection('program')} className="group bg-white text-slate-900 px-8 py-3.5 rounded-full font-bold text-base md:text-lg hover:bg-blue-50 transition-all shadow-lg flex items-center justify-center gap-2">
                                    আমাদের প্রোগ্রাম 
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button onClick={() => scrollToSection('contact')} className="px-8 py-3.5 rounded-full font-bold text-base md:text-lg text-white border border-white/30 hover:bg-white/10 backdrop-blur-sm transition-all flex items-center justify-center gap-2 group">
                                    <Zap className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
                                    রেজিস্ট্রেশন করুন
                                </button>
                            </div>
                        </div>

                        <div className="relative order-1 lg:order-2 flex justify-center perspective-1000">
                            <div className="relative w-full max-w-lg">
                                <div className="absolute inset-0 m-auto w-[90%] h-[90%] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full blur-[2px] opacity-20 animate-pulse"></div>
                                <img src="https://iili.io/KFXRLiv.md.png" alt="Hero Person" className="relative z-10 w-full h-auto object-contain drop-shadow-2xl animate-float" style={{maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)'}} />
                                
                                <div className="absolute bottom-20 -right-4 md:right-0 z-20 glass-card p-3 rounded-xl flex items-center gap-3 animate-float-delayed">
                                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h5 className="text-white font-bold text-sm">সফল ক্যারিয়ার</h5>
                                        <p className="text-slate-300 text-[10px]">১০০% গাইডলাইন</p>
                                    </div>
                                </div>

                                <div className="absolute bottom-10 left-0 z-20 glass-card p-3 rounded-xl flex items-center gap-3 animate-float-slow">
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h5 className="text-white font-bold text-sm">কমিউনিটি</h5>
                                        <p className="text-slate-300 text-[10px]">৫০০+ মেম্বার</p>
                                    </div>
                                </div>

                                <div className="absolute top-0 left-10 z-0 opacity-50 animate-spin-slow">
                                     <Sparkles className="w-8 h-8 text-yellow-400" />
                                </div>
                                <div className="absolute top-20 right-10 z-20 opacity-50 animate-bounce">
                                     <Code2 className="w-8 h-8 text-cyan-400" />
                                </div>
                                <div className="absolute inset-0 border-2 border-dashed border-slate-600/30 rounded-full w-[110%] h-[110%] -left-[5%] -top-[5%] z-0 animate-spin-slow" style={{animationDuration: '30s'}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-16 md:py-24 bg-white relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
                        <div className="relative order-2 lg:order-1">
                            <h2 className="text-base md:text-lg font-bold text-blue-600 uppercase tracking-wider mb-2">আমাদের পরিচয়</h2>
                            <h3 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                                শিক্ষিত তরুণ ও প্রফেশনাল জগতের <span className="gradient-text">সেতুবন্ধন</span>
                            </h3>
                            <p className="text-base md:text-lg text-slate-600 mb-6 leading-relaxed">
                                One Way School কোনো গতানুগতিক ট্রেনিং সেন্টার নয়। আমরা এমন একটি ইকোসিস্টেম তৈরি করেছি যেখানে একজন শিক্ষার্থী প্রথাগত ডিগ্রির বাইরে বাস্তবমুখী দক্ষতা ও সঠিক মানসিকতা অর্জন করতে পারে।
                            </p>
                            
                            <div className="bg-slate-50 p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm mt-6 card-hover-zoom cursor-default">
                                <h4 className="flex items-center gap-2 font-bold text-slate-800 text-lg md:text-xl mb-3">
                                    <Globe className="w-5 h-5 md:w-6 md:h-6 text-blue-600 card-icon" />
                                    আমাদের মিশন
                                </h4>
                                <p className="text-sm md:text-base text-slate-600">
                                    সেলফ অ্যাসেসমেন্ট এবং ক্যারিয়ার কাউন্সিলিং-এর মাধ্যমে শিক্ষার্থীদের বিভ্রান্তি দূর করা এবং সঠিক গন্তব্যের পথ দেখানো।
                                </p>
                            </div>
                        </div>

                        <div className="relative group perspective-1000 order-1 lg:order-2 mb-8 lg:mb-0">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 rounded-3xl rotate-2 opacity-20 group-hover:rotate-6 transition-transform duration-500"></div>
                            <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-100 relative z-10">
                                <div className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs md:text-sm font-bold mb-4 md:mb-6">বর্তমান সংকট (Paradox)</div>
                                <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 md:mb-6">কেন এই দূরত্ব?</h3>
                                
                                <div className="space-y-4 md:space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-red-50 rounded-full flex items-center justify-center shrink-0 icon-hover-bounce cursor-pointer">
                                            <Users className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm md:text-base">গ্র্যাজুয়েটদের হতাশা</h4>
                                            <p className="text-xs md:text-sm text-slate-500 mt-1">হাজার হাজার গ্র্যাজুয়েট তাদের কাঙ্ক্ষিত চাকরি পাচ্ছেন না।</p>
                                        </div>
                                    </div>
                                    <div className="w-full h-px bg-slate-100"></div>
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 rounded-full flex items-center justify-center shrink-0 icon-hover-bounce cursor-pointer">
                                            <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm md:text-base">কোম্পানির আক্ষেপ</h4>
                                            <p className="text-xs md:text-sm text-slate-500 mt-1">কোম্পানিগুলো হন্যে হয়ে খুঁজলেও দক্ষ কর্মী (Skilled Resource) পাচ্ছেন না।</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 md:mt-8 bg-gradient-to-r from-blue-500 to-violet-500 text-white p-3 md:p-4 rounded-xl text-center text-sm md:text-base font-bold shadow-lg shadow-blue-500/30">
                                    সমাধান: One Way School Ecosystem
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4 Pillars */}
            <section className="py-16 md:py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent"></div>

                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="text-center mb-12 md:mb-20">
                        <div className="inline-block mb-6">
                            <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">আমাদের দর্শন</h2>
                            <div className="h-1.5 w-24 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full mx-auto mt-3"></div>
                        </div>
                        
                        <div className="max-w-3xl mx-auto mt-4 relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-slate-900/80 backdrop-blur-xl ring-1 ring-white/10 rounded-2xl p-8 md:p-10 shadow-2xl">
                                <Quote className="absolute top-6 left-6 w-8 h-8 text-blue-500/20 rotate-180" />
                                <p className="text-slate-300 text-base md:text-xl leading-relaxed font-light">
                                    আমরা ক্যারিয়ার গঠনে <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-bold">"4 Pillars of Success"</span> বা চারটি অপরিহার্য স্তম্ভে বিশ্বাসী। একজন মানুষ চাকরি করুক বা ব্যবসা, তার সাফল্যের জন্য এই চারটি দক্ষতা <span className="text-white font-medium border-b border-blue-500/50 pb-0.5">বাধ্যতামূলক</span>।
                                </p>
                                <Quote className="absolute bottom-6 right-6 w-8 h-8 text-violet-500/20" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {/* Sales */}
                        <div className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 md:p-8 rounded-2xl hover:border-slate-500 transition-all duration-300 hover:-translate-y-2 card-hover-zoom">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"></div>
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 md:mb-6 shadow-lg">
                                <Briefcase className="text-white w-6 h-6 md:w-7 md:h-7 card-icon" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 group-hover:text-white transition-colors">Sales</h3>
                            <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300">আইডিয়া, প্রোডাক্ট বা সার্ভিস—সবকিছুই সেল করার দক্ষতা।</p>
                        </div>
                        {/* Communication */}
                        <div className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 md:p-8 rounded-2xl hover:border-slate-500 transition-all duration-300 hover:-translate-y-2 card-hover-zoom">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"></div>
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 md:mb-6 shadow-lg">
                                <Users className="text-white w-6 h-6 md:w-7 md:h-7 card-icon" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 group-hover:text-white transition-colors">Communication</h3>
                            <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300">করপোরেট ও প্রফেশনাল কমিউনিকেশনে পারদর্শিতা।</p>
                        </div>
                        {/* Networking */}
                        <div className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 md:p-8 rounded-2xl hover:border-slate-500 transition-all duration-300 hover:-translate-y-2 card-hover-zoom">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"></div>
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4 md:mb-6 shadow-lg">
                                <TrendingUp className="text-white w-6 h-6 md:w-7 md:h-7 card-icon" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 group-hover:text-white transition-colors">Networking</h3>
                            <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300">সঠিক মানুষের সাথে সংযোগ তৈরি ও সম্পর্ক রক্ষা।</p>
                        </div>
                        {/* EQ */}
                        <div className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 md:p-8 rounded-2xl hover:border-slate-500 transition-all duration-300 hover:-translate-y-2 card-hover-zoom">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"></div>
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 md:mb-6 shadow-lg">
                                <Target className="text-white w-6 h-6 md:w-7 md:h-7 card-icon" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 group-hover:text-white transition-colors">Emotional Intelligence</h3>
                            <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300">কর্মক্ষেত্রে নিজের ও অন্যের আবেগ ব্যবস্থাপনা।</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Program Roadmap */}
            <section id="program" className="py-16 md:py-24 bg-slate-50 relative">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-3 md:mb-4">Talent Matchmaking <span className="text-blue-600">Ecosystem</span></h2>
                        <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">
                            ৪ মাসের একটি কমপ্লিট জার্নি যা আপনাকে কাঁচা মাটি থেকে দক্ষ মানবসম্পদে রূপান্তর করবে
                        </p>
                    </div>

                    <div className="max-w-5xl mx-auto relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-green-500 -translate-x-1/2 rounded-full opacity-30"></div>
                        <div className="md:hidden absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-green-500 rounded-full opacity-30"></div>

                        {/* Step 1 */}
                        <div className="relative md:grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-12 md:mb-0 pl-12 md:pl-0">
                            <div className="md:text-right md:pr-12 mb-6 md:mb-0">
                                <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs md:text-sm font-bold mb-3">প্রথম ৩ মাস</div>
                                <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-3 md:mb-4">স্কিল ডেভেলপমেন্ট</h3>
                                <ul className="space-y-2 text-slate-600 md:flex md:flex-col md:items-end text-sm md:text-base">
                                    <li className="flex items-center gap-2 md:flex-row-reverse">
                                        <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" /> অনলাইন ক্লাস ও মেন্টরশিপ
                                    </li>
                                    <li className="flex items-center gap-2 md:flex-row-reverse">
                                        <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" /> ৪টি কোর স্কিল ট্রেনিং
                                    </li>
                                    <li className="flex items-center gap-2 md:flex-row-reverse">
                                        <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" /> ইন্ডাস্ট্রি এক্সপার্ট সেশন
                                    </li>
                                </ul>
                            </div>
                            
                            {/* Center Dot */}
                            <div className="absolute left-0 md:left-1/2 top-0 md:top-1/2 -translate-y-0 md:-translate-y-1/2 -translate-x-0 md:-translate-x-1/2 w-12 h-12 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center shadow-lg z-10 icon-hover-bounce cursor-default">
                                <span className="font-bold text-blue-600">1</span>
                            </div>

                            <div className="md:pl-12">
                                <div className="bg-white p-5 md:p-6 rounded-2xl shadow-lg border border-slate-100 transform hover:scale-105 transition duration-300">
                                    <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Learning" className="w-full h-40 md:h-48 object-cover rounded-xl mb-4" />
                                    <p className="text-xs md:text-sm text-slate-500 italic">"শিখুন তাদের কাছ থেকে, যারা ইন্ডাস্ট্রিতে সেরা।"</p>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative md:grid md:grid-cols-2 gap-8 md:gap-12 items-center mt-12 md:mt-24 pl-12 md:pl-0">
                            <div className="order-2 md:order-1 md:pr-12">
                                <div className="bg-white p-5 md:p-6 rounded-2xl shadow-lg border border-slate-100 transform hover:scale-105 transition duration-300">
                                    <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Internship" className="w-full h-40 md:h-48 object-cover rounded-xl mb-4" />
                                    <p className="text-xs md:text-sm text-slate-500 italic">"বাস্তব অভিজ্ঞতা, নিশ্চিত ক্যারিয়ার।"</p>
                                </div>
                            </div>

                            {/* Center Dot */}
                            <div className="absolute left-0 md:left-1/2 top-0 md:top-1/2 -translate-y-0 md:-translate-y-1/2 -translate-x-0 md:-translate-x-1/2 w-12 h-12 bg-white border-4 border-green-500 rounded-full flex items-center justify-center shadow-lg z-10 icon-hover-bounce cursor-default">
                                <span className="font-bold text-green-600">2</span>
                            </div>

                            <div className="order-1 md:order-2 md:pl-12 mb-6 md:mb-0">
                                <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs md:text-sm font-bold mb-3">শেষ ১ মাস</div>
                                <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-3 md:mb-4">প্র্যাক্টিক্যাল অ্যাপ্লিকেশন</h3>
                                <ul className="space-y-2 text-slate-600 text-sm md:text-base">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> ইন্টার্নশিপ (অফলাইন/অনলাইন)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> ইন্ডাস্ট্রিয়াল ভিজিট
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> জব প্লেসমেন্ট সাপোর্ট
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section id="benefits" className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-3 md:mb-4">মেম্বারশিপ বেনিফিট</h2>
                        <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">এক্সক্লুসিভ সুবিধা যা আপনার ক্যারিয়ারকে দেবে ভিন্ন মাত্রা</p>
                        <div className="w-20 md:w-24 h-1.5 bg-gradient-to-r from-blue-500 to-violet-500 mx-auto mt-4 md:mt-6 rounded-full"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        
                        {/* Large Item */}
                        <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
                            <div className="relative z-10">
                                <div className="bg-white/20 w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-4 md:mb-6 backdrop-blur-sm card-hover-zoom">
                                    <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-white card-icon" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">গ্যারান্টেড ইন্টার্নশিপ & জব সাপোর্ট</h3>
                                <p className="text-blue-100 mb-6 text-sm md:text-lg leading-relaxed">
                                    কোর্স শেষে বসে থাকা নয়। আমরা নিশ্চিত করি ১ মাসের ইন্টার্নশিপ। অফলাইন ইন্টার্নশিপে থাকছে সম্মানী। এরপর পার্টনার কোম্পানিতে চাকরির সুযোগ।
                                </p>
                                <div className="flex gap-3 flex-wrap">
                                    <span className="px-3 py-1.5 md:px-4 md:py-2 bg-white/20 rounded-full text-xs md:text-sm font-medium backdrop-blur-sm">অফলাইন ইন্টার্নশিপ</span>
                                    <span className="px-3 py-1.5 md:px-4 md:py-2 bg-white/20 rounded-full text-xs md:text-sm font-medium backdrop-blur-sm">জব প্লেসমেন্ট</span>
                                </div>
                            </div>
                        </div>

                        {/* Exclusive Gift */}
                        <div className="md:row-span-2 relative bg-gradient-to-bl from-rose-500 to-pink-600 rounded-3xl p-6 md:p-8 text-white shadow-2xl overflow-hidden group hover:shadow-pink-500/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 animate-pulse"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
                            
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/30 icon-hover-bounce cursor-default">
                                        <Gift className="w-6 h-6 md:w-7 md:h-7 text-white" />
                                    </div>
                                    <span className="bg-yellow-400 text-slate-900 text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full uppercase tracking-wider shadow-lg">Premium</span>
                                </div>

                                <h3 className="text-2xl md:text-3xl font-bold mb-2">এক্সক্লুসিভ গিফট</h3>
                                <p className="text-pink-100 text-xs md:text-sm mb-6 md:mb-8 opacity-90">শুধুমাত্র আমাদের রেজিস্টার্ড মেম্বারদের জন্য বিশেষ উপহার।</p>
                                
                                <div className="space-y-3 md:space-y-4 flex-grow">
                                    <div className="flex items-center gap-3 md:gap-4 bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-default">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg text-base md:text-lg">🎁</div>
                                        <div>
                                            <strong className="block text-white text-base md:text-lg">ওয়েলকাম কিট</strong>
                                            <span className="text-[10px] md:text-xs text-pink-100 opacity-80">ব্র্যান্ডেড টি-শার্ট, নোটবুক ও কলম</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 md:gap-4 bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-default">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg text-base md:text-lg">💳</div>
                                        <div>
                                            <strong className="block text-white text-base md:text-lg">মেম্বারশিপ কার্ড</strong>
                                            <span className="text-[10px] md:text-xs text-pink-100 opacity-80">OWS প্রিমিয়াম কমিউনিটি এক্সেস</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 md:gap-4 bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-default">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-purple-400 to-violet-500 flex items-center justify-center shrink-0 shadow-lg text-base md:text-lg">🎟️</div>
                                        <div>
                                            <strong className="block text-white text-base md:text-lg">ইভেন্ট ডিসকাউন্ট</strong>
                                            <span className="text-[10px] md:text-xs text-pink-100 opacity-80">সকল ইভেন্টে ফ্ল্যাট ২৫% আজীবন ছাড়</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 md:mt-8 text-center">
                                    <p className="text-[10px] md:text-xs text-pink-200 italic border-t border-white/20 pt-4">"আপনার শুরুটা হোক চমকপ্রদ"</p>
                                </div>
                            </div>
                        </div>

                        {/* Personal Branding */}
                        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden group hover:shadow-violet-500/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                            <div className="relative z-10">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 md:mb-6 shadow-inner border border-white/20 icon-hover-spin">
                                    <UserCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                </div>
                                <h3 className="text-lg md:text-xl font-bold mb-2">পার্সোনাল ব্র্যান্ডিং</h3>
                                <p className="text-violet-100 text-xs md:text-sm mb-0 leading-relaxed">
                                    সিভি রিভিউ, লিংকডইন অপ্টিমাইজেশন এবং মক ইন্টারভিউ সেশনের মাধ্যমে নিজেকে কর্পোরেট জগতের জন্য তৈরি করুন।
                                </p>
                            </div>
                        </div>

                        {/* Recognition */}
                        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden group hover:shadow-orange-500/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -ml-10 -mb-10 group-hover:scale-110 transition-transform"></div>
                            <div className="relative z-10">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 md:mb-6 shadow-inner border border-white/20 icon-hover-bounce">
                                    <Award className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                </div>
                                <h3 className="text-lg md:text-xl font-bold mb-2">স্বীকৃতি</h3>
                                <p className="text-orange-100 text-xs md:text-sm mb-0 leading-relaxed">
                                    কোর্স শেষে ভেরিফাইড সার্টিফিকেট এবং টপ পারফর্মারদের জন্য থাকছে বিশেষ 'বেস্ট লার্নার অ্যাওয়ার্ড'।
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact & Lead Form (REORDERED: After Benefits) */}
            <section id="contact" className="py-16 md:py-24 bg-slate-900 text-white relative">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-[200px] -left-[200px] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]"></div>
                    <div className="absolute -bottom-[200px] -right-[200px] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[100px]"></div>
                </div>

                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-8 md:gap-12 bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-3xl p-6 md:p-12 shadow-2xl">
                        
                        <div className="lg:col-span-2 flex flex-col justify-between">
                            <div className="mb-8 lg:mb-0">
                                <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">যুক্ত হোন <br/><span className="text-blue-400">সাফল্যের যাত্রায়</span></h2>
                                <p className="text-slate-300 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                                    দেরি না করে আজই রেজিস্ট্রেশন করুন। আপনার স্বপ্নের ক্যারিয়ার গড়ার এখনই সঠিক সময়।
                                </p>
                                <div className="space-y-4 md:space-y-6">
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-700/50 flex items-center justify-center group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-all border border-slate-600 group-hover:border-blue-500/50 shrink-0">
                                            <Phone className="w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                        <div>
                                            <p className="text-base md:text-lg font-medium text-white">+880 1626-777076</p>
                                            <p className="text-xs md:text-sm text-slate-400">কল করুন সকাল ১০টা - রাত ৮টা</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-700/50 flex items-center justify-center group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-all border border-slate-600 group-hover:border-blue-500/50 shrink-0">
                                            <Mail className="w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                        <div>
                                            <p className="text-base md:text-lg font-medium text-white break-all">info@onewayschool.com</p>
                                            <p className="text-xs md:text-sm text-slate-400">যেকোনো তথ্যের জন্য মেইল করুন</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-700/50 flex items-center justify-center group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-all border border-slate-600 group-hover:border-blue-500/50 shrink-0">
                                            <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                        <div>
                                            <p className="text-base md:text-lg font-medium text-white">ঢাকা, বাংলাদেশ</p>
                                            <p className="text-xs md:text-sm text-slate-400">আমাদের অফিস লোকেশন</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 md:mt-8 pt-6 md:pt-8 border-t border-slate-700/50">
                                <p className="text-xs md:text-sm text-slate-400">© 2025 One Way School</p>
                            </div>
                        </div>

                        <div className="lg:col-span-3 bg-white rounded-2xl p-6 md:p-8 text-slate-800 shadow-xl">
                            {leadSuccess ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-md icon-hover-bounce">
                                        <CheckCircle className="w-8 h-8 md:w-10 md:h-10" />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-3">অভিনন্দন!</h3>
                                    <p className="text-sm md:text-base text-slate-600 mb-8 max-w-xs mx-auto">আপনার আবেদন সফলভাবে জমা হয়েছে। আমাদের টিম খুব শীঘ্রই আপনার সাথে যোগাযোগ করবে।</p>
                                    <button onClick={() => setLeadSuccess(false)} className="text-blue-600 font-bold hover:bg-blue-50 px-6 py-2 rounded-full transition">
                                        নতুন আবেদন করুন
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleLeadSubmit} className="space-y-4 md:space-y-5">
                                    <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4 text-slate-800">আপনি যদি আগ্রহী হোন তাহলে নিচের ফরমটি ফিলাপ করুন</h3>
                                    
                                    <input type="text" name="name" required value={leadForm.name} onChange={handleLeadChange} placeholder="আপনার নাম" className="w-full px-4 md:px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base" />

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <input type="tel" name="phone" required value={leadForm.phone} onChange={handleLeadChange} placeholder="মোবাইল নম্বর" className="w-full px-4 md:px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base" />
                                        <input type="email" name="email" value={leadForm.email} onChange={handleLeadChange} placeholder="ইমেইল (অপশনাল)" className="w-full px-4 md:px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base" />
                                    </div>
                                    
                                    <div className="relative">
                                        <select name="profession" value={leadForm.profession} onChange={handleLeadChange} className="w-full px-4 md:px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-slate-600 text-base cursor-pointer">
                                            <option value="" disabled>আপনার পেশা নির্বাচন করুন</option>
                                            <option value="student">শিক্ষার্থী</option>
                                            <option value="job_holder">চাকুরিজীবী</option>
                                            <option value="others">অন্যান্য</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                                    </div>

                                    {leadForm.profession === 'student' && (
                                        <div className="space-y-4 animate-fade-in">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <input name="class_semester" value={leadForm.class_semester} onChange={handleLeadChange} placeholder="ক্লাস / সেমিস্টার" className="w-full px-4 md:px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base" />
                                                <div className="relative">
                                                    <select name="institution_type" value={leadForm.institution_type} onChange={handleLeadChange} className="w-full px-4 md:px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-slate-600 text-base cursor-pointer">
                                                        <option value="" disabled>প্রতিষ্ঠানের ধরণ</option>
                                                        <option value="Public">পাবলিক</option>
                                                        <option value="Private">প্রাইভেট</option>
                                                        <option value="National">জাতীয়</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                                                </div>
                                            </div>
                                            <input name="institution_name" value={leadForm.institution_name} onChange={handleLeadChange} placeholder="শিক্ষা প্রতিষ্ঠানের নাম" className="w-full px-4 md:px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base" />
                                        </div>
                                    )}

                                    {leadForm.profession === 'job_holder' && (
                                        <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
                                            <input name="company_name" value={leadForm.company_name} onChange={handleLeadChange} placeholder="কোম্পানির নাম" className="w-full px-4 md:px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base" />
                                            <input name="designation" value={leadForm.designation} onChange={handleLeadChange} placeholder="আপনার পদবী" className="w-full px-4 md:px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base" />
                                        </div>
                                    )}

                                    <div className="relative group">
                                        <label className="block text-sm text-slate-500 mb-2">আপনার ছবি আপলোড করুন</label>
                                        <input type="file" accept="image/*" onChange={(e) => setLeadImage(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                                    </div>

                                    <textarea name="goal" required value={leadForm.goal} onChange={handleLeadChange} rows={2} className="w-full px-4 md:px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base" placeholder="আপনার ফিউচার গোল / লক্ষ্য কী?"></textarea>

                                    <button disabled={leadLoading} type="submit" className="w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold py-3.5 md:py-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                        {leadLoading ? "প্রসেসিং..." : "সাবমিট করুন"}
                                        {!leadLoading && <ArrowRight className="w-5 h-5" />}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials - REORDERED: Now AFTER Contact */}
            <section id="testimonials" className="py-16 md:py-24 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                <div className="absolute -left-20 top-40 w-72 h-72 bg-blue-500/10 rounded-full blur-[80px]"></div>
                <div className="absolute -right-20 bottom-20 w-72 h-72 bg-violet-500/10 rounded-full blur-[80px]"></div>

                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-3 md:mb-4">কর্পোরেট লিডাররা কী বলছেন?</h2>
                        <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">ইন্ডাস্ট্রি এক্সপার্টদের চোখে আমাদের শিক্ষার্থীদের দক্ষতা ও সম্ভাবনা</p>
                        <div className="w-20 md:w-24 h-1.5 bg-gradient-to-r from-blue-500 to-violet-500 mx-auto mt-4 md:mt-6 rounded-full"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                        {/* Card 1 */}
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-100 relative group hover:-translate-y-2 transition-transform duration-300">
                            <Quote className="absolute top-6 right-6 md:top-8 md:right-8 text-blue-100 group-hover:text-blue-200 transition-colors w-10 h-10 md:w-12 md:h-12 rotate-180 fill-current" />
                            <div className="flex items-center gap-4 mb-4 md:mb-6">
                                <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Leader" className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-blue-500 p-0.5 card-hover-zoom" />
                                <div>
                                    <h4 className="font-bold text-slate-900 text-base md:text-lg">Tanvir Ahmed</h4>
                                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">CEO, TechNext</p>
                                </div>
                            </div>
                            <p className="text-slate-600 text-sm md:text-base leading-relaxed relative z-10">
                                "One Way School থেকে আসা ইন্টার্নরা অত্যন্ত দক্ষ এবং পেশাদার। তাদের কমিউনিকেশন স্কিল এবং কাজের প্রতি ডেডিকেশন সত্যিই প্রশংসনীয়।"
                            </p>
                            <div className="flex text-yellow-400 mt-4 gap-1">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                            </div>
                        </div>
                        {/* Card 2 */}
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-100 relative group hover:-translate-y-2 transition-transform duration-300 mt-0 md:-mt-4">
                            <Quote className="absolute top-6 right-6 md:top-8 md:right-8 text-purple-100 group-hover:text-purple-200 transition-colors w-10 h-10 md:w-12 md:h-12 rotate-180 fill-current" />
                            <div className="flex items-center gap-4 mb-4 md:mb-6">
                                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Leader" className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-purple-500 p-0.5 card-hover-zoom" />
                                <div>
                                    <h4 className="font-bold text-slate-900 text-base md:text-lg">Sabrina Rahman</h4>
                                    <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">HR Head, Creative IT</p>
                                </div>
                            </div>
                            <p className="text-slate-600 text-sm md:text-base leading-relaxed relative z-10">
                                "আমরা এখান থেকে বেশ কয়েকজন গ্র্যাজুয়েট নিয়োগ দিয়েছি। তাদের টেকনিক্যাল নলেজ এবং প্রবলেম সলভিং অ্যাবিলিটি আমাদের প্রজেক্টে দারুণ ভ্যালু অ্যাড করেছে।"
                            </p>
                            <div className="flex text-yellow-400 mt-4 gap-1">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                            </div>
                        </div>
                        {/* Card 3 */}
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-100 relative group hover:-translate-y-2 transition-transform duration-300">
                            <Quote className="absolute top-6 right-6 md:top-8 md:right-8 text-green-100 group-hover:text-green-200 transition-colors w-10 h-10 md:w-12 md:h-12 rotate-180 fill-current" />
                            <div className="flex items-center gap-4 mb-4 md:mb-6">
                                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Leader" className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-green-500 p-0.5 card-hover-zoom" />
                                <div>
                                    <h4 className="font-bold text-slate-900 text-base md:text-lg">Rafiqul Islam</h4>
                                    <p className="text-xs text-green-600 font-bold uppercase tracking-wider">MD, SoftPark</p>
                                </div>
                            </div>
                            <p className="text-slate-600 text-sm md:text-base leading-relaxed relative z-10">
                                "কর্পোরেট জগত এবং অ্যাকাডেমিক গ্যাপ পূরণে OWS দারুণ কাজ করছে। এখানকার শিক্ষার্থীরা ইন্ডাস্ট্রির জন্য সম্পূর্ণ প্রস্তুত হয়েই বের হয়।"
                            </p>
                            <div className="flex text-yellow-400 mt-4 gap-1">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Affiliate & Campus Ambassador */}
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

export default Home;
