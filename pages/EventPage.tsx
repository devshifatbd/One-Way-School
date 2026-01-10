
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, ArrowRight, CheckCircle2, ShieldCheck, Mail, Phone, Download } from 'lucide-react';

const EventPage: React.FC = () => {
    const { eventId } = useParams();

    // Event Data Mapping
    const events: Record<string, any> = {
        'national-tech-carnival': {
            title: "ন্যাশনাল টেক কার্ণিভাল",
            subtitle: "দেশের বৃহত্তম প্রযুক্তি উৎসব",
            description: "প্রযুক্তি প্রেমীদের মিলনমেলা। রোবোটিক্স, কোডিং প্রতিযোগিতা, প্রোজেক্ট শোকেসিং এবং টেক টক নিয়ে আয়োজিত হতে যাচ্ছে ন্যাশনাল টেক কার্ণিভাল।",
            date: "২৫ ডিসেম্বর, ২০২৩",
            time: "সকাল ৯:০০ - সন্ধ্যা ৬:০০",
            location: "বসুন্ধরা কনভেনশন সিটি, ঢাকা",
            image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
            highlights: ["রোবোটিক্স কম্পিটিশন", "আইডিয়া পিচিং", "গেম জ্যাম", "নেটওয়ার্কিং"]
        },
        'national-tech-award': {
            title: "ন্যাশনাল টেক এওয়ার্ড",
            subtitle: "প্রযুক্তিখাতে সেরাদের স্বীকৃতি",
            description: "যাদের উদ্ভাবন বদলে দিচ্ছে দেশ, তাদের সম্মান জানাতে আমাদের এই আয়োজন। সেরা স্টার্টআপ, সেরা ইনোভেটর এবং সেরা টেক লিডারদের পুরস্কৃত করা হবে।",
            date: "৩০ ডিসেম্বর, ২০২৩",
            time: "সন্ধ্যা ৬:০০",
            location: "হোটেল ইন্টারকন্টিনেন্টাল, ঢাকা",
            image: "https://images.unsplash.com/photo-1561489413-985b06da5bee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
            highlights: ["রেড কার্পেট রিসিপশন", "গালা ডিনার", "অ্যাওয়ার্ড শো", "সাংস্কৃতিক সন্ধ্যা"]
        },
        'rise-of-brilliance': {
            title: "রাইজ অব ব্রিলিয়ান্স",
            subtitle: "মেধার বিকাশ ও তারুণ্যের জয়গান",
            description: "তরুণদের সুপ্ত প্রতিভা বিকশিত করার লক্ষ্যে একটি বিশেষ ট্যালেন্ট হান্ট প্রোগ্রাম। এখানে আপনি পাবেন মেন্টরশিপ এবং নিজের স্কিল প্রদর্শনের সুযোগ।",
            date: "১০ জানুয়ারি, ২০২৪",
            time: "সকাল ১০:০০",
            location: "কৃষিবিদ ইনস্টিটিউশন, ঢাকা",
            image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
            highlights: ["ট্যালেন্ট হান্ট", "মেন্টরশিপ সেশন", "স্কিল এসেসমেন্ট", "সার্টিফিকেট"]
        },
        'rise-of-brilliance-award': {
            title: "রাইজ অব ব্রিলিয়ান্স এওয়ার্ড",
            subtitle: "সেরা প্রতিভাদের সম্মাননা",
            description: "রাইজ অব ব্রিলিয়ান্স প্রোগ্রামের সেরা পারফর্মারদের হাতে তুলে দেওয়া হবে সম্মানজনক পুরস্কার ও স্কলারশিপ।",
            date: "১৫ জানুয়ারি, ২০২৪",
            time: "বিকাল ৪:০০",
            location: "ছায়ানট মিলনায়তন",
            image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
            highlights: ["পুরস্কার বিতরণী", "স্কলারশিপ ঘোষণা", "গেস্ট স্পিচ"]
        },
        'ssc-kriti-songbordhona': {
            title: "এস.এস.সি কৃতি সংবর্ধনা",
            subtitle: "ভবিষ্যতের কান্ডারিদের অভিনন্দন",
            description: "এস.এস.সি পরীক্ষায় জিপিএ-৫ প্রাপ্ত কৃতি শিক্ষার্থীদের সংবর্ধনা প্রদান। সাথে থাকছে ক্যারিয়ার গাইডলাইন সেশন।",
            date: "ফেব্রুয়ারি ২০২৪",
            time: "সকাল ১০:০০",
            location: "নির্ধারিত ভেন্যু",
            image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
            highlights: ["ক্রেস্ট প্রদান", "টি-শার্ট ও গিফট", "ক্যারিয়ার গাইডলাইন", "লাঞ্চ"]
        },
        'hsc-kriti-songbordhona': {
            title: "এইচ.এস.সি কৃতি সংবর্ধনা",
            subtitle: "উচ্চশিক্ষার পথে শুভকামনা",
            description: "এইচ.এস.সি উত্তীর্ণ কৃতী শিক্ষার্থীদের সংবর্ধনা এবং বিশ্ববিদ্যালয় ভর্তি বিষয়ক দিকনির্দেশনা মূলক সেমিনার।",
            date: "মার্চ ২০২৪",
            time: "সকাল ১০:০০",
            location: "নির্ধারিত ভেন্যু",
            image: "https://images.unsplash.com/photo-1627556592933-ffe99c1cd9eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
            highlights: ["এডমিশন গাইডলাইন", "ক্রেস্ট প্রদান", "নেটওয়ার্কিং", "স্ন্যাকস"]
        }
    };

    const currentEvent = eventId ? events[eventId] : null;

    if (!currentEvent) {
        return <div className="h-screen flex items-center justify-center font-['Hind_Siliguri']">ইভেন্টটি পাওয়া যায়নি।</div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen font-['Hind_Siliguri']">
            {/* BitPA Style Hero Banner (Professional, Full Width) */}
            <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
                <img src={currentEvent.image} alt={currentEvent.title} className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-slate-900/70 flex flex-col justify-center items-center text-center px-4">
                    <span className="text-blue-400 font-bold tracking-widest text-sm uppercase mb-3 animate-fade-in-up border border-blue-400/50 px-3 py-1 rounded">Official Event</span>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight max-w-4xl">{currentEvent.title}</h1>
                    <p className="text-slate-300 text-lg md:text-xl font-light">{currentEvent.subtitle}</p>
                </div>
            </div>

            {/* Main Content Layout (Sidebar + Content) */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid lg:grid-cols-3 gap-10">
                    
                    {/* Left: Content */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Overview */}
                        <div className="bg-white p-8 rounded-none border-l-4 border-blue-600 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">ইভেন্ট সম্পর্কে</h2>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                {currentEvent.description}
                            </p>
                        </div>

                        {/* Highlights */}
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <CheckCircle2 className="text-blue-600"/> ইভেন্টের মূল আকর্ষণ
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {currentEvent.highlights.map((item: string, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3 bg-white p-4 border border-slate-200 shadow-sm hover:border-blue-400 transition-colors">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        <span className="text-slate-700 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Schedule (Placeholder) */}
                        <div className="bg-slate-100 p-8">
                            <h3 className="text-xl font-bold text-slate-800 mb-6">বিস্তারিত সময়সূচী</h3>
                            <div className="space-y-4">
                                <div className="flex gap-4 items-start">
                                    <span className="font-mono text-slate-500 text-sm mt-1">০৯:০০</span>
                                    <div>
                                        <h4 className="font-bold text-slate-800">রিপোর্টিং ও কিট কালেকশন</h4>
                                        <p className="text-sm text-slate-500">ভেন্যু গেট ওপেন</p>
                                    </div>
                                </div>
                                <div className="w-px h-6 bg-slate-300 ml-5"></div>
                                <div className="flex gap-4 items-start">
                                    <span className="font-mono text-slate-500 text-sm mt-1">১০:০০</span>
                                    <div>
                                        <h4 className="font-bold text-slate-800">উদ্বোধনী অনুষ্ঠান</h4>
                                        <p className="text-sm text-slate-500">প্রধান অতিথির বক্তব্য</p>
                                    </div>
                                </div>
                                <div className="w-px h-6 bg-slate-300 ml-5"></div>
                                <div className="flex gap-4 items-start">
                                    <span className="font-mono text-slate-500 text-sm mt-1">...</span>
                                    <div>
                                        <h4 className="font-bold text-slate-800">মূল পর্ব শুরু</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Sidebar / Registration Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-slate-200 shadow-lg sticky top-28">
                            <div className="bg-[#1e293b] p-6 text-white">
                                <h3 className="text-xl font-bold mb-1">ইভেন্ট ডিটেইলস</h3>
                                <p className="text-slate-400 text-xs">Confirm your spot now</p>
                            </div>
                            
                            <div className="p-6 space-y-6">
                                <div className="flex items-start gap-4">
                                    <Calendar className="text-blue-600 shrink-0"/>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold">তারিখ</p>
                                        <p className="text-slate-800 font-medium">{currentEvent.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Clock className="text-blue-600 shrink-0"/>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold">সময়</p>
                                        <p className="text-slate-800 font-medium">{currentEvent.time}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <MapPin className="text-blue-600 shrink-0"/>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold">ভেন্যু</p>
                                        <p className="text-slate-800 font-medium">{currentEvent.location}</p>
                                    </div>
                                </div>

                                <hr className="border-slate-100"/>

                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-blue-200">
                                    রেজিস্ট্রেশন করুন <ArrowRight size={20}/>
                                </button>
                                
                                <button className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 transition-all flex items-center justify-center gap-2">
                                    <Download size={18}/> ব্রোশিউর ডাউনলোড
                                </button>
                            </div>

                            <div className="bg-slate-50 p-6 border-t border-slate-100">
                                <h4 className="font-bold text-slate-800 mb-3 text-sm">যোগাযোগ</h4>
                                <div className="space-y-2 text-sm text-slate-600">
                                    <p className="flex items-center gap-2"><Phone size={14}/> +880 1626-777076</p>
                                    <p className="flex items-center gap-2"><Mail size={14}/> events@onewayschool.com</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EventPage;
