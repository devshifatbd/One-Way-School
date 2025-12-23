import React from 'react';
import { Globe, Users, Target, CheckCircle, Linkedin, Facebook } from 'lucide-react';

const About: React.FC = () => {
    // Gallery Images (Reused)
     const galleryImages = [
        "https://iili.io/Kowoc2s.md.jpg", "https://iili.io/KxJvPl2.md.jpg", "https://iili.io/KxJviSS.md.jpg",
        "https://iili.io/KxJvrP4.md.jpg", "https://iili.io/KxJvUoG.md.jpg", "https://iili.io/KxJvWMv.md.jpg",
        "https://iili.io/KxJvVoJ.md.jpg", "https://iili.io/KxJv1AF.md.jpg", "https://iili.io/KxJvTZb.md.jpg",
        "https://iili.io/KxJvdjs.md.jpg", "https://iili.io/KxJvIwu.md.jpg", "https://iili.io/KxJKRZF.md.jpg",
        "https://iili.io/KowcUtn.md.jpg", "https://iili.io/KowzCOv.md.jpg", "https://iili.io/fErbDss.md.jpg",
        "https://iili.io/fErpUSR.md.jpg", "https://iili.io/fErDUS2.md.jpg", "https://iili.io/fErti4R.md.jpg",
        "https://iili.io/fErZi57.md.jpg", "https://iili.io/fErZHts.md.jpg", "https://iili.io/fErGFea.md.jpg",
        "https://iili.io/fErE5iB.md.jpg", "https://iili.io/fErRx9V.md.jpg", "https://iili.io/fErA0Qe.md.jpg",
        "https://iili.io/fErA2EJ.md.jpg", "https://iili.io/fErnGJ1.md.jpg", "https://iili.io/fErCn8F.md.jpg",
        "https://iili.io/fErqD5g.md.jpg", "https://iili.io/fEr2Mru.md.jpg", "https://iili.io/fErJmMX.md.jpg",
        "https://iili.io/fErJJTB.md.jpg", "https://iili.io/fErH55Q.md.jpg", "https://iili.io/fEr9elj.md.jpg",
        "https://iili.io/fEgy54j.md.jpg"
    ];

    const row1 = galleryImages.slice(0, Math.ceil(galleryImages.length / 2));
    const row2 = galleryImages.slice(Math.ceil(galleryImages.length / 2));

    const founders = [
        {
            name: "সিফাতুর রহমান",
            role: "ফাউন্ডার, ওয়ান ওয়ে স্কুল",
            image: "https://iili.io/ffuoqnR.md.png",
            color: "border-blue-500",
            bg: "bg-blue-50"
        },
        {
            name: "ফারিয়া হক",
            role: "কো-ফাউন্ডার, ওয়ান ওয়ে স্কুল",
            image: "https://iili.io/ffA2dOl.md.png",
             color: "border-pink-500",
            bg: "bg-pink-50"
        },
        {
            name: "দীপ্ত হালদার",
            role: "কো-ফাউন্ডার, ওয়ান ওয়ে স্কুল",
            image: "https://iili.io/KoHScdv.md.jpg",
             color: "border-purple-500",
            bg: "bg-purple-50"
        }
    ];

    return (
        <div>
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-900">
                <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] animate-float"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px] animate-float-delayed"></div>
                
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        আমাদের <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">সম্পর্কে</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
                        দক্ষতা, নেতৃত্ব এবং উদ্ভাবনের মাধ্যমে আমরা গড়ছি আগামীর বাংলাদেশ। আপনার ক্যারিয়ার যাত্রার বিশ্বস্ত সঙ্গী।
                    </p>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-blue-100 rounded-3xl transform -rotate-3"></div>
                            <img src="https://iili.io/fEr2Mru.md.jpg" alt="Team" className="relative rounded-3xl shadow-xl w-full h-[400px] object-cover" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">আমাদের গল্প</h2>
                            <p className="text-slate-600 text-lg leading-relaxed mb-6">
                                One Way School (OWS) এর যাত্রা শুরু হয় ২০২২ সালের ১২ জুন, একটি স্বপ্ন নিয়ে—বাংলাদেশের শিক্ষাব্যবস্থা এবং প্রফেশনাল জগতের মধ্যে থাকা বিশাল শূন্যতা পূরণ করা। আমরা দেখেছি হাজারো গ্র্যাজুয়েট সার্টিফিকেট নিয়ে বের হচ্ছে, কিন্তু ইন্ডাস্ট্রির প্রয়োজনীয় দক্ষতা তাদের নেই।
                            </p>
                            <p className="text-slate-600 text-lg leading-relaxed">
                                সেই অভাব পূরণের লক্ষ্যেই আমরা তৈরি করেছি এমন একটি ইকোসিস্টেম, যেখানে একজন শিক্ষার্থী শুধুমাত্র শিখবে না, বরং হাতে-কলমে কাজ করে নিজেকে প্রফেশনাল হিসেবে গড়ে তুলবে।
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Founders Section - Creative */}
            <section className="py-20 bg-slate-50 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-[100px]"></div>
                <div className="container mx-auto px-4 max-w-6xl text-center relative z-10">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">আমাদের ফাউন্ডারগণ</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto mb-16">যাদের ভিশনারি নেতৃত্বের মাধ্যমে OWS এগিয়ে যাচ্ছে</p>
                    
                    <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                        {founders.map((founder, index) => (
                            <div key={index} className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border-b-4 ${founder.color}`}>
                                <div className={`h-32 ${founder.bg} relative`}>
                                     <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                </div>
                                <div className="px-6 pb-8 relative">
                                    <div className="w-32 h-32 mx-auto -mt-16 rounded-full p-1 bg-white shadow-lg relative z-10">
                                        <img src={founder.image} alt={founder.name} className="w-full h-full rounded-full object-cover" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mt-4 mb-1">{founder.name}</h3>
                                    <p className="text-sm text-slate-500 uppercase tracking-wide font-medium">{founder.role}</p>
                                    
                                    <div className="flex justify-center gap-4 mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button className="p-2 bg-slate-100 rounded-full hover:bg-blue-600 hover:text-white transition-colors"><Linkedin size={18}/></button>
                                        <button className="p-2 bg-slate-100 rounded-full hover:bg-blue-800 hover:text-white transition-colors"><Facebook size={18}/></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission & Who We Are */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="bg-slate-50 p-10 rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-slate-100 group relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                                <Target className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4 relative z-10">আমাদের মিশন</h3>
                            <p className="text-slate-600 leading-relaxed relative z-10">
                                দক্ষতার অভাবের পাশাপাশি বর্তমান প্রজন্মের আরেকটি বড় সমস্যা হলো—সঠিক ক্যারিয়ার পাথ বা লক্ষ্য নির্ধারণ করতে না পারা। আমরা শিক্ষার্থীদের সেলফ অ্যাসেসমেন্ট (Self Assessment) এবং ক্যারিয়ার কাউন্সিলিং-এর মাধ্যমে তাদের বিভ্রান্তি দূর করি এবং সঠিক গন্তব্যের পথ দেখাই।
                            </p>
                        </div>
                        <div className="bg-slate-50 p-10 rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-slate-100 group relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                                <Users className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4 relative z-10">আমরা কে?</h3>
                            <p className="text-slate-600 leading-relaxed relative z-10">
                                One Way School একটি দক্ষতা উন্নয়ন ও ক্যারিয়ার বিষয়ক প্ল্যাটফর্ম, যার মূল লক্ষ্য বাংলাদেশের শিক্ষিত তরুণ সমাজ এবং প্রফেশনাল জগতের মধ্যে বিদ্যমান দূরত্ব কমিয়ে আনা। আমরা বিশ্বাস করি, কেবল প্রথাগত ডিগ্রি একজন শিক্ষার্থীর ক্যারিয়ার নিশ্চিত করতে যথেষ্ট নয়; এর সাথে প্রয়োজন বাস্তবমুখী দক্ষতা (Practical Skills) এবং সঠিক মানসিকতা।
                            </p>
                        </div>
                    </div>
                </div>
            </section>

             {/* Photo Gallery Marquee */}
            <section className="py-20 bg-slate-900 overflow-hidden">
                <div className="container mx-auto px-4 mb-10 text-center">
                     <h2 className="text-3xl font-bold text-white mb-2">আমাদের গ্যালারি</h2>
                     <p className="text-slate-400">স্মরণীয় কিছু মুহূর্ত</p>
                </div>
                
                <div className="relative w-full overflow-hidden mb-6">
                    <div className="flex w-max animate-marquee gap-4">
                        {[...row1, ...row1].map((img, idx) => (
                            <div key={idx} className="w-64 h-48 md:w-80 md:h-60 rounded-xl overflow-hidden shadow-lg border-2 border-slate-700 flex-shrink-0 relative group">
                                <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                                <img src={img} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative w-full overflow-hidden">
                    <div className="flex w-max animate-marquee-reverse gap-4">
                        {[...row2, ...row2].map((img, idx) => (
                            <div key={idx} className="w-64 h-48 md:w-80 md:h-60 rounded-xl overflow-hidden shadow-lg border-2 border-slate-700 flex-shrink-0 relative group">
                                <div className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                                <img src={img} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};
export default About;