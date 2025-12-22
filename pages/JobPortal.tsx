import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, DollarSign, Clock, Filter, CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react';
import { Job, User } from '../types';
import { saveLead, getJobs } from '../services/firebase';

interface JobPortalProps {
    user: User | null;
}

const JobPortal: React.FC<JobPortalProps> = ({ user }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string[]>([]);
    const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchJobs = async () => {
            const data = await getJobs();
            setJobs(data as Job[]);
            setLoading(false);
        };
        fetchJobs();
    }, []);

    const toggleFilter = (type: string) => {
        if (filterType.includes(type)) {
            setFilterType(filterType.filter(t => t !== type));
        } else {
            setFilterType([...filterType, type]);
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            job.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType.length === 0 || filterType.includes(job.employmentStatus);
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

    if (loading) return <div className="h-screen flex items-center justify-center">লোডিং...</div>;

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
                            {['Full-time', 'Part-time', 'Internship', 'Contractual'].map(type => (
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
                </div>

                {/* Job Listings */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-bold text-slate-700">সর্বমোট {filteredJobs.length} টি চাকরি পাওয়া গেছে</h2>
                    </div>

                    {filteredJobs.map(job => (
                        <div key={job.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
                            {/* Summary Section */}
                            <div className="p-5 cursor-pointer" onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id!)}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-blue-700 mb-1 hover:underline">{job.title}</h3>
                                        <div className="text-slate-900 font-semibold text-base mb-2">{job.company}</div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                                            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100"><MapPin size={14} /> {job.location}</span>
                                            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100"><DollarSign size={14} /> {job.salary}</span>
                                            <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 font-medium"><Briefcase size={14} /> {job.employmentStatus}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="flex items-center gap-1 text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded-full">
                                            <Clock size={12} /> Deadline: {job.deadline || 'N/A'}
                                        </span>
                                        {expandedJobId === job.id ? <ChevronUp className="text-slate-400"/> : <ChevronDown className="text-slate-400"/>}
                                    </div>
                                </div>
                            </div>

                            {/* Details Expanded Section */}
                            {expandedJobId === job.id && (
                                <div className="px-5 pb-5 pt-0 animate-fade-in border-t border-slate-100">
                                    <div className="py-4 space-y-6">
                                        
                                        {job.jobContext && (
                                            <div>
                                                <h4 className="font-bold text-slate-800 mb-2">Job Context</h4>
                                                <p className="text-slate-600 text-sm whitespace-pre-line">{job.jobContext}</p>
                                            </div>
                                        )}

                                        {job.responsibilities && (
                                            <div>
                                                <h4 className="font-bold text-slate-800 mb-2">Job Responsibilities</h4>
                                                <p className="text-slate-600 text-sm whitespace-pre-line">{job.responsibilities}</p>
                                            </div>
                                        )}

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="font-bold text-slate-800 mb-2">Workplace</h4>
                                                <p className="text-slate-600 text-sm">{job.workplace || 'Not Specified'}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 mb-2">Employment Status</h4>
                                                <p className="text-slate-600 text-sm">{job.employmentStatus}</p>
                                            </div>
                                        </div>

                                        {job.educationalRequirements && (
                                            <div>
                                                <h4 className="font-bold text-slate-800 mb-2">Educational Requirements</h4>
                                                <p className="text-slate-600 text-sm whitespace-pre-line">{job.educationalRequirements}</p>
                                            </div>
                                        )}

                                        {job.experienceRequirements && (
                                            <div>
                                                <h4 className="font-bold text-slate-800 mb-2">Experience Requirements</h4>
                                                <p className="text-slate-600 text-sm whitespace-pre-line">{job.experienceRequirements}</p>
                                            </div>
                                        )}
                                        
                                        {job.compensationAndBenefits && (
                                            <div>
                                                <h4 className="font-bold text-slate-800 mb-2">Compensation & Other Benefits</h4>
                                                <p className="text-slate-600 text-sm whitespace-pre-line">{job.compensationAndBenefits}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 flex justify-center border-t border-slate-100">
                                        <button onClick={(e) => { e.stopPropagation(); handleApply(job); }} className="bg-blue-600 text-white px-10 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 transform hover:-translate-y-1">
                                            আবেদন করুন
                                        </button>
                                    </div>
                                </div>
                            )}
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