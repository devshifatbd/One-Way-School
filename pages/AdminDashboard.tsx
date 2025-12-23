import React, { useEffect, useState } from 'react';
import { 
    getLeads, getAffiliates, getUsers, getJobs, saveJob, updateJob, deleteJob, 
    getBlogPosts, saveBlogPost, updateBlogPost, deleteBlogPost, 
    getCourses, saveCourse, updateCourse, deleteCourse, updateAffiliateStatus,
    signInWithGoogle, loginWithEmail, logout 
} from '../services/firebase';
import { User, Lead, Affiliate, Job, BlogPost, Course } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Users, LayoutDashboard, Share2, Lock, Briefcase, BookOpen, 
    GraduationCap, Plus, Trash2, X, ChevronRight, Menu, ChevronLeft, LogOut, Search, Globe, Chrome, Link as LinkIcon, Edit, CheckCircle, XCircle
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
    const [editingId, setEditingId] = useState<string | null>(null);

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

    // --- MODAL & FORM HANDLERS (Job, Blog, Course) ---
    // ... (Keep existing handlers for Job, Blog, Course as is from previous version)
    const openNewJobModal = () => { setEditingId(null); setNewJob(initialJobState); setModalType('job'); setIsModalOpen(true); };
    const openEditJobModal = (job: Job) => { setEditingId(job.id || null); setNewJob(job); setModalType('job'); setIsModalOpen(true); };
    const openNewBlogModal = () => { setEditingId(null); setNewBlog({ title: '', excerpt: '', author: 'Admin', imageUrl: '', content: '' }); setModalType('blog'); setIsModalOpen(true); };
    const openEditBlogModal = (blog: BlogPost) => { setEditingId(blog.id || null); setNewBlog(blog); setModalType('blog'); setIsModalOpen(true); };
    const openNewCourseModal = () => { setEditingId(null); setNewCourse({ title: '', instructor: '', price: '', duration: '', imageUrl: '', category: '' }); setModalType('course'); setIsModalOpen(true); };
    const openEditCourseModal = (course: Course) => { setEditingId(course.id || null); setNewCourse(course); setModalType('course'); setIsModalOpen(true); };

    const handleSaveJob = async (e: React.FormEvent) => {
        e.preventDefault(); if (!user) return; setFormLoading(true);
        try {
            const jobData = { ...sanitizeData(newJob), userId: user.uid, userEmail: user.email || '' };
            if (editingId) await updateJob(editingId, jobData); else await saveJob(jobData);
            setNewJob(initialJobState); setIsModalOpen(false); await fetchData(); alert("Success!");
        } catch (error: any) { alert(`Error: ${error.message}`); } setFormLoading(false);
    };

    const handleSaveBlog = async (e: React.FormEvent) => {
        e.preventDefault(); if (!user) return; setFormLoading(true);
        try {
            const blogData = { ...sanitizeData(newBlog), userId: user.uid, userEmail: user.email || '' };
            if (editingId) await updateBlogPost(editingId, blogData); else await saveBlogPost(blogData);
            setNewBlog({ title: '', excerpt: '', author: 'Admin', imageUrl: '', content: '' }); setIsModalOpen(false); await fetchData(); alert("Success!");
        } catch (error: any) { alert(`Error: ${error.message}`); } setFormLoading(false);
    };

    const handleSaveCourse = async (e: React.FormEvent) => {
        e.preventDefault(); if (!user) return; setFormLoading(true);
        try {
            const courseData = { ...sanitizeData(newCourse), userId: user.uid, userEmail: user.email || '' };
            if (editingId) await updateCourse(editingId, courseData); else await saveCourse(courseData);
            setNewCourse({ title: '', instructor: '', price: '', duration: '', imageUrl: '', category: '' }); setIsModalOpen(false); await fetchData(); alert("Success!");
        } catch (error: any) { alert(`Error: ${error.message}`); } setFormLoading(false);
    };

    const handleDelete = async (type: 'job' | 'blog' | 'course', id?: string) => {
        if (!id || !window.confirm("Are you sure?")) return;
        try {
            if (type === 'job') await deleteJob(id);
            if (type === 'blog') await deleteBlogPost(id);
            if (type === 'course') await deleteCourse(id);
            await fetchData();
        } catch (error) { alert("Delete failed"); }
    };

    // --- AFFILIATE APPROVAL HANDLER ---
    const handleAffiliateAction = async (id: string, action: 'approved' | 'rejected', userId?: string) => {
        if(!window.confirm(`Are you sure you want to ${action} this request?`)) return;
        try {
            // Generate Referral Code: OWS + First 5 chars of UID (simple logic)
            const refCode = action === 'approved' && userId ? `OWS-${userId.slice(0,5).toUpperCase()}` : undefined;
            await updateAffiliateStatus(id, action, refCode);
            await fetchData();
        } catch(e) {
            alert("Action failed");
        }
    };


    // --- ACCESS CONTROL UI ---
    if (!user) { /* ... Login UI ... */ return <div className="p-10 text-center">Login Required</div>; }
    if (!ADMIN_EMAILS.includes(user.email || '')) { /* ... Denied UI ... */ return <div className="p-10 text-center">Access Denied</div>; }

    return (
        <div className="bg-slate-50 min-h-screen flex relative overflow-hidden">
             {/* Sidebar & Toggle Logic Same as before */}
             {/* ... */}
             <div className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200 shadow-xl z-50 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'} flex flex-col`}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className={`font-bold text-xl text-slate-800 flex items-center gap-2 ${!isSidebarOpen && 'md:hidden'}`}><LayoutDashboard className="text-blue-600" /> Admin</div>
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500"><ChevronLeft size={20} className={`transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : ''}`} /></button>
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
                        <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${activeTab === item.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>
                            <item.icon size={20} className={`shrink-0 ${activeTab === item.id ? 'text-blue-400' : ''}`} />
                            <span className={`whitespace-nowrap transition-opacity duration-200 ${!isSidebarOpen ? 'opacity-0 w-0 overflow-hidden md:hidden' : 'opacity-100'}`}>{item.label}</span>
                        </button>
                    ))}
                </nav>
                 <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
                    <button onClick={() => navigate('/')} className="flex items-center gap-3 text-slate-600 hover:text-blue-600 w-full px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"><Globe size={20} /><span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>Visit Website</span></button>
                    <button onClick={() => logout()} className="flex items-center gap-3 text-red-500 hover:text-red-700 w-full px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"><LogOut size={20} /><span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>Logout</span></button>
                </div>
            </div>

            <div className={`flex-1 p-6 md:p-10 transition-all duration-300 h-screen overflow-y-auto ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-20'}`}>
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div><h1 className="text-3xl font-bold text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h1></div>
                    <button onClick={fetchData} className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 shadow-sm"><Search size={18} className="text-slate-600"/></button>
                </div>

                {/* Content */}
                {loading ? <div>Loading...</div> : (
                    <>
                        {/* Keeping Overview, Jobs, Blogs, Courses logic essentially same, just rendering Community differently */}
                        {activeTab === 'overview' && (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><h3 className="text-slate-500 font-medium mb-2 text-sm">Users</h3><p className="text-4xl font-bold text-slate-800">{usersList.length}</p></div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><h3 className="text-slate-500 font-medium mb-2 text-sm">Pending Affiliates</h3><p className="text-4xl font-bold text-green-600">{affiliates.filter(a => a.status === 'pending').length}</p></div>
                             </div>
                        )}

                        {activeTab === 'community' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                    <h2 className="text-lg font-bold text-slate-800">Affiliate & Ambassador Requests</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Name</th><th className="p-3">Type</th><th className="p-3">Status</th><th className="p-3">Earnings</th><th className="p-3">Actions</th></tr></thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {affiliates.map((a, i) => (
                                                <tr key={i} className="hover:bg-slate-50">
                                                    <td className="p-3">
                                                        <div className="font-medium text-slate-800">{a.name}</div>
                                                        <div className="text-xs text-slate-500">{a.email}</div>
                                                    </td>
                                                    <td className="p-3"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{a.type}</span></td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${a.status === 'approved' ? 'bg-green-100 text-green-700' : a.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            {a.status || 'pending'}
                                                        </span>
                                                        {a.referralCode && <div className="text-xs mt-1 font-mono text-slate-400">{a.referralCode}</div>}
                                                    </td>
                                                    <td className="p-3">৳ {a.balance || 0}</td>
                                                    <td className="p-3 flex gap-2">
                                                        {a.status === 'pending' && (
                                                            <>
                                                                <button onClick={() => handleAffiliateAction(a.id!, 'approved', a.userId)} className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200" title="Approve"><CheckCircle size={18}/></button>
                                                                <button onClick={() => handleAffiliateAction(a.id!, 'rejected')} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Reject"><XCircle size={18}/></button>
                                                            </>
                                                        )}
                                                        {a.status === 'approved' && <span className="text-xs text-green-600 font-bold">Active</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Standard CRUD Tables for other tabs */}
                         {activeTab === 'jobs' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h2 className="text-lg font-bold text-slate-800">All Jobs</h2>
                                    <button onClick={openNewJobModal} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all"><Plus size={18}/> New Job</button>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {jobs.map(job => (
                                        <div key={job.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                                            <div><h4 className="font-bold text-slate-800 text-lg">{job.title}</h4><div className="text-sm text-slate-500">{job.company}</div></div>
                                            <div className="flex gap-2 self-end md:self-center">
                                                <button onClick={() => openEditJobModal(job)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit size={20}/></button>
                                                <button onClick={() => handleDelete('job', job.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={20}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'blogs' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h2 className="text-lg font-bold text-slate-800">All Blogs</h2>
                                    <button onClick={openNewBlogModal} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all"><Plus size={18}/> New Blog</button>
                                </div>
                                <div className="p-6 grid gap-4">
                                    {blogs.map(blog => (
                                        <div key={blog.id} className="flex gap-4 p-4 border border-slate-100 rounded-xl hover:border-slate-300 transition-all bg-white shadow-sm">
                                            <div className="flex-1"><h4 className="font-bold text-slate-800 text-lg">{blog.title}</h4></div>
                                            <div className="flex flex-col gap-2 self-center">
                                                <button onClick={() => openEditBlogModal(blog)} className="text-slate-400 hover:text-blue-600 p-2"><Edit size={18}/></button>
                                                <button onClick={() => handleDelete('blog', blog.id)} className="text-slate-400 hover:text-red-600 p-2"><Trash2 size={18}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'courses' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h2 className="text-lg font-bold text-slate-800">Courses</h2>
                                    <button onClick={openNewCourseModal} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all"><Plus size={18}/> New Course</button>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {courses.map(course => (
                                        <div key={course.id} className="flex gap-4 p-4 border border-slate-100 rounded-xl hover:border-blue-200 transition-all bg-white shadow-sm">
                                            <div className="flex-1"><h4 className="font-bold text-slate-800">{course.title}</h4></div>
                                            <div className="flex flex-col gap-2 self-start">
                                                <button onClick={() => openEditCourseModal(course)} className="text-slate-400 hover:text-blue-600 p-2"><Edit size={18}/></button>
                                                <button onClick={() => handleDelete('course', course.id)} className="text-slate-400 hover:text-red-600 p-2"><Trash2 size={18}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                         {activeTab === 'users' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50"><h2 className="text-lg font-bold text-slate-800">Registered Users</h2></div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-500"><tr><th className="p-4">User</th><th className="p-4">Email</th><th className="p-4">Last Login</th></tr></thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {usersList.map((u, i) => (
                                                <tr key={i} className="hover:bg-slate-50">
                                                    <td className="p-4 flex items-center gap-3"><img src={u.photoURL || 'https://via.placeholder.com/32'} className="w-8 h-8 rounded-full border border-slate-200"/><span className="font-medium text-slate-800">{u.name}</span></td>
                                                    <td className="p-4 text-slate-600">{u.email}</td>
                                                    <td className="p-4 text-slate-400">{u.lastLogin ? new Date(u.lastLogin.seconds * 1000).toLocaleString() : '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals remain same as previous step, just reusing existing structure */}
             {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-3xl my-8 relative shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-slate-800">
                                {modalType === 'job' && (editingId ? 'Edit Job' : 'Post New Job')}
                                {modalType === 'blog' && (editingId ? 'Edit Blog' : 'Write New Blog')}
                                {modalType === 'course' && (editingId ? 'Edit Course' : 'Add New Course')}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {modalType === 'job' && (
                                <form onSubmit={handleSaveJob} className="space-y-6">
                                     <input required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg mb-2" placeholder="Job Title"/>
                                     <input required value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg mb-2" placeholder="Company"/>
                                     <input required value={newJob.vacancy} onChange={e => setNewJob({...newJob, vacancy: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg mb-2" placeholder="Vacancy"/>
                                     <input required value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg mb-2" placeholder="Location"/>
                                     <input required value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg mb-2" placeholder="Salary"/>
                                     <textarea rows={3} value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg mb-2" placeholder="Description"></textarea>
                                     <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg">Save Job</button>
                                </form>
                            )}
                             {modalType === 'blog' && (
                                <form onSubmit={handleSaveBlog} className="space-y-6">
                                    <input required value={newBlog.title} onChange={e => setNewBlog({...newBlog, title: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg mb-2" placeholder="Title"/>
                                    <input required value={newBlog.author} onChange={e => setNewBlog({...newBlog, author: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg mb-2" placeholder="Author"/>
                                    <input required value={newBlog.imageUrl} onChange={e => setNewBlog({...newBlog, imageUrl: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg mb-2" placeholder="Image URL"/>
                                    <textarea rows={3} value={newBlog.excerpt} onChange={e => setNewBlog({...newBlog, excerpt: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg mb-2" placeholder="Excerpt"></textarea>
                                    <textarea rows={6} value={newBlog.content} onChange={e => setNewBlog({...newBlog, content: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg mb-2" placeholder="Content"></textarea>
                                    <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg">Save Blog</button>
                                </form>
                            )}
                             {modalType === 'course' && (
                                <form onSubmit={handleSaveCourse} className="space-y-6">
                                    <input required value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg mb-2" placeholder="Title"/>
                                    <input required value={newCourse.instructor} onChange={e => setNewCourse({...newCourse, instructor: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg mb-2" placeholder="Instructor"/>
                                    <input required value={newCourse.price} onChange={e => setNewCourse({...newCourse, price: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg mb-2" placeholder="Price"/>
                                    <input required value={newCourse.duration} onChange={e => setNewCourse({...newCourse, duration: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg mb-2" placeholder="Duration"/>
                                    <input required value={newCourse.imageUrl} onChange={e => setNewCourse({...newCourse, imageUrl: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg mb-2" placeholder="Thumbnail URL"/>
                                    <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg">Save Course</button>
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