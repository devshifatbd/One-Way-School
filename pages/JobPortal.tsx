import React, { useState } from 'react';
import { Search, MapPin, Briefcase, DollarSign, Clock, Filter, ChevronDown, CheckSquare, Square } from 'lucide-react';
import { Job, User } from '../types';
import { signInWithGoogle, saveLead } from '../services/firebase';

const MOCK_JOBS: Job[] = [
    {
        id: '1',
        title: 'Junior Frontend Developer',
        company: 'TechNext Limited',
        location: 'Dhaka, Bangladesh',
        type: 'Full-time',
        salary: '25k - 35k BDT',
        postedDate: '2 days ago',
        description: 'React, Tailwind, TypeScript'
    },
    {
        id: '2',
        title: 'Sales Executive',
        company: 'One Way School',
        location: 'Remote',
        type: 'Part-time',
        salary: '15k + Commission',
        postedDate: '1 week ago',
        description: 'Sales, EdTech, Communication'
    },
    {
        id: '3',
        title: 'Content Writer Intern',
        company: 'Creative IT',
        location: 'Dhaka',
        type: 'Internship',
        salary: '8k BDT',
        postedDate: '3 days ago',
        description: 'Bangla Writing, SEO Basics'
    },
    {
        id: '4',
        title: 'MERN Stack Developer',
        company: 'SoftPark',
        location: 'Sylhet',
        type: 'Full-time',
        salary: '45k - 60k BDT',
        postedDate: '5 days ago',
        description: 'Node.js, MongoDB, React'
    },
    {
        id: '5',
        title: 'Digital Marketing Executive',
        company: 'BrandFlow',
        location: 'Chittagong',
        type: 'Full-time',
        salary: '20k - 30k BDT',
        postedDate: 'Today',
        description: 'Facebook Ads, Google Analytics'
    }
];

interface JobPortalProps {
    user: User | null;
}

const JobPortal: React.FC<JobPortalProps> = ({ user }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string[]>([]);
    
    const toggleFilter = (type: string) => {
        if (filterType.includes(type)) {
            setFilterType(filterType.filter(t => t !== type));
        } else {
            setFilterType([...filterType, type]);
        }
    };

    const filteredJobs = MOCK_JOBS.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            job.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType.length === 0 || filterType.includes(job.type);
        return matchesSearch && matchesFilter;
    });

    const handleApply = async (job: Job) => {
        if (!user) {
            alert("আবেদন করতে অনুগ্রহ করে লগইন করুন।");
            return;
        }
        if (window.confirm(`${job.title} পদের জন্য আবেদন নিশ্চিত করছেন?`)) {
            try {
                await saveLead({
                    name: user.displayName || 'Unknown',
                    email: user.email,
                    phone: 'N/A',
                    profession: 'Job Applicant',
                    goal: `Applied for ${job.title} at ${job.company}`,
                    details: { jobId: job.id, jobTitle: job.title },
                    userId: user.uid
                });
                alert("আবেদন সফল হয়েছে!");
            } catch (e) {
                alert("সমস্যা হয়েছে।");
            }
        }
    };

    return (
        <div className="pt-24 pb-16 bg-slate-100 min-h-screen">
            {/* Header & Search */}
            <div className="bg-slate-900 pb-12 pt-8 mb-8 px-4">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-6 text-center">ক্যারিয়ার পোর্টাল</h1>
                    <div className="max-w-3xl mx-auto bg-white rounded-full p-2 flex shadow-2xl">
                        <div className="flex-1 flex items-center px-4 border-r border-slate-200">
                            <Briefcase className="text-slate-400 w-5 h-5 mr-3" />
                            <input 
                                type="text" 
                                placeholder="পদের নাম বা কোম্পানি খুঁজুন..." 
                                className="w-full py-2 outline-none text-slate-700 font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition flex items-center gap-2">
                            <Search size={18} /> খুঁজুন
                        </button>
                    </div>
                    <p className="text-slate-400 text-center mt-4 text-sm">জনপ্রিয়: ফ্রন্টএন্ড, সেলস, গ্রাফিক্স ডিজাইন</p>
                </div>
            </div>

            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Sidebar Filter */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 font-bold text-slate-800 mb-4 border-b pb-2">
                            <Filter size={18} /> ফিল্টার
                        </div>
                        
                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-slate-500">চাকরির ধরণ</h4>
                            {['Full-time', 'Part-time', 'Internship', 'Remote'].map(type => (
                                <div key={type} className="flex items-center gap-2 cursor-pointer group" onClick={() => toggleFilter(type)}>
                                    {filterType.includes(type) ? 
                                        <CheckSquare size={18} className="text-blue-600" /> : 
                                        <Square size={18} className="text-slate-300 group-hover:text-blue-400" />
                                    }
                                    <span className={`text-sm ${filterType.includes(type) ? 'text-blue-600 font-medium' : 'text-slate-600'}`}>{type}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl p-6 text-white text-center shadow-lg">
                        <h3 className="font-bold text-lg mb-2">সিভি রিভিউ করান</h3>
                        <p className="text-sm text-blue-100 mb-4">এক্সপার্টদের দিয়ে আপনার সিভি যাচাই করে নিন।</p>
                        <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-bold w-full hover:bg-blue-50">বুক করুন</button>
                    </div>
                </div>

                {/* Job Listings */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-bold text-slate-700">সর্বমোট {filteredJobs.length} টি চাকরি পাওয়া গেছে</h2>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            সর্ট করুন: <span className="font-bold text-slate-700 cursor-pointer">নতুন</span>
                        </div>
                    </div>

                    {filteredJobs.map(job => (
                        <div key={job.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-blue-700 mb-1 group-hover:underline cursor-pointer">{job.title}</h3>
                                    <div className="text-slate-900 font-semibold text-sm mb-2">{job.company}</div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded"><MapPin size={14} /> {job.location}</span>
                                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded"><DollarSign size={14} /> {job.salary}</span>
                                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded text-blue-600 font-medium"><Briefcase size={14} /> {job.type}</span>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-500 line-clamp-2">{job.description}</p>
                                </div>
                                <div className="flex flex-col items-end gap-3 min-w-[140px]">
                                    <button onClick={() => handleApply(job)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm w-full hover:bg-blue-700 transition shadow-md shadow-blue-200">
                                        আবেদন করুন
                                    </button>
                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                        <Clock size={12} /> {job.postedDate}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredJobs.length === 0 && (
                        <div className="bg-white p-12 rounded-xl text-center border border-dashed border-slate-300">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="text-slate-400" size={32} />
                            </div>
                            <h3 className="text-slate-600 font-bold">দুঃখিত, কোনো তথ্য পাওয়া যায়নি</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobPortal;
