
import React, { useState, useEffect } from 'react';
import { User, Affiliate, CommunityMember } from '../types';
import { saveAffiliate, getAffiliates, getCommunityMembers } from '../services/firebase';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Users, Megaphone, Target, Award, Rocket, BookOpen, Star, ArrowRight, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface CampusAmbassadorProps {
    user: User | null;
}

const CampusAmbassador: React.FC<CampusAmbassadorProps> = ({ user }) => {
    const navigate = useNavigate();
    // Use a unified type for display
    const [ambassadors, setAmbassadors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Number of cards per page

    // Login Modal Context
    const { openLoginModal } = useOutletContext<{ openLoginModal: () => void }>() || { openLoginModal: () => {} };

    useEffect(() => {
        const fetchAmbassadors = async () => {
            try {
                // Fetch from both sources: Applications (Affiliates) and Manual Database (CommunityMembers)
                const [affiliatesData, membersData] = await Promise.all([
                    getAffiliates(),
                    getCommunityMembers()
                ]);

                // 1. Process Affiliates (Applied via Web)
                const activeAffiliates = (affiliatesData as Affiliate[])
                    .filter(a => a.type === 'Campus Ambassador' && a.status === 'approved')
                    .map(a => ({
                        id: a.id,
                        name: a.name,
                        institution: a.institution,
                        imageUrl: a.imageUrl,
                        source: 'affiliate'
                    }));

                // 2. Process Community Members (Added Manually by Admin)
                const manualAmbassadors = (membersData as CommunityMember[])
                    .filter(m => m.category === 'Campus Ambassador' || m.role?.toLowerCase().includes('ambassador'))
                    .map(m => ({
                        id: m.id,
                        name: m.name,
                        institution: m.role === 'Campus Ambassador' ? 'OWS Community' : m.role, // Use Role as Institution fallback if manual
                        imageUrl: m.imageUrl || m.photoURL,
                        source: 'manual'
                    }));

                // Combine and remove duplicates based on ID (if any)
                const combinedList = [...activeAffiliates, ...manualAmbassadors];
                
                // Optional: Remove duplicates if user exists in both (priority to affiliate as it has more info like institution)
                const uniqueList = Array.from(new Map(combinedList.map(item => [item.name + item.id, item])).values());

                setAmbassadors(uniqueList);
            } catch (error) {
                console.error("Failed to fetch ambassadors", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAmbassadors();
    }, []);

    const handleApply = async () => {
        if (!user) {
            openLoginModal();
            return;
        }

        if (window.confirm("আপনি কি নিশ্চিতভাবে ক্যাম্পাস এম্বাসেডর প্রোগ্রামে আবেদন করতে চান?")) {
            try {
                const data: Affiliate = {
                    name: user.displayName || 'Unknown',
                    phone: user.phone || 'N/A',
                    email: user.email || 'N/A',
                    institution: user.institution || '',
                    type: 'Campus Ambassador',
                    imageUrl: user.photoURL || '',
                    userId: user.uid,
                    createdAt: new Date(),
                    status: 'pending',
                    balance: 0,
                    totalEarnings: 0
                };
                
                await saveAffiliate(data);
                alert("আপনার আবেদন সফলভাবে জমা হয়েছে! ড্যাশবোর্ডে স্ট্যাটাস দেখুন।");
                navigate('/dashboard');
            } catch (error) {
                console.error(error);
                alert("আবেদন জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
            }
        }
    };

    // Filter Logic
    const filteredAmbassadors = ambassadors.filter(person => 
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (person.institution && person.institution.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAmbassadors.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAmbassadors.length / itemsPerPage);

    return (
        <div className="bg-white min-h-screen font-['Hind_Siliguri']">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <span className="bg-white/20 backdrop-blur-md text-sm font-bold px-4 py-1 rounded-full uppercase tracking-wider mb-6 inline-block border border-white/30">Leadership Program</span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        আপনার ক্যাম্পাসের <span className="text-yellow-400">লিডার</span> হোন
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed">
                        One Way School ক্যাম্পাস এম্বাসেডর প্রোগ্রাম – ফিউচার লিডারদের জন্য একটি অনন্য সুযোগ। নেতৃত্ব দিন, নেটওয়ার্ক গড়ুন এবং নিজেকে কর্পোরেট জগতের জন্য প্রস্তুত করুন।
                    </p>
                    <button onClick={handleApply} className="bg-yellow-400 text-slate-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 mx-auto">
                        এখনই আবেদন করুন <ArrowRight size={20}/>
                    </button>
                </div>
            </section>

            {/* Why Join Section (Cards) */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">কেন জয়েন করবেন?</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">শুধুমাত্র একটি পদবী নয়, এটি আপনার ক্যারিয়ারের গেম চেঞ্জার হতে পারে।</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all border-b-4 border-blue-600 group">
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                                <Award size={32} className="text-blue-600 group-hover:text-white"/>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">সার্টিফিকেট ও স্বীকৃতি</h3>
                            <p className="text-slate-600 leading-relaxed">কার্যকাল শেষে পাবেন ভেরিফাইড লিডারশিপ সার্টিফিকেট এবং সেরা পারফর্মারদের জন্য বিশেষ রিকগনিশন।</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all border-b-4 border-purple-600 group">
                            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
                                <Users size={32} className="text-purple-600 group-hover:text-white"/>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">নেটওয়ার্কিং সুযোগ</h3>
                            <p className="text-slate-600 leading-relaxed">দেশের সেরা কর্পোরেট লিডার এবং অন্যান্য ক্যাম্পাসের ট্যালেন্টদের সাথে সরাসরি নেটওয়ার্কিং করার সুযোগ।</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all border-b-4 border-orange-600 group">
                            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors">
                                <Rocket size={32} className="text-orange-600 group-hover:text-white"/>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">ক্যারিয়ার গ্রোথ</h3>
                            <p className="text-slate-600 leading-relaxed">বাস্তব অভিজ্ঞতার মাধ্যমে সিভি ভারি করুন। আমাদের পার্টনার কোম্পানিগুলোতে জবের ক্ষেত্রে অগ্রাধিকার।</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Roles & Responsibilities */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="w-full md:w-1/2">
                            <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Ambassador" className="rounded-3xl shadow-2xl w-full"/>
                        </div>
                        <div className="w-full md:w-1/2">
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">আপনার দায়িত্বসমূহ</h2>
                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 font-bold">1</div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-lg">কমিউনিটি লিডারশিপ</h4>
                                        <p className="text-slate-600 text-sm">আপনার ক্যাম্পাসে OWS এর স্টুডেন্ট কমিউনিটি তৈরি করা এবং পরিচালনা করা।</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 font-bold">2</div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-lg">ইভেন্ট অর্গানাইজেশন</h4>
                                        <p className="text-slate-600 text-sm">সেমিনার, ওয়ার্কশপ এবং মিটআপ আয়োজন করা।</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 font-bold">3</div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-lg">ব্র্যান্ড প্রমোশন</h4>
                                        <p className="text-slate-600 text-sm">সোশ্যাল মিডিয়া এবং ক্যাম্পাসে OWS এর প্রোগ্রাম সম্পর্কে সচেতনতা তৈরি করা।</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Current Ambassadors Section (New Feature) */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">আমাদের বর্তমান এম্বাসেডরগণ</h2>
                        <p className="text-slate-600">যাদের নেতৃত্বে এগিয়ে যাচ্ছে দেশের বিভিন্ন ক্যাম্পাস</p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-md mx-auto mb-12 relative">
                        <input 
                            type="text" 
                            placeholder="নাম বা ক্যাম্পাস খুঁজুন..." 
                            className="w-full pl-12 pr-4 py-3 rounded-full border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    </div>

                    {loading ? (
                        <div className="text-center py-10">লোডিং...</div>
                    ) : filteredAmbassadors.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {currentItems.map((ambassador, idx) => (
                                    <div key={ambassador.id || idx} className="bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                                        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-r from-blue-500 to-purple-500 mb-4 group-hover:scale-105 transition-transform">
                                            <img 
                                                src={ambassador.imageUrl || "https://iili.io/KFXRLiv.md.png"} 
                                                alt={ambassador.name} 
                                                className="w-full h-full rounded-full object-cover border-4 border-white"
                                                onError={(e) => { (e.target as HTMLImageElement).src = "https://iili.io/KFXRLiv.md.png" }}
                                            />
                                        </div>
                                        <h4 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1">{ambassador.name}</h4>
                                        <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">{ambassador.institution || "Institution N/A"}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 mt-12">
                                    <button 
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={20}/>
                                    </button>
                                    <span className="text-slate-600 font-bold text-sm">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button 
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={20}/>
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300">
                            <p className="text-slate-500">দুঃখিত, কোনো এম্বাসেডর পাওয়া যায়নি।</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Testimonials / Success Stories */}
            <section className="py-20 bg-[#1e293b] text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-12">এম্বাসেডরদের কথা</h2>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-left">
                            <p className="italic text-slate-300 mb-6">"OWS এর এম্বাসেডর হিসেবে কাজ করার অভিজ্ঞতা আমার কমিউনিকেশন স্কিলকে নেক্সট লেভেলে নিয়ে গেছে। এখন আমি যেকোনো ইন্টারভিউতে কনফিডেন্টলি কথা বলতে পারি।"</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center text-slate-400 font-bold text-xl">R</div>
                                <div>
                                    <h4 className="font-bold">রাফিদ হাসান</h4>
                                    <p className="text-xs text-slate-400">ঢাকা বিশ্ববিদ্যালয়</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-left">
                            <p className="italic text-slate-300 mb-6">"নেটওয়ার্কিং এর আসল পাওয়ার আমি এখান থেকেই শিখেছি। OWS এর মাধ্যমেই আমি আমার বর্তমান ইন্টার্নশিপটি পেয়েছি।"</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center text-slate-400 font-bold text-xl">S</div>
                                <div>
                                    <h4 className="font-bold">সাদিয়া আফরিন</h4>
                                    <p className="text-xs text-slate-400">নর্থ সাউথ ইউনিভার্সিটি</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-blue-600 text-white text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">আর দেরি কেন?</h2>
                    <p className="text-xl text-blue-100 mb-10">আপনার লিডারশিপ জার্নি শুরু হোক আজ থেকেই।</p>
                    <button onClick={handleApply} className="bg-white text-blue-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-all shadow-xl">
                        আবেদন করুন
                    </button>
                </div>
            </section>
        </div>
    );
};

export default CampusAmbassador;
