import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Clock, Filter, CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react';
import { Job, User } from '../types';
import { saveLead, getJobs } from '../services/firebase';

interface JobPortalProps {
    user: User | null;
}

const JobPortal: React.FC<JobPortalProps> = ({ user }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filters State
    const [filterType, setFilterType] = useState<string[]>([]);
    const [filterLocation, setFilterLocation] = useState<string[]>([]);
    const [filterSalary, setFilterSalary] = useState<string[]>([]);
    
    const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchJobs = async () => {
            const data = await getJobs();
            setJobs(data as Job[]);
            setLoading(false);
        };
        fetchJobs();
    }, []);

    // Extract unique values for filters
    const uniqueLocations = Array.from(new Set(jobs.map(j => j.location).filter(Boolean)));
    const uniqueSalaries = Array.from(new Set(jobs.map(j => j.salary).filter(Boolean)));

    const toggleFilter = (type: string) => {
        if (filterType.includes(type)) {
            setFilterType(filterType.filter(t => t !== type));
        } else {
            setFilterType([...filterType, type]);
        }
    };

    const toggleLocation = (loc: string) => {
        if (filterLocation.includes(loc)) {
            setFilterLocation(filterLocation.filter(l => l !== loc));
        } else {
            setFilterLocation([...filterLocation, loc]);
        }
    };

    const toggleSalary = (sal: string) => {
        if (filterSalary.includes(sal)) {
            setFilterSalary(filterSalary.filter(s => s !== sal));
        } else {
            setFilterSalary([...filterSalary, sal]);
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            job.company.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = filterType.length === 0 || filterType.includes(job.employmentStatus);
        const matchesLocation = filterLocation.length === 0 || filterLocation.includes(job.location);
        const matchesSalary = filterSalary.length === 0 || filterSalary.includes(job.salary);

        return matchesSearch && matchesType && matchesLocation && matchesSalary;
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
        <div className="bg-slate-50 min-h-screen">
            {/* Hero Section with Search */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-900">
                <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] animate-float"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px] animate-float-delayed"></div>
                
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        আপনার স্বপ্নের <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">ক্যারিয়ার</span> খুঁজুন
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-10">
                         সেরা কোম্পানিগুলোতে চাকরির সুযোগ। আপনার দক্ষতা অনুযায়ী পছন্দের চাকরিটি বেছে নিন।
                    </p>

                    {/* Search Bar in Hero */}
                    <div className="max-w-3xl mx-auto bg-white rounded-full p-2 flex shadow-2xl transform hover:scale-[1.02] transition-transform">
                        <div className="flex-1 flex items-center px-4 border-r border-slate-200">
                            <Briefcase className="text-slate-400 w-5 h-5 mr-3 shrink-0" />
                            <input 
                                type="text" 
                                placeholder="পদের নাম বা কোম্পানি খুঁজুন..." 
                                className="w-full py-2 outline-none text-slate-700 font-medium bg-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-3 rounded-full font-bold transition flex items-center gap-2 shrink-0">
                            <Search size={18} /> <span className="hidden md:inline">খুঁজুন</span>
                        </button>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6 py-12">
                
                {/* Sidebar Filter */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-24 max-h-[80vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center gap-2 font-bold text-slate-800 mb-6 border-b pb-4">
                            <Filter size={18} /> ফিল্টার
                        </div>
                        
                        {/* Job Type Filter */}
                        <div className="mb-6">
                            <h4 className="font-bold text-sm text-slate-700 mb-3 uppercase tracking-wider">চাকরির ধরণ</h4>
                            <div className="space-y-2">
                                {['Full-time', 'Part-time', 'Internship', 'Contractual'].map(type => (
                                    <div key={type} className="flex items-center gap-2 cursor-pointer group" onClick={() => toggleFilter(type)}>
                                        {filterType.includes(type) ? 
                                            <CheckSquare size={18} className="text-blue-600 shrink-0" /> : 
                                            <Square size={18} className="text-slate-300 group-hover:text-blue-400 shrink-0" />
                                        }
                                        <span className={`text-sm ${filterType.includes(type) ? 'text-blue-600 font-medium' : 'text-slate-600'}`}>{type}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Location Filter */}
                        {uniqueLocations.length > 0 && (
                            <div className="mb-6">
                                <h4 className="font-bold text-sm text-slate-700 mb-3 uppercase tracking-wider">অবস্থান (Location)</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                    {uniqueLocations.map(loc => (
                                        <div key={loc} className="flex items-center gap-2 cursor-pointer group" onClick={() => toggleLocation(loc)}>
                                            {filterLocation.includes(loc) ? 
                                                <CheckSquare size={18} className="text-blue-600 shrink-0" /> : 
                                                <Square size={18} className="text-slate-300 group-hover:text-blue-400 shrink-0" />
                                            }
                                            <span className={`text-sm ${filterLocation.includes(loc) ? 'text-blue-600 font-medium' : 'text-slate-600'}`}>{loc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Salary Filter */}
                        {uniqueSalaries.length > 0 && (
                            <div>
                                <h4 className="font-bold text-sm text-slate-700 mb-3 uppercase tracking-wider">বেতন (Salary)</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                    {uniqueSalaries.map(sal => (
                                        <div key={sal} className="flex items-center gap-2 cursor-pointer group" onClick={() => toggleSalary(sal)}>
                                            {filterSalary.includes(sal) ? 
                                                <CheckSquare size={18} className="text-blue-600 shrink-0" /> : 
                                                <Square size={18} className="text-slate-300 group-hover:text-blue-400 shrink-0" />
                                            }
                                            <span className={`text-sm ${filterSalary.includes(sal) ? 'text-blue-600 font-medium' : 'text-slate-600'}`}>{sal}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                                            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100 font-bold"><span className="text-sm">৳</span> {job.salary}</span>
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
                            <button onClick={() => { setSearchTerm(''); setFilterType([]); setFilterLocation([]); setFilterSalary([]); }} className="mt-4 text-blue-600 font-bold hover:underline">
                                ফিল্টার রিসেট করুন
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobPortal;