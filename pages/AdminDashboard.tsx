import React, { useEffect, useState } from 'react';
import { 
    getLeads, getAffiliates, getUsers, getJobs, saveJob, deleteJob, 
    getBlogPosts, saveBlogPost, deleteBlogPost, getCourses, saveCourse, deleteCourse, 
    signInWithGoogle, loginWithEmail, logout 
} from '../services/firebase';
import { User, Lead, Affiliate, Job, BlogPost, Course } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Users, LayoutDashboard, Share2, Lock, Briefcase, BookOpen, 
    GraduationCap, Plus, Trash2, X, ChevronRight, Menu, ChevronLeft, LogOut, Search, Globe, Chrome
} from 'lucide-react';

interface AdminDashboardProps {
    user: User | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
    // Admin Configuration
    const ADMIN_EMAILS = ['onewayschool.bd@gmail.com', 'onewayschool.bd@gamil.com'];

    // Auth Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    
    // Sidebar State
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    
    const location = useLocation();
    const navigate = useNavigate();

    // Dashboard Data State
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'community' | 'jobs' | 'blogs' | 'courses'>('overview');
    const [loading, setLoading] = useState(false);
    
    const [leads, setLeads] = useState<Lead[]>([]);
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [usersList, setUsersList] = useState<any[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);

    // Forms State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'job' | 'blog' | 'course' | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    // Initial States
    const initialJobState: Job = {
        title: '', company: '', vacancy: '', deadline: '', 
        jobContext: '', responsibilities: '', employmentStatus: 'Full-time', 
        workplace: 'Work at office', educationalRequirements: '', 
        experienceRequirements: '', additionalRequirements: '', 
        location: '', salary: '', compensationAndBenefits: '', description: ''
    };

    const [newJob, setNewJob] = useState<Job>(initialJobState);
    
    const [newBlog, setNewBlog] = useState<BlogPost>({
        title: '', excerpt: '', author: 'Admin', imageUrl: '', content: ''
    });
    
    const [newCourse, setNewCourse] = useState<Course>({
        title: '', instructor: '', price: '', duration: '', imageUrl: '', category: ''
    });

    // Check auth on load
    useEffect(() => {
        if (user && ADMIN_EMAILS.includes(user.email || '')) {
            fetchData();
        }
    }, [user]);

    const handleGoogleLogin = async () => {
        setAuthLoading(true);
        setLoginError('');
        try {
            await signInWithGoogle();
        } catch (error: any) {
            setLoginError(error.message);
        }
        setAuthLoading(false);
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);
        setLoginError('');
        try {
            await loginWithEmail(email, password);
        } catch (error: any) {
            setLoginError("লগইন ব্যর্থ হয়েছে। ইমেইল ও পাসওয়ার্ড চেক করুন।");
        }
        setAuthLoading(false);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [l, a, u, j, b, c] = await Promise.all([
                getLeads(), getAffiliates(), getUsers(), getJobs(), getBlogPosts(), getCourses()
            ]);
            setLeads(l as Lead[]);
            setAffiliates(a as Affiliate[]);
            setUsersList(u);
            setJobs(j as Job[]);
            setBlogs(b as BlogPost[]);
            setCourses(c as Course[]);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        setLoading(false);
    };

    const uploadImage = async (file: File) => {
        const formData = new FormData();
        formData.append('key', '6d207e02198a847aa98d0a2a901485a5');
        formData.append('action', 'upload');
        formData.append('source', file);
        formData.append('format', 'json');
        try {
            const response = await fetch('https://freeimage.host/api/1/upload', { method: 'POST', body: formData });
            const data = await response.json();
            return data.status_code === 200 ? data.image.url : null;
        } catch { return null; }
    };

    // Helper to remove undefined values before sending to Firebase
    const sanitizeData = (data: any) => {
        const clean: any = {};
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== '') {
                clean[key] = data[key];
            } else if (data[key] === '') {
                 clean[key] = ""; 
            }
        });
        return clean;
    };

    // --- SAVE HANDLERS ---
    const handleAddJob = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setFormLoading(true);
        
        try {
            // Force attach auth info outside sanitize to ensure it's never stripped
            const jobData = {
                ...sanitizeData(newJob),
                userId: user.uid,
                userEmail: user.email || '' 
            };
            
            await saveJob(jobData);
            setNewJob(initialJobState);
            setIsModalOpen(false);
            await fetchData();
            alert("চাকরি সফলভাবে পোস্ট করা হয়েছে!");
        } catch (error: any) {
            console.error("Error saving job:", error);
            alert(`চাকরি সেভ করা যায়নি।\nএরর: ${error.message}\n\nঅনুগ্রহ করে ফায়ারবেজ কনসোলে রুলস চেক করুন।`);
        }
        setFormLoading(false);
    };

    const handleAddBlog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setFormLoading(true);
        try {
            const blogData = {
                ...sanitizeData(newBlog),
                userId: user.uid,
                userEmail: user.email || ''
            };
            
            await saveBlogPost(blogData);
            setNewBlog({ title: '', excerpt: '', author: 'Admin', imageUrl: '', content: '' });
            setIsModalOpen(false);
            await fetchData();
            alert("ব্লগ সফলভাবে পোস্ট করা হয়েছে!");
        } catch (error: any) {
            console.error("Error saving blog:", error);
            alert(`ব্লগ সেভ করা যায়নি।\nএরর: ${error.message}`);
        }
        setFormLoading(false);
    };

    const handleAddCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setFormLoading(true);
        try {
            const courseData = {
                ...sanitizeData(newCourse),
                userId: user.uid,
                userEmail: user.email || ''
            };
            
            await saveCourse(courseData);
            setNewCourse({ title: '', instructor: '', price: '', duration: '', imageUrl: '', category: '' });
            setIsModalOpen(false);
            await fetchData();
            alert("কোর্স সফলভাবে যুক্ত করা হয়েছে!");
        } catch (error: any) {
            console.error("Error saving course:", error);
            alert(`কোর্স সেভ করা যায়নি।\nএরর: ${error.message}`);
        }
        setFormLoading(false);
    };

    const handleDelete = async (type: 'job' | 'blog' | 'course', id?: string) => {
        if (!id || !window.confirm("আপনি কি নিশ্চিত এটি ডিলিট করতে চান?")) return;
        try {
            if (type === 'job') await deleteJob(id);
            if (type === 'blog') await deleteBlogPost(id);
            if (type === 'course') await deleteCourse(id);
            await fetchData();
        } catch (error) {
            alert("ডিলিট করা যায়নি। পারমিশন নেই।");
        }
    };


    // --- ACCESS CONTROL UI ---

    // 1. Not Logged In
    if (!user) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-200">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-900/30">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">Admin Login</h2>
                        <p className="text-sm text-slate-500">Only authorized admins can access</p>
                    </div>

                    <form onSubmit={handleEmailLogin} className="space-y-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" placeholder="admin@example.com" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" placeholder="••••••••" />
                        </div>
                        <button disabled={authLoading} type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-lg hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all">
                            {authLoading ? 'Logging in...' : 'Login with Email'}
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">OR</span></div>
                    </div>

                    <button onClick={handleGoogleLogin} disabled={authLoading} className="w-full bg-white border border-slate-300 text-slate-700 font-bold py-3.5 rounded-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                         <Chrome size={20} className="text-blue-600"/> Login with Google
                    </button>

                    {loginError && <p className="text-red-500 text-sm font-medium text-center bg-red-50 py-2 rounded mt-4">{loginError}</p>}
                    
                    <button onClick={() => navigate('/')} className="w-full mt-4 text-slate-500 text-sm hover:text-slate-800">
                        Back to Website
                    </button>
                </div>
            </div>
        );
    }

    // 2. Logged In but Unauthorized
    if (!ADMIN_EMAILS.includes(user.email || '')) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
                    <p className="text-slate-600 mb-6">
                        Hello <strong>{user.displayName}</strong> ({user.email}),<br/>
                        You do not have permission to view this page.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => logout()} className="bg-slate-200 text-slate-800 px-6 py-2.5 rounded-lg font-bold hover:bg-slate-300 transition-colors">
                            Logout
                        </button>
                        <button onClick={() => navigate('/')} className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-slate-800 transition-colors">
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- DASHBOARD UI ---
    return (
        <div className="bg-slate-50 min-h-screen flex relative overflow-hidden">
            
            {/* Sidebar Toggle Button (Visible when sidebar is closed on mobile/desktop) */}
            {!isSidebarOpen && (
                <button 
                    onClick={() => setSidebarOpen(true)}
                    className="fixed top-4 left-4 z-40 bg-slate-900 text-white p-3 rounded-full shadow-lg hover:bg-slate-800 transition-all"
                >
                    <Menu size={20} />
                </button>
            )}

            {/* Sidebar */}
            <div 
                className={`
                    fixed top-0 left-0 h-screen bg-white border-r border-slate-200 shadow-xl z-50 transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'}
                    flex flex-col
                `}
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className={`font-bold text-xl text-slate-800 flex items-center gap-2 ${!isSidebarOpen && 'md:hidden'}`}>
                        <LayoutDashboard className="text-blue-600" /> Admin
                    </div>
                    {/* Toggle Button Inside Sidebar */}
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500">
                        <ChevronLeft size={20} className={`transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 space-y-2 px-3">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                        { id: 'jobs', icon: Briefcase, label: 'Manage Jobs' },
                        { id: 'blogs', icon: BookOpen, label: 'Manage Blog' },
                        { id: 'courses', icon: GraduationCap, label: 'Manage Courses' },
                        { id: 'community', icon: Share2, label: 'Community Lead' },
                        { id: 'users', icon: Users, label: 'User List' },
                    ].map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)} 
                            className={`
                                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                                ${activeTab === item.id 
                                ? 'bg-slate-900 text-white shadow-md' 
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}
                            `}
                            title={!isSidebarOpen ? item.label : ''}
                        >
                            <item.icon size={20} className={`shrink-0 ${activeTab === item.id ? 'text-blue-400' : ''}`} />
                            <span className={`whitespace-nowrap transition-opacity duration-200 ${!isSidebarOpen ? 'opacity-0 w-0 overflow-hidden md:hidden' : 'opacity-100'}`}>
                                {item.label}
                            </span>
                            {!isSidebarOpen && activeTab === item.id && (
                                <div className="hidden md:block absolute w-1.5 h-1.5 bg-blue-500 rounded-full right-2 top-1/2 -translate-y-1/2"></div>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
                    <button onClick={() => navigate('/')} className="flex items-center gap-3 text-slate-600 hover:text-blue-600 w-full px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                        <Globe size={20} />
                        <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>Visit Website</span>
                    </button>
                    <button onClick={() => logout()} className="flex items-center gap-3 text-red-500 hover:text-red-700 w-full px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                        <LogOut size={20} />
                        <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div 
                className={`
                    flex-1 p-6 md:p-10 transition-all duration-300 h-screen overflow-y-auto
                    ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-20'}
                `}
            >
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h1>
                        <p className="text-slate-500 text-sm">Welcome back, Admin</p>
                    </div>
                    <button onClick={fetchData} className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 shadow-sm" title="Refresh Data">
                        <Search size={18} className="text-slate-600"/>
                    </button>
                </div>

                {loading ? (
                    <div className="h-64 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                    </div>
                ) : (
                    <>
                        {/* OVERVIEW */}
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="text-slate-500 font-medium mb-2 text-sm uppercase tracking-wider">Total Users</h3>
                                    <p className="text-4xl font-bold text-slate-800">{usersList.length}</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="text-slate-500 font-medium mb-2 text-sm uppercase tracking-wider">Total Leads</h3>
                                    <p className="text-4xl font-bold text-blue-600">{leads.length}</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="text-slate-500 font-medium mb-2 text-sm uppercase tracking-wider">Affiliates</h3>
                                    <p className="text-4xl font-bold text-green-600">{affiliates.length}</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="text-slate-500 font-medium mb-2 text-sm uppercase tracking-wider">Active Jobs</h3>
                                    <p className="text-4xl font-bold text-purple-600">{jobs.length}</p>
                                </div>
                            </div>
                        )}

                        {/* JOBS */}
                        {activeTab === 'jobs' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h2 className="text-lg font-bold text-slate-800">All Jobs</h2>
                                    <button onClick={() => { setModalType('job'); setIsModalOpen(true); }} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all">
                                        <Plus size={18}/> New Job
                                    </button>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {jobs.map(job => (
                                        <div key={job.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-lg">{job.title}</h4>
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
                                                    <span className="font-medium text-slate-700">{job.company}</span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${job.employmentStatus === 'Full-time' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{job.employmentStatus}</span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                    <span>Deadline: {job.deadline}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDelete('job', job.id)} className="self-end md:self-center p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={20}/></button>
                                        </div>
                                    ))}
                                    {jobs.length === 0 && <div className="p-12 text-center text-slate-400">No jobs found.</div>}
                                </div>
                            </div>
                        )}

                        {/* BLOGS */}
                        {activeTab === 'blogs' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h2 className="text-lg font-bold text-slate-800">All Blogs</h2>
                                    <button onClick={() => { setModalType('blog'); setIsModalOpen(true); }} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all">
                                        <Plus size={18}/> Write Blog
                                    </button>
                                </div>
                                <div className="p-6 grid gap-4">
                                    {blogs.map(blog => (
                                        <div key={blog.id} className="flex gap-4 p-4 border border-slate-100 rounded-xl hover:border-slate-300 transition-all bg-white shadow-sm">
                                            <img src={blog.imageUrl} className="w-20 h-20 object-cover rounded-lg bg-slate-100" alt=""/>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-800 text-lg line-clamp-1">{blog.title}</h4>
                                                <p className="text-sm text-slate-500 line-clamp-1 mt-1">{blog.excerpt}</p>
                                                <p className="text-xs text-slate-400 mt-1">By {blog.author}</p>
                                            </div>
                                            <button onClick={() => handleDelete('blog', blog.id)} className="self-center text-slate-400 hover:text-red-600 p-2"><Trash2 size={18}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* COURSES */}
                        {activeTab === 'courses' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h2 className="text-lg font-bold text-slate-800">Courses</h2>
                                    <button onClick={() => { setModalType('course'); setIsModalOpen(true); }} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all">
                                        <Plus size={18}/> Add Course
                                    </button>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {courses.map(course => (
                                        <div key={course.id} className="flex gap-4 p-4 border border-slate-100 rounded-xl hover:border-blue-200 transition-all bg-white shadow-sm">
                                            <img src={course.imageUrl} className="w-20 h-20 object-cover rounded-lg bg-slate-100" alt=""/>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-800">{course.title}</h4>
                                                <div className="text-sm text-slate-500 mt-1">{course.instructor}</div>
                                                <div className="text-sm font-bold text-blue-600 mt-1">{course.price}</div>
                                            </div>
                                            <button onClick={() => handleDelete('course', course.id)} className="self-start text-slate-400 hover:text-red-600 p-2"><Trash2 size={18}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* USERS & COMMUNITY */}
                        {(activeTab === 'community' || activeTab === 'users') && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                    <h2 className="text-lg font-bold text-slate-800">
                                        {activeTab === 'community' ? 'Community Leads & Affiliates' : 'Registered Users'}
                                    </h2>
                                </div>
                                <div className="overflow-x-auto">
                                    {activeTab === 'community' ? (
                                        <div className="p-6 space-y-8">
                                            <div>
                                                <h3 className="font-bold text-slate-700 mb-4 border-l-4 border-blue-500 pl-3">Job Applications & Leads ({leads.length})</h3>
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Name</th><th className="p-3">Phone</th><th className="p-3">Details</th><th className="p-3">Date</th></tr></thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {leads.map((l, i) => (
                                                            <tr key={i} className="hover:bg-slate-50">
                                                                <td className="p-3 font-medium text-slate-800">{l.name}</td>
                                                                <td className="p-3 text-slate-600">{l.phone}</td>
                                                                <td className="p-3 text-slate-500 max-w-xs truncate">{l.goal}</td>
                                                                <td className="p-3 text-slate-400 text-xs">{l.createdAt ? new Date(l.createdAt.seconds * 1000).toLocaleDateString() : '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-700 mb-4 border-l-4 border-green-500 pl-3">Affiliates & Ambassadors ({affiliates.length})</h3>
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Name</th><th className="p-3">Phone</th><th className="p-3">Institution</th><th className="p-3">Type</th></tr></thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {affiliates.map((a, i) => (
                                                            <tr key={i} className="hover:bg-slate-50">
                                                                <td className="p-3 font-medium text-slate-800">{a.name}</td>
                                                                <td className="p-3 text-slate-600">{a.phone}</td>
                                                                <td className="p-3 text-slate-600">{a.institution}</td>
                                                                <td className="p-3"><span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold">{a.type}</span></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ) : (
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 text-slate-500"><tr><th className="p-4">User</th><th className="p-4">Email</th><th className="p-4">Last Login</th></tr></thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {usersList.map((u, i) => (
                                                    <tr key={i} className="hover:bg-slate-50">
                                                        <td className="p-4 flex items-center gap-3">
                                                            <img src={u.photoURL || 'https://via.placeholder.com/32'} className="w-8 h-8 rounded-full border border-slate-200"/> 
                                                            <span className="font-medium text-slate-800">{u.name}</span>
                                                        </td>
                                                        <td className="p-4 text-slate-600">{u.email}</td>
                                                        <td className="p-4 text-slate-400">{u.lastLogin ? new Date(u.lastLogin.seconds * 1000).toLocaleString() : '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* --- MODALS --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-3xl my-8 relative shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-slate-800">
                                {modalType === 'job' && 'Post New Job'}
                                {modalType === 'blog' && 'Write New Blog'}
                                {modalType === 'course' && 'Add New Course'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {modalType === 'job' && (
                                <form onSubmit={handleAddJob} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Job Title *</label>
                                            <input required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. Senior Frontend Developer"/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Company Name *</label>
                                            <input required value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Vacancy *</label>
                                            <input required value={newJob.vacancy} onChange={e => setNewJob({...newJob, vacancy: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. 02"/>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Job Location *</label>
                                            <input required value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. Dhaka, Gulshan"/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Salary Range *</label>
                                            <input required value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. 30k - 50k BDT"/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Application Deadline *</label>
                                            <input type="date" required value={newJob.deadline} onChange={e => setNewJob({...newJob, deadline: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Workplace *</label>
                                            <select value={newJob.workplace} onChange={e => setNewJob({...newJob, workplace: e.target.value as any})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                                <option value="Work at office">Work at office</option>
                                                <option value="Work from home">Work from home</option>
                                                <option value="Hybrid">Hybrid</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Employment Status *</label>
                                            <select value={newJob.employmentStatus} onChange={e => setNewJob({...newJob, employmentStatus: e.target.value as any})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                                <option value="Full-time">Full-time</option>
                                                <option value="Part-time">Part-time</option>
                                                <option value="Contractual">Contractual</option>
                                                <option value="Internship">Internship</option>
                                                <option value="Freelance">Freelance</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Job Context (Summary)</label>
                                            <textarea rows={3} value={newJob.jobContext} onChange={e => setNewJob({...newJob, jobContext: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Brief description about the role..."></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Job Responsibilities *</label>
                                            <textarea required rows={5} value={newJob.responsibilities} onChange={e => setNewJob({...newJob, responsibilities: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="• Item 1&#10;• Item 2"></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Educational Requirements</label>
                                            <textarea rows={2} value={newJob.educationalRequirements} onChange={e => setNewJob({...newJob, educationalRequirements: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. Bachelor in CSE"></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Experience Requirements</label>
                                            <textarea rows={2} value={newJob.experienceRequirements} onChange={e => setNewJob({...newJob, experienceRequirements: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. At least 1 year experience"></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Additional Requirements</label>
                                            <textarea rows={3} value={newJob.additionalRequirements} onChange={e => setNewJob({...newJob, additionalRequirements: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="• Age 20 to 30&#10;• Good communication skill"></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Compensation & Other Benefits</label>
                                            <textarea rows={3} value={newJob.compensationAndBenefits} onChange={e => setNewJob({...newJob, compensationAndBenefits: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="• T/A, Mobile bill&#10;• Salary Review: Yearly"></textarea>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100">
                                        <button disabled={formLoading} type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all text-lg shadow-lg">
                                            {formLoading ? 'Publishing...' : 'Publish Job'}
                                        </button>
                                    </div>
                                </form>
                            )}

                             {modalType === 'course' && (
                                <form onSubmit={handleAddCourse} className="space-y-4">
                                    <input required placeholder="Course Title" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input required placeholder="Instructor" value={newCourse.instructor} onChange={e => setNewCourse({...newCourse, instructor: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                        <input required placeholder="Price" value={newCourse.price} onChange={e => setNewCourse({...newCourse, price: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input required placeholder="Duration" value={newCourse.duration} onChange={e => setNewCourse({...newCourse, duration: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                        <input required placeholder="Category" value={newCourse.category} onChange={e => setNewCourse({...newCourse, category: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Thumbnail</label>
                                        <input type="file" onChange={async (e) => {
                                            if(e.target.files?.[0]) {
                                                const url = await uploadImage(e.target.files[0]);
                                                if(url) setNewCourse({...newCourse, imageUrl: url});
                                            }
                                        }} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 cursor-pointer" />
                                    </div>

                                    <button disabled={formLoading} type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all">
                                        {formLoading ? 'Saving...' : 'Add Course'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;