import React, { useEffect, useState, useRef } from 'react';
import { 
    getLeads, getAffiliates, getUsers, getJobs, saveJob, updateJob, deleteJob, 
    getBlogPosts, saveBlogPost, updateBlogPost, deleteBlogPost, 
    getCourses, saveCourse, updateCourse, deleteCourse, updateAffiliateStatus,
    getJobInterests, getEcosystemApplications, updateEcosystemAppStatus, updateEcosystemStudent,
    getCommunityMembers, saveCommunityMember, deleteCommunityMember, bulkSaveCommunityMembers,
    logout, auth, updateData
} from '../services/firebase';
import { User, Lead, Affiliate, Job, BlogPost, Course, JobInterest, EcosystemApplication, CommunityMember } from '../types';
import { useNavigate } from 'react-router-dom';
import { 
    Users, LayoutDashboard, Share2, Briefcase, BookOpen, 
    GraduationCap, Plus, Trash2, X, ChevronLeft, LogOut, Search, Globe, Edit, CheckCircle, XCircle, MousePointerClick, CreditCard, Database, Download, Upload, Filter, Settings
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface AdminDashboardProps {
    user: User | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
    // Admin Configuration
    const ADMIN_EMAILS = ['onewayschool.bd@gmail.com', 'onewayschool.bd@gamil.com'];
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();

    // Data State
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'community' | 'jobs' | 'blogs' | 'courses' | 'ecosystem' | 'analytics' | 'database'>('overview');
    const [loading, setLoading] = useState(false);
    
    const [leads, setLeads] = useState<Lead[]>([]);
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [usersList, setUsersList] = useState<any[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [jobInterests, setJobInterests] = useState<JobInterest[]>([]);
    const [ecosystemApps, setEcosystemApps] = useState<EcosystemApplication[]>([]);
    const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>([]);

    // Forms State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'job' | 'blog' | 'course' | 'member' | 'ecosystem_manage' | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Ecosystem Management State
    const [manageStudent, setManageStudent] = useState<EcosystemApplication | null>(null);
    const [ecoFormData, setEcoFormData] = useState({
        batch: '',
        classLink: '',
        classTime: '',
        currentModule: 1,
        noticeTitle: '',
        noticeMessage: ''
    });

    // Community Member specific states
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [memberSearch, setMemberSearch] = useState('');
    const [certGeneratingId, setCertGeneratingId] = useState<string | null>(null);
    const [certMember, setCertMember] = useState<any>(null); // For hidden certificate render
    const adminCertRef = useRef<HTMLDivElement>(null);

    const MEMBER_CATEGORIES = [
        'Central Team',
        'Sub Central Team',
        'Division Team',
        'District Team',
        'Campus Ambassador',
        'Volunteer'
    ];

    // Initial States
    const initialJobState: Job = {
        title: '', company: '', vacancy: '', deadline: '', 
        jobContext: '', responsibilities: '', employmentStatus: 'Full-time', 
        workplace: 'Work at office', educationalRequirements: '', 
        experienceRequirements: '', additionalRequirements: '', 
        location: '', salary: '', compensationAndBenefits: '', description: '',
        applyLink: ''
    };

    const [newJob, setNewJob] = useState<Job>(initialJobState);
    const [newBlog, setNewBlog] = useState<BlogPost>({ title: '', excerpt: '', author: 'Admin', imageUrl: '', content: '' });
    const [newCourse, setNewCourse] = useState<Course>({ title: '', instructor: '', price: '', duration: '', imageUrl: '', category: '' });
    const [newMember, setNewMember] = useState<CommunityMember>({ name: '', phone: '', email: '', role: '', category: 'Volunteer' });

    // CSV Upload
    const [csvFile, setCsvFile] = useState<File | null>(null);

    useEffect(() => {
        if (user && ADMIN_EMAILS.includes(user.email || '')) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [l, a, u, j, b, c, ji, ea, cm] = await Promise.all([
                getLeads(), getAffiliates(), getUsers(), getJobs(), getBlogPosts(), getCourses(),
                getJobInterests(), getEcosystemApplications(), getCommunityMembers()
            ]);
            setLeads(l as Lead[]);
            setAffiliates(a as Affiliate[]);
            setUsersList(u);
            setJobs(j as Job[]);
            setBlogs(b as BlogPost[]);
            setCourses(c as Course[]);
            setJobInterests(ji as JobInterest[]);
            setEcosystemApps(ea as EcosystemApplication[]);
            setCommunityMembers(cm as CommunityMember[]);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    // --- Certificate Generation Helper ---
    const handleAdminCertDownload = async (member: CommunityMember) => {
        if(!member.id) return;
        setCertGeneratingId(member.id);
        
        // Prepare data for the hidden template
        setCertMember({
            ...member,
            nameForCert: member.name,
            issueDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        });

        // Wait for render
        setTimeout(async () => {
            if (adminCertRef.current) {
                try {
                    const canvas = await html2canvas(adminCertRef.current, {
                        scale: 3,
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff'
                    });

                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF({
                        orientation: 'landscape',
                        unit: 'px',
                        format: [canvas.width / 3, canvas.height / 3]
                    });

                    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3);
                    pdf.save(`OWS_Certificate_${member.name}.pdf`);
                } catch(e) {
                    alert("Error generating PDF");
                }
            }
            setCertGeneratingId(null);
            setCertMember(null); // Clean up
        }, 1000);
    };

    // Helper to determine display role on certificate
    const getCertDisplayRole = (member: any) => {
        const simpleCategories = ['Campus Ambassador', 'Volunteer'];
        if (member.category && !simpleCategories.includes(member.category)) {
            return (
                <div className="flex flex-col items-center">
                    <span className="text-[#1e3a8a] font-bold">{member.role}</span>
                    <span className="text-sm text-slate-500 font-normal uppercase tracking-wider mt-1">{member.category}</span>
                </div>
            );
        }
        return <span className="text-[#1e3a8a] font-bold">{member.role}</span>;
    };

    // --- CSV Handlers ---
    const handleCsvUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        const currentUser = auth.currentUser; 
        if(!csvFile || !currentUser) return;
        setFormLoading(true);

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            // Simple CSV parser
            const rows = text.split('\n').slice(1); // Skip header
            const members: any[] = [];
            
            rows.forEach(row => {
                const cols = row.split(',');
                if(cols.length >= 4) {
                    members.push({
                        name: cols[0].trim(),
                        phone: cols[1].trim(),
                        email: cols[2].trim(),
                        role: cols[3].trim(),
                        category: cols[4]?.trim() || 'Volunteer',
                        userId: currentUser.uid, 
                        userEmail: currentUser.email || ''
                    });
                }
            });

            if(members.length > 0) {
                await bulkSaveCommunityMembers(members);
                alert(`${members.length} members imported!`);
                fetchData();
            } else {
                alert("No valid data found in CSV");
            }
            setFormLoading(false);
        };
        reader.readAsText(csvFile);
    };

    const downloadCsv = () => {
        const header = "Name,Phone,Email,Role,Category\n";
        const rows = communityMembers.map(m => `${m.name},${m.phone},${m.email},${m.role},${m.category || ''}`).join("\n");
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "community_members.csv";
        a.click();
    };

    // --- Generic Handlers ---
    const sanitizeData = (data: any) => {
        const clean: any = {};
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined) clean[key] = data[key];
        });
        return clean;
    };

    const openNewJobModal = () => { setEditingId(null); setNewJob(initialJobState); setModalType('job'); setIsModalOpen(true); };
    const openEditJobModal = (job: Job) => { setEditingId(job.id || null); setNewJob(job); setModalType('job'); setIsModalOpen(true); };
    const openNewBlogModal = () => { setEditingId(null); setNewBlog({ title: '', excerpt: '', author: 'Admin', imageUrl: '', content: '' }); setModalType('blog'); setIsModalOpen(true); };
    const openEditBlogModal = (blog: BlogPost) => { setEditingId(blog.id || null); setNewBlog(blog); setModalType('blog'); setIsModalOpen(true); };
    const openNewCourseModal = () => { setEditingId(null); setNewCourse({ title: '', instructor: '', price: '', duration: '', imageUrl: '', category: '' }); setModalType('course'); setIsModalOpen(true); };
    const openEditCourseModal = (course: Course) => { setEditingId(course.id || null); setNewCourse(course); setModalType('course'); setIsModalOpen(true); };
    
    const openNewMemberModal = () => { setEditingId(null); setNewMember({ name: '', phone: '', email: '', role: '', category: 'Volunteer' }); setModalType('member'); setIsModalOpen(true); };
    const openEditMemberModal = (m: CommunityMember) => { setEditingId(m.id || null); setNewMember({ ...m, category: m.category || 'Volunteer' }); setModalType('member'); setIsModalOpen(true); };
    
    const openManageEcosystemModal = (app: EcosystemApplication) => {
        setManageStudent(app);
        setEcoFormData({
            batch: app.batch || '',
            classLink: app.classLink || '',
            classTime: app.classTime || '',
            currentModule: app.currentModule || 1,
            noticeTitle: '',
            noticeMessage: ''
        });
        setModalType('ecosystem_manage');
        setIsModalOpen(true);
    };


    // Save Handlers
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

    const handleSaveMember = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert("Session expired. Please login again.");
            return;
        }

        if (!newMember.name || !newMember.phone) {
            alert("Name and Phone are required.");
            return;
        }

        let finalRole = newMember.role;
        if (['Campus Ambassador', 'Volunteer'].includes(newMember.category || '')) {
            finalRole = newMember.category!;
        } else if (!finalRole) {
            alert("Position (Role) is required for this category.");
            return;
        }

        setFormLoading(true);
        try {
            const memberData = {
                name: newMember.name,
                phone: newMember.phone,
                email: newMember.email || '',
                category: newMember.category,
                role: finalRole,
                userId: currentUser.uid, 
                userEmail: currentUser.email || ''
            };
            
            if (editingId) {
                await updateData('community_members', editingId, memberData);
            } else {
                await saveCommunityMember(memberData);
            }
            
            setNewMember({ name: '', phone: '', email: '', role: '', category: 'Volunteer' });
            setIsModalOpen(false);
            await fetchData(); 
            alert("Member Saved!");
        } catch(e: any) { 
            console.error(e);
            alert("Error: " + e.message); 
        }
        setFormLoading(false);
    };

    const handleSaveEcosystemStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!manageStudent?.id) return;
        setFormLoading(true);
        try {
            const updatePayload: any = {
                batch: ecoFormData.batch,
                classLink: ecoFormData.classLink,
                classTime: ecoFormData.classTime,
                currentModule: Number(ecoFormData.currentModule)
            };

            // Add notice if present
            if(ecoFormData.noticeTitle && ecoFormData.noticeMessage) {
                const newNotice = {
                    title: ecoFormData.noticeTitle,
                    message: ecoFormData.noticeMessage,
                    date: new Date()
                };
                const existingNotices = manageStudent.notices || [];
                updatePayload.notices = [newNotice, ...existingNotices];
            }

            await updateEcosystemStudent(manageStudent.id, updatePayload);
            setIsModalOpen(false);
            fetchData();
            alert("Student Updated!");
        } catch(e) {
            alert("Update Failed");
        }
        setFormLoading(false);
    }

    const handleDelete = async (type: 'job' | 'blog' | 'course' | 'member', id?: string) => {
        if (!id || !window.confirm("Are you sure?")) return;
        try {
            if (type === 'job') await deleteJob(id);
            if (type === 'blog') await deleteBlogPost(id);
            if (type === 'course') await deleteCourse(id);
            if (type === 'member') await deleteCommunityMember(id);
            await fetchData();
        } catch (error) { alert("Delete failed"); }
    };

    // Actions for Ecosystem and Affiliates
    const handleEcosystemStatus = async (id: string, status: string) => {
        try { await updateEcosystemAppStatus(id, status); fetchData(); } catch(e) { alert("Failed"); }
    };

    const handleAffiliateStatus = async (id: string, status: string, name?: string) => {
        const referralCode = status === 'approved' && name ? name.split(' ')[0].toUpperCase() + Math.floor(100 + Math.random() * 900) : undefined;
        try { await updateAffiliateStatus(id, status, referralCode); fetchData(); } catch(e) { alert("Failed"); }
    };

    // --- Filter Logic for Community Members ---
    const filteredMembers = communityMembers.filter(m => {
        const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;
        const matchesSearch = memberSearch === '' || 
            m.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
            m.phone.includes(memberSearch) ||
            (m.id && m.id.toLowerCase().includes(memberSearch.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    if (!user || !ADMIN_EMAILS.includes(user.email || '')) return <div className="p-10 text-center">Access Denied</div>;

    return (
        <div className="bg-slate-50 min-h-screen flex relative overflow-hidden font-['Hind_Siliguri']">
             {/* Sidebar */}
             <div className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200 shadow-xl z-50 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'} flex flex-col`}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className={`font-bold text-xl text-slate-800 flex items-center gap-2 ${!isSidebarOpen && 'md:hidden'}`}><LayoutDashboard className="text-blue-600" /> Admin</div>
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500"><ChevronLeft size={20} className={`transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : ''}`} /></button>
                </div>
                <nav className="flex-1 overflow-y-auto py-4 space-y-2 px-3">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                        { id: 'database', icon: Database, label: 'Community Database' },
                        { id: 'jobs', icon: Briefcase, label: 'Manage Jobs' },
                        { id: 'analytics', icon: MousePointerClick, label: 'Job Tracking' },
                        { id: 'ecosystem', icon: CreditCard, label: 'Ecosystem Students' },
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
                        {activeTab === 'overview' && (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><h3 className="text-slate-500 font-medium mb-2 text-sm">Total Users</h3><p className="text-4xl font-bold text-slate-800">{usersList.length}</p></div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><h3 className="text-slate-500 font-medium mb-2 text-sm">Total Members</h3><p className="text-4xl font-bold text-blue-600">{communityMembers.length}</p></div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><h3 className="text-slate-500 font-medium mb-2 text-sm">Total Jobs</h3><p className="text-4xl font-bold text-purple-600">{jobs.length}</p></div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><h3 className="text-slate-500 font-medium mb-2 text-sm">Total Blogs</h3><p className="text-4xl font-bold text-green-600">{blogs.length}</p></div>
                             </div>
                        )}

                        {activeTab === 'database' && (
                             <div className="space-y-6">
                                 {/* Category Tabs */}
                                 <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                     <button 
                                        onClick={() => setCategoryFilter('All')} 
                                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${categoryFilter === 'All' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                                     >
                                         All
                                     </button>
                                     {MEMBER_CATEGORIES.map(cat => (
                                         <button 
                                            key={cat} 
                                            onClick={() => setCategoryFilter(cat)} 
                                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${categoryFilter === cat ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                                         >
                                             {cat}
                                         </button>
                                     ))}
                                 </div>

                                 {/* Actions & Search */}
                                 <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row flex-wrap gap-4 items-center justify-between">
                                     <div className="relative w-full md:w-auto">
                                         <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                         <input 
                                            type="text" 
                                            placeholder="Search by Name, Phone, ID..." 
                                            value={memberSearch}
                                            onChange={(e) => setMemberSearch(e.target.value)}
                                            className="pl-10 pr-4 py-2 rounded-lg border border-slate-300 w-full md:w-64 focus:ring-2 focus:ring-blue-500 outline-none"
                                         />
                                     </div>
                                     <div className="flex gap-2 items-center">
                                         <button onClick={openNewMemberModal} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800 text-sm"><Plus size={16}/> Add Member</button>
                                         <button onClick={downloadCsv} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-200 text-sm"><Download size={16}/> CSV</button>
                                         <div className="h-6 w-px bg-slate-200 mx-2"></div>
                                         <form onSubmit={handleCsvUpload} className="flex gap-2 items-center">
                                            <label className="cursor-pointer bg-slate-100 text-slate-600 px-3 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 flex items-center gap-2">
                                                <Upload size={16}/> Import
                                                <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files?.[0] || null)} className="hidden"/>
                                            </label>
                                            {csvFile && <button type="submit" disabled={formLoading} className="text-green-600 font-bold text-xs">Save</button>}
                                         </form>
                                     </div>
                                 </div>

                                 {/* Table */}
                                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                     <div className="overflow-x-auto">
                                         <table className="w-full text-left text-sm">
                                             <thead className="bg-slate-50 text-slate-500">
                                                 <tr>
                                                     <th className="p-3">ID</th>
                                                     <th className="p-3">Name</th>
                                                     <th className="p-3">Phone</th>
                                                     <th className="p-3">Category</th>
                                                     <th className="p-3">Role</th>
                                                     <th className="p-3 text-right">Actions</th>
                                                 </tr>
                                             </thead>
                                             <tbody className="divide-y divide-slate-100">
                                                 {filteredMembers.map((m, i) => (
                                                     <tr key={i} className="hover:bg-slate-50 group">
                                                         <td className="p-3 font-mono text-slate-500 text-xs">
                                                             {m.id ? `OWS-${m.id.slice(0,6).toUpperCase()}` : 'PENDING'}
                                                         </td>
                                                         <td className="p-3 font-bold text-slate-800">{m.name}</td>
                                                         <td className="p-3 text-slate-600">{m.phone}</td>
                                                         <td className="p-3">
                                                             <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 font-medium">
                                                                 {m.category || 'Volunteer'}
                                                             </span>
                                                         </td>
                                                         <td className="p-3 font-medium text-blue-600">{m.role}</td>
                                                         <td className="p-3 text-right flex justify-end gap-2">
                                                             <button 
                                                                onClick={() => handleAdminCertDownload(m)} 
                                                                disabled={certGeneratingId === m.id}
                                                                className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                                title="Download Certificate"
                                                             >
                                                                 {certGeneratingId === m.id ? '...' : <Download size={18}/>}
                                                             </button>
                                                             <button onClick={() => openEditMemberModal(m)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit size={18}/></button>
                                                             <button onClick={() => handleDelete('member', m.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18}/></button>
                                                         </td>
                                                     </tr>
                                                 ))}
                                                 {filteredMembers.length === 0 && (
                                                     <tr><td colSpan={6} className="p-6 text-center text-slate-400">No members found matching filters</td></tr>
                                                 )}
                                             </tbody>
                                         </table>
                                     </div>
                                 </div>
                             </div>
                        )}
                        
                        {activeTab === 'jobs' && (
                             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h2 className="text-lg font-bold text-slate-800">All Jobs</h2>
                                    <button onClick={openNewJobModal} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all"><Plus size={18}/> Post New Job</button>
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
                                <div className="divide-y divide-slate-100">
                                    {blogs.map(blog => (
                                        <div key={blog.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <img src={blog.imageUrl} alt={blog.title} className="w-16 h-12 object-cover rounded bg-slate-100" />
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-lg line-clamp-1">{blog.title}</h4>
                                                    <div className="text-sm text-slate-500 flex gap-2">
                                                        <span>{blog.author}</span>
                                                        <span>•</span>
                                                        <span>{blog.date ? new Date(blog.date.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 self-end md:self-center">
                                                <button onClick={() => openEditBlogModal(blog)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit size={20}/></button>
                                                <button onClick={() => handleDelete('blog', blog.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={20}/></button>
                                            </div>
                                        </div>
                                    ))}
                                    {blogs.length === 0 && <div className="p-8 text-center text-slate-400">No blog posts found.</div>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <h3 className="p-6 border-b font-bold">Registered Users</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50"><tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Joined</th></tr></thead>
                                        <tbody className="divide-y">
                                            {usersList.map(u => (
                                                <tr key={u.id} className="hover:bg-slate-50"><td className="p-4 flex items-center gap-3"><div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">{u.name?.charAt(0)}</div>{u.name}</td><td className="p-4">{u.email}</td><td className="p-4">{u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'ecosystem' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <h3 className="p-6 border-b font-bold">Ecosystem Applications</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50"><tr><th className="p-4">Name</th><th className="p-4">Batch</th><th className="p-4">Phone</th><th className="p-4">TrxID</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead>
                                        <tbody className="divide-y">
                                            {ecosystemApps.map(app => (
                                                <tr key={app.id} className="hover:bg-slate-50">
                                                    <td className="p-4 font-bold">{app.name}</td>
                                                    <td className="p-4 text-slate-500">{app.batch || '-'}</td>
                                                    <td className="p-4">{app.phone}</td>
                                                    <td className="p-4 font-mono">{app.transactionId}</td>
                                                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${app.status==='approved'?'bg-green-100 text-green-700':app.status==='rejected'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{app.status}</span></td>
                                                    <td className="p-4 flex gap-2">
                                                        {app.status === 'approved' ? (
                                                            <button onClick={() => openManageEcosystemModal(app)} className="bg-slate-900 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1 hover:bg-slate-700">
                                                                <Settings size={14}/> Manage Class
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button onClick={() => handleEcosystemStatus(app.id!, 'approved')} className="text-green-600 hover:bg-green-50 p-1 rounded"><CheckCircle size={18}/></button>
                                                                <button onClick={() => handleEcosystemStatus(app.id!, 'rejected')} className="text-red-600 hover:bg-red-50 p-1 rounded"><XCircle size={18}/></button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'community' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <h3 className="p-6 border-b font-bold">Affiliate & CA Requests</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50"><tr><th className="p-4">Name</th><th className="p-4">Type</th><th className="p-4">Phone</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead>
                                        <tbody className="divide-y">
                                            {affiliates.map(aff => (
                                                <tr key={aff.id} className="hover:bg-slate-50">
                                                    <td className="p-4 font-bold">{aff.name}</td>
                                                    <td className="p-4">{aff.type}</td>
                                                    <td className="p-4">{aff.phone}</td>
                                                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${aff.status==='approved'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{aff.status}</span></td>
                                                    <td className="p-4 flex gap-2">
                                                        {aff.status !== 'approved' && <button onClick={() => handleAffiliateStatus(aff.id!, 'approved', aff.name)} className="text-green-600 hover:bg-green-50 p-1 rounded"><CheckCircle size={18}/></button>}
                                                        <button onClick={() => handleAffiliateStatus(aff.id!, 'rejected')} className="text-red-600 hover:bg-red-50 p-1 rounded"><XCircle size={18}/></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <h3 className="p-6 border-b font-bold">Job Interest Tracking</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50"><tr><th className="p-4">User</th><th className="p-4">Job Title</th><th className="p-4">Time</th></tr></thead>
                                        <tbody className="divide-y">
                                            {jobInterests.map(ji => (
                                                <tr key={ji.id} className="hover:bg-slate-50">
                                                    <td className="p-4">{ji.userName} ({ji.userEmail})</td>
                                                    <td className="p-4 font-bold text-blue-600">{ji.jobTitle}</td>
                                                    <td className="p-4 text-slate-500">{ji.clickedAt ? new Date(ji.clickedAt.seconds * 1000).toLocaleString() : 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'courses' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b flex justify-between items-center">
                                    <h3 className="font-bold">Manage Courses</h3>
                                    <button onClick={openNewCourseModal} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Plus size={16}/> Add Course</button>
                                </div>
                                <div className="p-6 grid gap-4">
                                    {courses.map(c => (
                                        <div key={c.id} className="border p-4 rounded-xl flex justify-between items-center">
                                            <div><h4 className="font-bold">{c.title}</h4><p className="text-sm text-slate-500">{c.instructor}</p></div>
                                            <div className="flex gap-2">
                                                <button onClick={() => openEditCourseModal(c)} className="text-blue-600 p-2"><Edit size={18}/></button>
                                                <button onClick={() => handleDelete('course', c.id)} className="text-red-600 p-2"><Trash2 size={18}/></button>
                                            </div>
                                        </div>
                                    ))}
                                    {courses.length === 0 && <p className="text-slate-400 text-center">No courses found.</p>}
                                </div>
                            </div>
                        )}
                        
                    </>
                )}
            </div>

             {/* Modals */}
             {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-4xl my-8 relative shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Content' : 'Manage Content'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            
                            {/* Ecosystem Manage Modal */}
                            {modalType === 'ecosystem_manage' && manageStudent && (
                                <form onSubmit={handleSaveEcosystemStudent} className="space-y-6">
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                                        <p className="font-bold text-slate-800">{manageStudent.name}</p>
                                        <p className="text-sm text-slate-600">{manageStudent.email}</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Batch Name</label>
                                            <input required value={ecoFormData.batch} onChange={e => setEcoFormData({...ecoFormData, batch: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg outline-none" placeholder="e.g. Batch 10"/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Current Module (1-4)</label>
                                            <input type="number" min="1" max="4" value={ecoFormData.currentModule} onChange={e => setEcoFormData({...ecoFormData, currentModule: Number(e.target.value)})} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg outline-none"/>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Live Class Link (Google Meet)</label>
                                            <input value={ecoFormData.classLink} onChange={e => setEcoFormData({...ecoFormData, classLink: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg outline-none" placeholder="https://meet.google.com/..."/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Next Class Time</label>
                                            <input value={ecoFormData.classTime} onChange={e => setEcoFormData({...ecoFormData, classTime: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg outline-none" placeholder="e.g. Friday at 9:00 PM"/>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t border-slate-100 pt-4 mt-4">
                                        <h4 className="font-bold text-slate-800 mb-2">Add New Notice</h4>
                                        <div className="space-y-3">
                                            <input value={ecoFormData.noticeTitle} onChange={e => setEcoFormData({...ecoFormData, noticeTitle: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg outline-none" placeholder="Notice Title"/>
                                            <textarea rows={2} value={ecoFormData.noticeMessage} onChange={e => setEcoFormData({...ecoFormData, noticeMessage: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg outline-none" placeholder="Message content..."></textarea>
                                        </div>
                                    </div>

                                    <button disabled={formLoading} type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all">
                                        {formLoading ? 'Updating...' : 'Update Student Info'}
                                    </button>
                                </form>
                            )}

                            {modalType === 'member' && (
                                <form onSubmit={handleSaveMember} className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Name *</label>
                                            <input required value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Name"/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Phone *</label>
                                            <input required value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Phone"/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                                            <input value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Email"/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                                            <select 
                                                value={newMember.category || 'Volunteer'} 
                                                onChange={e => setNewMember({...newMember, category: e.target.value})} 
                                                className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                {MEMBER_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>
                                        
                                        <div className="col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Position (Role)</label>
                                            {['Campus Ambassador', 'Volunteer'].includes(newMember.category || '') ? (
                                                <div className="w-full px-4 py-3 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg italic">
                                                    Role will be automatically set to: <strong>{newMember.category}</strong>
                                                </div>
                                            ) : (
                                                <input required value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. President, Secretary"/>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <button type="submit" disabled={formLoading} className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors mt-4">
                                        {formLoading ? 'Saving...' : 'Save Member'}
                                    </button>
                                </form>
                            )}
                            
                            {modalType === 'job' && (
                                <form onSubmit={handleSaveJob} className="space-y-8">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">General Information</h4>
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div className="col-span-2"><label className="block text-sm font-bold text-slate-700 mb-1">Job Title *</label><input required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900" placeholder="e.g. Senior Software Engineer"/></div>
                                            <div><label className="block text-sm font-bold text-slate-700 mb-1">Company Name *</label><input required value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900" /></div>
                                            <div><label className="block text-sm font-bold text-slate-700 mb-1">No. of Vacancies</label><input value={newJob.vacancy} onChange={e => setNewJob({...newJob, vacancy: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900" placeholder="e.g. 02 / Not specific" /></div>
                                            <div><label className="block text-sm font-bold text-slate-700 mb-1">Application Deadline *</label><input type="date" required value={newJob.deadline} onChange={e => setNewJob({...newJob, deadline: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900" /></div>
                                        </div>
                                    </div>
                                    <div><h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Job Details</h4><div className="space-y-4"><div><label className="block text-sm font-bold text-slate-700 mb-1">Job Context</label><textarea rows={3} value={newJob.jobContext} onChange={e => setNewJob({...newJob, jobContext: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900" placeholder="Brief summary of the role..."></textarea></div><div><label className="block text-sm font-bold text-slate-700 mb-1">Job Responsibilities</label><textarea rows={6} value={newJob.responsibilities} onChange={e => setNewJob({...newJob, responsibilities: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-mono text-sm" placeholder="• Item 1&#10;• Item 2"></textarea></div></div></div>
                                    <div className="grid md:grid-cols-2 gap-5"><div><label className="block text-sm font-bold text-slate-700 mb-1">Employment Status</label><select value={newJob.employmentStatus} onChange={e => setNewJob({...newJob, employmentStatus: e.target.value as any})} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"><option value="Full-time">Full-time</option><option value="Part-time">Part-time</option><option value="Contractual">Contractual</option><option value="Internship">Internship</option><option value="Freelance">Freelance</option></select></div><div><label className="block text-sm font-bold text-slate-700 mb-1">Workplace</label><select value={newJob.workplace} onChange={e => setNewJob({...newJob, workplace: e.target.value as any})} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"><option value="Work at office">Work at office</option><option value="Work from home">Work from home</option><option value="Hybrid">Hybrid</option></select></div></div>
                                    <div><h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Requirements & Benefits</h4><div className="space-y-4"><div><label className="block text-sm font-bold text-slate-700 mb-1">Education</label><textarea rows={2} value={newJob.educationalRequirements} onChange={e => setNewJob({...newJob, educationalRequirements: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"></textarea></div><div><label className="block text-sm font-bold text-slate-700 mb-1">Salary</label><input required value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900" placeholder="e.g. Negotiable"/></div><div><label className="block text-sm font-bold text-slate-700 mb-1">Location</label><input required value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900" placeholder="e.g. Dhaka"/></div></div></div>
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100"><div><label className="block text-sm font-bold text-slate-700 mb-1">Apply Link / Email *</label><input required value={newJob.applyLink} onChange={e => setNewJob({...newJob, applyLink: e.target.value})} className="w-full px-4 py-3 bg-white border border-blue-300 rounded-lg text-blue-900 font-medium" placeholder="https://company.com/career OR hr@company.com" /></div></div>
                                    <div className="pt-4 border-t border-slate-100"><button disabled={formLoading} type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all text-lg shadow-lg">{formLoading ? 'Publishing...' : 'Publish Job'}</button></div>
                                </form>
                            )}
                            
                            {modalType === 'blog' && (
                                <form onSubmit={handleSaveBlog} className="space-y-6">
                                     <div className="space-y-4">
                                        <div><label className="block text-sm font-bold text-slate-700 mb-1">Blog Title *</label><input required value={newBlog.title} onChange={e => setNewBlog({...newBlog, title: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900" placeholder="Enter title..."/></div>
                                        <div><label className="block text-sm font-bold text-slate-700 mb-1">Cover Image URL</label><input required value={newBlog.imageUrl} onChange={e => setNewBlog({...newBlog, imageUrl: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900" placeholder="https://..."/></div>
                                        <div><label className="block text-sm font-bold text-slate-700 mb-1">Author Name</label><input required value={newBlog.author} onChange={e => setNewBlog({...newBlog, author: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"/></div>
                                        <div><label className="block text-sm font-bold text-slate-700 mb-1">Short Excerpt (Preview Text)</label><textarea required rows={3} value={newBlog.excerpt} onChange={e => setNewBlog({...newBlog, excerpt: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"></textarea></div>
                                        <div><label className="block text-sm font-bold text-slate-700 mb-1">Full Content</label><textarea required rows={10} value={newBlog.content} onChange={e => setNewBlog({...newBlog, content: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-mono text-sm" placeholder="Write full article here..."></textarea></div>
                                     </div>
                                     <button disabled={formLoading} type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all text-lg shadow-lg">{formLoading ? 'Saving...' : 'Publish Blog'}</button>
                                </form>
                            )}
                            
                            {modalType === 'course' && (
                                <form onSubmit={handleSaveCourse} className="space-y-4">
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Course Title</label><input required value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Instructor</label><input required value={newCourse.instructor} onChange={e => setNewCourse({...newCourse, instructor: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Price</label><input required value={newCourse.price} onChange={e => setNewCourse({...newCourse, price: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                    <button disabled={formLoading} type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">{formLoading ? 'Saving...' : 'Save Course'}</button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Certificate Render Area for Admin */}
            <div style={{ position: 'absolute', top: -9999, left: -9999 }}>
                {certMember && (
                    <div ref={adminCertRef} className="w-[1123px] h-[794px] relative bg-white overflow-hidden text-slate-900 font-['Hind_Siliguri']">
                        {/* Copying strict certificate layout from Community.tsx to ensure match */}
                        <div className="absolute inset-0 bg-white"></div>
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        <div className="absolute inset-6 border-[8px] border-[#1e3a8a] z-10"></div>
                        <div className="absolute inset-9 border-[2px] border-[#DAA520] z-10"></div>

                        <div className="relative z-20 h-full w-full flex flex-col items-center pt-24 pb-12 px-20 text-center">
                            <img src="https://iili.io/f3k62rG.md.png" alt="Logo" className="h-20 object-contain mb-6" />

                            <h1 className="text-5xl font-serif font-bold text-[#1e3a8a] tracking-wide mb-2 uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
                                Certificate of Recognition
                            </h1>
                            <p className="text-lg text-[#DAA520] font-medium tracking-[0.3em] uppercase mb-10">
                                Official Membership
                            </p>

                            <p className="text-xl text-slate-500 font-serif italic mb-4">This certificate is proudly presented to</p>

                            <div className="w-full max-w-3xl border-b-2 border-slate-300 pb-4 mb-6">
                                <h2 className="text-5xl font-bold text-slate-900 capitalize" style={{ fontFamily: 'Hind Siliguri, sans-serif' }}>
                                    {certMember.nameForCert}
                                </h2>
                            </div>

                            <p className="text-xl text-slate-600 leading-relaxed max-w-4xl mb-8">
                                For successfully securing a verified position as a <span className="font-bold text-[#1e3a8a]">Community Member</span> at 
                                One Way School. We recognize your dedication towards personal development and leadership.
                            </p>

                            <div className="flex justify-center gap-16 mb-16 w-full px-20 items-start">
                                <div className="text-center">
                                    <p className="text-slate-400 text-sm uppercase tracking-wider font-bold mb-1">Membership ID</p>
                                    <p className="text-xl font-mono font-bold text-slate-800">OWS-{certMember.id ? certMember.id.slice(0,6).toUpperCase() : 'PENDING'}</p>
                                </div>
                                <div className="text-center border-l border-r border-slate-200 px-16 min-w-[300px]">
                                    <p className="text-slate-400 text-sm uppercase tracking-wider font-bold mb-2">Role / Position</p>
                                    <div className="text-xl">
                                        {getCertDisplayRole(certMember)}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-400 text-sm uppercase tracking-wider font-bold mb-1">Date of Issue</p>
                                    <p className="text-xl font-bold text-slate-800">{certMember.issueDate}</p>
                                </div>
                            </div>

                            <div className="absolute bottom-16 left-0 w-full px-28 flex justify-between items-end">
                                <div className="flex flex-col items-center w-56">
                                    <img src="https://iili.io/KB8jgte.md.png" alt="Sig" className="h-14 object-contain mb-[-15px] z-10 filter grayscale brightness-50" />
                                    <div className="w-full h-[1px] bg-slate-400 mb-2"></div>
                                    <p className="font-bold text-slate-800 text-base">Sifatur Rahman</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Founder</p>
                                </div>
                                <div className="flex flex-col items-center w-56">
                                    <img src="https://iili.io/KB8j4ou.md.png" alt="Sig" className="h-14 object-contain mb-[-15px] z-10 filter grayscale brightness-50" />
                                    <div className="w-full h-[1px] bg-slate-400 mb-2"></div>
                                    <p className="font-bold text-slate-800 text-base">Faria Hoque</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Co-Founder</p>
                                </div>
                                <div className="flex flex-col items-center w-56">
                                    <img src="https://iili.io/KTuZeGp.png" alt="Sig" className="h-14 object-contain mb-[-15px] z-10 filter grayscale brightness-50" />
                                    <div className="w-full h-[1px] bg-slate-400 mb-2"></div>
                                    <p className="font-bold text-slate-800 text-base">Dipta Halder</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Co-Founder</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;