import React from 'react';
import { ArrowRight, BookOpen, UserCheck, Briefcase, Zap, Star, CheckCircle } from 'lucide-react';

const Ecosystem: React.FC = () => {
    return (
        <div>
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-900">
                <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] animate-float"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px] animate-float-delayed"></div>
                
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <span className="text-blue-400 font-bold tracking-wider text-sm uppercase mb-4 block">Roadmap to Success</span>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        আমাদের <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">ইকোসিস্টেম</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
                        আমরা গতানুগতিক ট্রেনিং সেন্টারের মতো নই। এটি একটি কমপ্লিট জার্নি যা আপনাকে জিরো থেকে হিরো বানাতে সাহায্য করবে।
                    </p>
                </div>
            </section>

            {/* Program Roadmap (Copied from Home) */}
            <section className="py-16 md:py-24 bg-slate-50 relative">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-3 md:mb-4">৪ মাসের কমপ্লিট জার্নি</h2>
                        <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">
                            ধাপে ধাপে আপনাকে দক্ষ মানবসম্পদে রূপান্তর করার প্রক্রিয়া
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

            {/* Detailed Phase Breakdown */}
            <div className="container mx-auto px-4 pb-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900">বিস্তারিত ধাপসমূহ</h2>
                </div>
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
                    {/* Step 1 */}
                    <div className="bg-white rounded-2xl p-8 shadow-xl border-t-4 border-blue-500 relative overflow-hidden group hover:-translate-y-2 transition-transform">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl mb-6">১</div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">লার্নিং ফেইজ</h3>
                        <p className="text-slate-600 mb-4">প্রথম ৩ মাস নিবিড় প্রশিক্ষণ। যেখানে আমরা ফোকাস করি:</p>
                        <ul className="space-y-2 text-slate-500 text-sm">
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div> টেকনিক্যাল স্কিল</li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div> সফট স্কিল (কমিউনিকেশন)</li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div> লিডারশিপ কোয়ালিটি</li>
                        </ul>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white rounded-2xl p-8 shadow-xl border-t-4 border-green-500 relative overflow-hidden group hover:-translate-y-2 transition-transform">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 font-bold text-xl mb-6">২</div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">ইন্টার্নশিপ</h3>
                        <p className="text-slate-600 mb-4">শিক্ষার পর ১ মাসের গ্যারান্টেড ইন্টার্নশিপ:</p>
                        <ul className="space-y-2 text-slate-500 text-sm">
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div> রিয়েল লাইফ প্রজেক্ট</li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div> অফিস এনভায়রনমেন্ট</li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div> টিম কোলাবোরেশন</li>
                        </ul>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-white rounded-2xl p-8 shadow-xl border-t-4 border-purple-500 relative overflow-hidden group hover:-translate-y-2 transition-transform">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold text-xl mb-6">৩</div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">ক্যারিয়ার লঞ্চ</h3>
                        <p className="text-slate-600 mb-4">চুড়ান্ত পর্যায়ে জব প্লেসমেন্ট সাপোর্ট:</p>
                        <ul className="space-y-2 text-slate-500 text-sm">
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div> সিভি ও পোর্টফোলিও মেকিং</li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div> মক ইন্টারভিউ</li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div> ডিরেক্ট জব রেফারেল</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Core Pillars Details */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900">৪টি কোর পিলার</h2>
                        <p className="text-slate-600 mt-2">যে বিষয়গুলোর উপর আমরা সর্বোচ্চ গুরুত্ব দিই</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 hover:border-blue-500 transition-colors">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600"><Zap size={20}/></div>
                            <h4 className="font-bold text-lg mb-2">Sales Skill</h4>
                            <p className="text-sm text-slate-500">যে কোনো আইডিয়া বা প্রোডাক্ট কনভিন্সিংলি উপস্থাপন করা।</p>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 hover:border-purple-500 transition-colors">
                             <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-purple-600"><UserCheck size={20}/></div>
                            <h4 className="font-bold text-lg mb-2">Networking</h4>
                            <p className="text-sm text-slate-500">প্রফেশনাল নেটওয়ার্ক তৈরি ও মেইনটেইন করা।</p>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 hover:border-green-500 transition-colors">
                             <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4 text-green-600"><Briefcase size={20}/></div>
                            <h4 className="font-bold text-lg mb-2">Communication</h4>
                            <p className="text-sm text-slate-500">কর্পোরেট স্ট্যান্ডার্ডে কথা বলা ও মেইল লেখা।</p>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 hover:border-orange-500 transition-colors">
                             <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-4 text-orange-600"><Star size={20}/></div>
                            <h4 className="font-bold text-lg mb-2">Emotional Intelligence</h4>
                            <p className="text-sm text-slate-500">টিমওয়ার্ক এবং স্ট্রেস ম্যানেজমেন্ট।</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
export default Ecosystem;