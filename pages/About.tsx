import React from 'react';
import { Globe, Users, Briefcase, Target, Heart, Award, CheckCircle } from 'lucide-react';

const About: React.FC = () => {
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
                            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Team" className="relative rounded-3xl shadow-xl w-full" />
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
            
            {/* Founders Section - Details removed as per request */}
            <section className="py-16 bg-slate-50">
                <div className="container mx-auto px-4 max-w-6xl text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">আমাদের ফাউন্ডারগণ</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto mb-12">যাদের ভিশনারি নেতৃত্বের মাধ্যমে OWS এগিয়ে যাচ্ছে</p>
                    
                    <div className="flex justify-center items-center h-32 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-slate-500 font-medium">ফাউন্ডারদের তথ্য শীঘ্রই আপডেট করা হবে...</p>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-slate-50 p-10 rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-slate-100 group">
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Target className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">আমাদের মিশন</h3>
                            <p className="text-slate-600 leading-relaxed">
                                প্রতিটি শিক্ষার্থীকে তাদের সুপ্ত প্রতিভা বিকাশে সহায়তা করা এবং সঠিক মেন্টরশিপের মাধ্যমে তাদের ক্যারিয়ারের পথে আত্মবিশ্বাসী করে তোলা। আমরা চাই বেকারত্ব দূর করে দক্ষ জনশক্তি তৈরি করতে।
                            </p>
                        </div>
                        <div className="bg-slate-50 p-10 rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-slate-100 group">
                            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Globe className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">আমাদের ভিশন</h3>
                            <p className="text-slate-600 leading-relaxed">
                                ২০৩০ সালের মধ্যে ১০,০০০+ দক্ষ প্রফেশনাল তৈরি করা যারা শুধু দেশেই নয়, গ্লোবাল মার্কেটেও বাংলাদেশের প্রতিনিধিত্ব করবে। একটি স্বাবলম্বী এবং স্কিলড বাংলাদেশ গড়া আমাদের লক্ষ্য।
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-blue-900 text-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">৫০০+</div>
                            <div className="text-blue-200">অ্যালামনাই</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">৫০+</div>
                            <div className="text-blue-200">মেন্টর</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">২০+</div>
                            <div className="text-blue-200">পার্টনার কোম্পানি</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">৯৫%</div>
                            <div className="text-blue-200">সাফল্যের হার</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
export default About;