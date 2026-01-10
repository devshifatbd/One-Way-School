
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Filter, CheckSquare, Square, ChevronDown, ExternalLink, Lock, Eye, Building2, Banknote, Calendar, X } from 'lucide-react';
import { Job, User } from '../types';
import { getJobs, saveJobInterest } from '../services/firebase';
import { useOutletContext } from 'react-router-dom';

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
    const [revealedJobs, setRevealedJobs] = useState<string[]>([]);
    const [trackingLoading, setTrackingLoading] = useState<string | null>(null);
    
    // Mobile Filter State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    // Login Modal Context
    const { openLoginModal } = useOutletContext<{ openLoginModal: () => void }>() || { openLoginModal: () => {} };
    
    // Constants for Filtering
    const DIVISIONS = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];
    const SALARY_RANGES = [
        { label: '10k - 30k', min: 10000, max: 30000 },
        { label: '30k - 60k', min: 30000, max: 60000 },
        { label: '60k - 100k', min: 60000, max: 100000 },
        { label: '100k+', min: 100000, max: 9999999 }
    ];

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

    const toggleLocation = (loc: string) => {
        if (filterLocation.includes(loc)) {
            setFilterLocation(filterLocation.filter(l => l !== loc));
        } else {
            setFilterLocation([...filterLocation, loc]);
        }
    };

    const toggleSalary = (salLabel: string) => {
        if (filterSalary.includes(salLabel)) {
            setFilterSalary(filterSalary.filter(s => s !== salLabel));
        } else {
            setFilterSalary([...filterSalary, salLabel]);
        }
    };

    const parseSalary = (salaryStr: string) => {
        const cleanStr = salaryStr.toLowerCase().replace(/k/g, '000').replace(/[^0-9]/g, '');
        return parseInt(cleanStr) || 0;
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            job.company.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = filterType.length === 0 || filterType.includes(job.employmentStatus);
        
        const matchesLocation = filterLocation.length === 0 || filterLocation.some(div => 
            job.location.toLowerCase().includes(div.toLowerCase())
        );

        const jobSalaryNum = parseSalary(job.salary);
        const matchesSalary = filterSalary.length === 0 || filterSalary.some(rangeLabel => {
            const range = SALARY_RANGES.find(r => r.label === rangeLabel);
            if (!range) return false;
            return jobSalaryNum >= range.min && jobSalaryNum <= range.max;
        });

        return matchesSearch && matchesType && matchesLocation && matchesSalary;
    });

    const handleViewDetails = async (e: React.MouseEvent, job: Job) => {
        e.stopPropagation(); 
        if (!user) {
            openLoginModal();
            return;
        }
        if(!job.id) return;
        if (!revealedJobs.includes(job.id)) {
            setTrackingLoading(job.id);
            try {
                await saveJobInterest({
                    jobId: job.id,
                    jobTitle: job.title,
                    userId: user.uid,
                    userName: user.displayName || 'Unknown',
                    userEmail: user.email || 'No Email',
                    clickedAt: new Date()
                });
                setRevealedJobs(prev => [...prev, job.id!]);
            } catch (e) {
                console.error("Tracking failed", e);
                setRevealedJobs(prev => [...prev, job.id!]);
            }
            setTrackingLoading(null);
        }
    };

    const toggleAccordion = (jobId: string) => {
        if (expandedJobId === jobId) {
            setExpandedJobId(null);
        } else {
            setExpandedJobId(jobId);
        }
    };

    // Filter Content Component for reusability
    const FilterContent = () => (
        <div className="space-y-6">
            <div>
                <h4 className="font-bold text-sm text-slate-500 mb-4 uppercase tracking-wider flex items-center gap-2"><Briefcase size={14}/> চাকরির ধরণ</h4>
                <div className="space-y-3">
                    {['Full-time', 'Part-time', 'Internship', 'Contractual'].map(type => (
                        <div key={type} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleFilter(type)}>
                            {filterType.includes(type) ? <CheckSquare size={20} className="text-blue-600 shrink-0 shadow-sm" /> : <Square size={20} className="text-slate-300 group-hover:text-blue-400 shrink-0" />}
                            <span className={`text-sm transition-colors ${filterType.includes(type) ? 'text-blue-700 font-bold' : 'text-slate-600 group-hover:text-slate-900'}`}>{type}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h4 className="font-bold text-sm text-slate-500 mb-4 uppercase tracking-wider flex items-center gap-2"><MapPin size={14}/> অবস্থান (বিভাগ)</h4>
                <div className="space-y-3">
                    {DIVISIONS.map(div => (
                        <div key={div} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleLocation(div)}>
                            {filterLocation.includes(div) ? <CheckSquare size={20} className="text-blue-600 shrink-0 shadow-sm" /> : <Square size={20} className="text-slate-300 group-hover:text-blue-400 shrink-0" />}
                            <span className={`text-sm transition-colors ${filterLocation.includes(div) ? 'text-blue-700 font-bold' : 'text-slate-600 group-hover:text-slate-900'}`}>{div}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h4 className="font-bold text-sm text-slate-500 mb-4 uppercase tracking-wider flex items-center gap-2"><Banknote size={14}/> বেতন (মাসিক)</h4>
                <div className="space-y-3">
                    {SALARY_RANGES.map(range => (
                        <div key={range.label} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleSalary(range.label)}>
                            {filterSalary.includes(range.label) ? <CheckSquare size={20} className="text-blue-600 shrink-0 shadow-sm" /> : <Square size={20} className="text-slate-300 group-hover:text-blue-400 shrink-0" />}
                            <span className={`text-sm transition-colors ${filterSalary.includes(range.label) ? 'text-blue-700 font-bold' : 'text-slate-600 group-hover:text-slate-900'}`}>{range.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="h-screen flex items-center justify-center font-bold text-slate-600">চাকরি খোঁজা হচ্ছে...</div>;

    return (
        <div className="bg-slate-50 min-h-screen font-['Hind_Siliguri']">
            {/* Hero Section */}
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

            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-8 py-12 relative">
                
                {/* Desktop Filter Sidebar */}
                <div className="hidden lg:block lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-28 max-h-[85vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center gap-2 font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">
                            <Filter size={20} className="text-blue-600" /> ফিল্টার অপশন
                        </div>
                        <FilterContent />
                    </div>
                </div>

                {/* Mobile Filter Toggle & Drawer */}
                <div className="lg:hidden mb-4">
                     <button 
                        onClick={() => setIsFilterOpen(true)}
                        className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm"
                     >
                        <Filter size={18}/> ফিল্টার করুন
                     </button>
                </div>

                {/* Off-canvas Filter Drawer */}
                {isFilterOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}></div>
                        <div className="bg-white w-80 h-full shadow-2xl relative z-10 flex flex-col animate-slide-in-right">
                             <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                 <h3 className="font-bold text-slate-800 flex items-center gap-2"><Filter size={18}/> ফিল্টার</h3>
                                 <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-white rounded-full text-slate-500 shadow-sm"><X size={20}/></button>
                             </div>
                             <div className="p-6 overflow-y-auto flex-1">
                                 <FilterContent />
                             </div>
                             <div className="p-4 border-t border-slate-100">
                                 <button onClick={() => setIsFilterOpen(false)} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl">ফলাফল দেখুন</button>
                             </div>
                        </div>
                    </div>
                )}

                {/* Job Listings */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="font-bold text-slate-700">সর্বমোট {filteredJobs.length} টি চাকরি পাওয়া গেছে</h2>
                        <button onClick={() => { setSearchTerm(''); setFilterType([]); setFilterLocation([]); setFilterSalary([]); }} className="text-sm text-red-500 hover:text-red-700 font-bold">
                            Reset Filters
                        </button>
                    </div>

                    {filteredJobs.map(job => (
                        <div key={job.id} className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-lg overflow-hidden group">
                            {/* Card Header */}
                            <div className="p-6 cursor-pointer" onClick={() => toggleAccordion(job.id!)}>
                                <div className="flex flex-col md:flex-row gap-5">
                                    <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center text-2xl font-bold text-blue-600 shrink-0 border border-blue-100">
                                        {job.company.charAt(0)}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                                                <div className="flex items-center gap-2 text-slate-600 font-medium mt-1">
                                                    <Building2 size={14} /> {job.company}
                                                </div>
                                            </div>
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start ${job.employmentStatus === 'Full-time' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {job.employmentStatus}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 mt-4 text-sm text-slate-500">
                                            <div className="flex items-center gap-2"><MapPin size={16} className="text-slate-400"/> {job.location}</div>
                                            <div className="flex items-center gap-2"><Banknote size={16} className="text-slate-400"/> {job.salary}</div>
                                            <div className="flex items-center gap-2 col-span-2 md:col-span-1"><Calendar size={16} className="text-red-400"/> Deadline: <span className="text-red-500 font-medium">{job.deadline || 'N/A'}</span></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center md:justify-end">
                                        <div className={`p-2 rounded-full transition-all duration-300 ${expandedJobId === job.id ? 'bg-blue-100 text-blue-600 rotate-180' : 'bg-slate-100 text-slate-400'}`}>
                                            <ChevronDown size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedJobId === job.id ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="border-t border-slate-100 p-6 md:p-8 bg-slate-50/50 space-y-8">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            {job.jobContext && (
                                                <div><h4 className="font-bold text-slate-900 mb-2 border-l-4 border-blue-500 pl-3">Job Context</h4><p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{job.jobContext}</p></div>
                                            )}
                                            {job.responsibilities && (
                                                <div><h4 className="font-bold text-slate-900 mb-2 border-l-4 border-blue-500 pl-3">Responsibilities</h4><p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-medium">{job.responsibilities}</p></div>
                                            )}
                                        </div>
                                        <div className="space-y-6">
                                            {job.educationalRequirements && (
                                                <div><h4 className="font-bold text-slate-900 mb-2 border-l-4 border-purple-500 pl-3">Education</h4><p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{job.educationalRequirements}</p></div>
                                            )}
                                            {job.experienceRequirements && (
                                                <div><h4 className="font-bold text-slate-900 mb-2 border-l-4 border-purple-500 pl-3">Experience</h4><p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{job.experienceRequirements}</p></div>
                                            )}
                                            {job.additionalRequirements && (
                                                <div><h4 className="font-bold text-slate-900 mb-2 border-l-4 border-purple-500 pl-3">Additional Requirements</h4><p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{job.additionalRequirements}</p></div>
                                            )}
                                        </div>
                                    </div>
                                    {job.compensationAndBenefits && (
                                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                                            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><Banknote size={18} className="text-green-600"/> Compensation & Benefits</h4>
                                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{job.compensationAndBenefits}</p>
                                        </div>
                                    )}
                                    <div className="flex flex-col items-center justify-center pt-6 border-t border-slate-200">
                                        {!user ? (
                                            <div className="text-center">
                                                <p className="text-slate-500 mb-3 text-sm">আবেদন প্রক্রিয়া দেখতে অনুগ্রহ করে লগইন করুন</p>
                                                <button onClick={openLoginModal} className="bg-slate-200 hover:bg-slate-300 text-slate-600 px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2"><Lock size={18} /> View Apply Details</button>
                                            </div>
                                        ) : revealedJobs.includes(job.id!) ? (
                                            <div className="text-center animate-fade-in w-full max-w-md">
                                                <div className="bg-green-50 border border-green-200 p-5 rounded-xl shadow-sm">
                                                    <h4 className="font-bold text-green-800 mb-2 flex items-center justify-center gap-2"><ExternalLink size={18}/> আবেদনের মাধ্যম</h4>
                                                    <div className="bg-white p-3 rounded-lg border border-green-100 mb-2 break-all">
                                                        <a href={job.applyLink?.includes('@') ? `mailto:${job.applyLink}` : job.applyLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline text-lg">{job.applyLink || "No link provided"}</a>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <button onClick={(e) => handleViewDetails(e, job)} disabled={trackingLoading === job.id} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-full font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-3 text-lg">
                                                    {trackingLoading === job.id ? 'Processing...' : <><Eye size={20} /> View Application Details</>}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredJobs.length === 0 && (
                        <div className="bg-white p-16 rounded-2xl text-center border border-dashed border-slate-300">
                            <h3 className="text-xl text-slate-800 font-bold mb-2">দুঃখিত, কোনো চাকরি পাওয়া যায়নি</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default JobPortal;
