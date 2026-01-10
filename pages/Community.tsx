
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { Users, Award, TrendingUp, ArrowRight } from 'lucide-react';

interface CommunityProps {
    user: User | null;
}

const Community: React.FC<CommunityProps> = ({ user }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-slate-50 min-h-screen font-['Hind_Siliguri']">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-900 text-white">
                <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] animate-float"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        আমাদের <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">কমিউনিটি</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-10">
                        শেখা, আয় করা এবং নেতৃত্ব দেওয়ার অনন্য প্ল্যাটফর্ম। আপনার আগ্রহ অনুযায়ী প্রোগ্রাম বেছে নিন।
                    </p>
                </div>
            </section>

            {/* Programs Grid */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid md:grid-cols-3 gap-8">
                        
                        {/* Ambassador Card */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg hover:shadow-2xl transition-all group hover:-translate-y-2">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Users size={32} className="text-blue-600"/>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">ক্যাম্পাস এম্বাসেডর</h3>
                            <p className="text-slate-600 mb-6 leading-relaxed">
                                আপনার ক্যাম্পাসে লিডারশিপ প্র্যাকটিস করুন এবং এক্সক্লুসিভ বেনিফিট পান।
                            </p>
                            <button onClick={() => navigate('/community/ambassador')} className="text-blue-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                বিস্তারিত দেখুন <ArrowRight size={20}/>
                            </button>
                        </div>

                        {/* Affiliate Card */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg hover:shadow-2xl transition-all group hover:-translate-y-2">
                            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <TrendingUp size={32} className="text-green-600"/>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">এফিলিয়েট প্রোগ্রাম</h3>
                            <p className="text-slate-600 mb-6 leading-relaxed">
                                ওয়ান ওয়ে স্কুলের কোর্স রেফার করে নিশ্চিত প্যাসিভ ইনকাম করার সুযোগ।
                            </p>
                            <button onClick={() => navigate('/community/affiliate')} className="text-green-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                বিস্তারিত দেখুন <ArrowRight size={20}/>
                            </button>
                        </div>

                        {/* Certificate Card */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg hover:shadow-2xl transition-all group hover:-translate-y-2">
                            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Award size={32} className="text-purple-600"/>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">সার্টিফিকেট পোর্টাল</h3>
                            <p className="text-slate-600 mb-6 leading-relaxed">
                                মেম্বারশিপ যাচাই করুন এবং আপনার অর্জিত সার্টিফিকেট ডাউনলোড করুন।
                            </p>
                            <button onClick={() => navigate('/community/certificate')} className="text-purple-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                পোর্টালে যান <ArrowRight size={20}/>
                            </button>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default Community;
