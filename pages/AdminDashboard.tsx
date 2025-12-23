import React, { useEffect, useState, useRef } from 'react';
import { 
    getLeads, getAffiliates, getUsers, getJobs, saveJob, updateJob, deleteJob, 
    getBlogPosts, saveBlogPost, updateBlogPost, deleteBlogPost, 
    getCourses, saveCourse, updateCourse, deleteCourse, updateAffiliateStatus,
    getJobInterests, getEcosystemApplications, updateEcosystemAppStatus, updateEcosystemStudent,
    getCommunityMembers, saveCommunityMember, deleteCommunityMember, bulkSaveCommunityMembers,
    logout, auth, updateData, createInstructor, getInstructors, deleteUserDoc
} from '../services/firebase';
import { User, Lead, Affiliate, Job, BlogPost, Course, JobInterest, EcosystemApplication, CommunityMember, Instructor } from '../types';
import { useNavigate } from 'react-router-dom';
import { 
    Users, LayoutDashboard, Share2, Briefcase, BookOpen, 
    GraduationCap, Plus, Trash2, X, ChevronLeft, LogOut, Search, Globe, Edit, CheckCircle, XCircle, MousePointerClick, CreditCard, Database, Download, Upload, Filter, Settings, UserPlus, FileSpreadsheet, Award, UserCheck, Shield
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
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'community' | 'jobs' | 'blogs' | 'courses' | 'ecosystem' | 'analytics' | 'database' | 'instructors'>('overview');
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
    const [instructors, setInstructors] = useState<Instructor[]>([]);

    // Forms State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'job' | 'blog' | 'course' | 'member' | 'ecosystem_manage' | 'instructor' | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Instructor Form
    const [newInstructor, setNewInstructor] = useState({ name: '', email: '', password: '', phone: '' });

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
    const [userSearch, setUserSearch] = useState(''); // New State for User Tab Search
    const [certGeneratingId, setCertGeneratingId] = useState<string | null>(null);
    const [certMember, setCertMember] = useState<any>(null); // For hidden certificate render
    const adminCertRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    useEffect(() => {
        if (user && ADMIN_EMAILS.includes(user.email || '')) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [l, a, u, j, b, c, ji, ea, cm, ins] = await Promise.all([
                getLeads(), getAffiliates(), getUsers(), getJobs(), getBlogPosts(), getCourses(),
                getJobInterests(), getEcosystemApplications(), getCommunityMembers(), getInstructors()
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
            setInstructors(ins as Instructor[]);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    // --- Handlers ---
    const openNewInstructorModal = () => { setNewInstructor({ name: '', email: '', password: '', phone: '' }); setModalType('instructor'); setIsModalOpen(true); };

    const handleSaveInstructor = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            await createInstructor({
                name: newInstructor.name,
                email: newInstructor.email,
                phone: newInstructor.phone,
            }, newInstructor.password);
            
            alert("Instructor info saved! (Note: Auth user creation requires Cloud Functions in production)");
            setIsModalOpen(false);
            fetchData();
        } catch (error: any) {
            alert("Error: " + error.message);
        }
        setFormLoading(false);
    };

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
        if (!currentUser) return;

        if (!newMember.name || !newMember.phone) {
            alert("Name and Phone are required.");
            return;
        }

        setFormLoading(true);
        try {
            const memberData = {
                name: newMember.name,
                phone: newMember.phone,
                email: newMember.email || '',
                category: newMember.category,
                role: newMember.role || newMember.category || 'Member',
                userId: currentUser.uid, 
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
            if(ecoFormData.noticeTitle && ecoFormData.noticeMessage) {
                const newNotice = { title: ecoFormData.noticeTitle, message: ecoFormData.noticeMessage, date: new Date() };
                const existingNotices = manageStudent.notices || [];
                updatePayload.notices = [newNotice, ...existingNotices];
            }
            await updateEcosystemStudent(manageStudent.id, updatePayload);
            setIsModalOpen(false);
            fetchData();
            alert("Student Updated!");
        } catch(e) { alert("Update Failed"); }
        setFormLoading(false);
    }

    const handleDelete = async (type: 'job' | 'blog' | 'course' | 'member' | 'user', id?: string) => {
        if (!id || !window.confirm("Are you sure? This cannot be undone.")) return;
        try {
            if (type === 'job') await deleteJob(id);
            if (type === 'blog') await deleteBlogPost(id);
            if (type === 'course') await deleteCourse(id);
            if (type === 'member') await deleteCommunityMember(id);
            if (type === 'user') await deleteUserDoc(id);
            await fetchData();
        } catch (error) { alert("Delete failed"); }
    };

    const handleEcosystemStatus = async (id: string, status: string) => {
        try { await updateEcosystemAppStatus(id, status); fetchData(); } catch(e) { alert("Failed"); }
    };

    const handleAffiliateStatus = async (id: string, status: string, name?: string) => {
        const referralCode = status === 'approved' && name ? name.split(' ')[0].toUpperCase() + Math.floor(100 + Math.random() * 900) : undefined;
        try { await updateAffiliateStatus(id, status, referralCode); fetchData(); } catch(e) { alert("Failed"); }
    };

    // --- CSV & Certificate Features ---
    const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n');
            const newMembers: any[] = [];
            
            // Expected format: Name,Phone,Email,Role,Category
            for (let i = 1; i < lines.length; i++) { // Skip header
                const line = lines[i].trim();
                if (!line) continue;
                const cols = line.split(','); // Simple split, consider advanced regex for quoted CSVs if needed
                if (cols.length >= 2) {
                     newMembers.push({
                        name: cols[0]?.trim(),
                        phone: cols[1]?.trim(),
                        email: cols[2]?.trim() || '',
                        role: cols[3]?.trim() || 'Member',
                        category: cols[4]?.trim() || 'Volunteer',
                        userId: user?.uid,
                        createdAt: new Date()
                    });
                }
            }

            if (newMembers.length > 0) {
                setLoading(true);
                try {
                    await bulkSaveCommunityMembers(newMembers);
                    alert(`${newMembers.length} members imported successfully!`);
                    fetchData();
                } catch (e) { 
                    console.error(e);
                    alert("Import failed. Check console."); 
                }
                setLoading(false);
            } else {
                alert("No valid data found in CSV.");
            }
        };
        reader.readAsText(file);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const downloadCsv = () => {
        const headers = ["Name,Phone,Email,Role,Category,Joined Date"];
        const rows = communityMembers.map(m => 
            `"${m.name || ''}","${m.phone || ''}","${m.email || ''}","${m.role || ''}","${m.category || ''}","${m.createdAt ? new Date(m.createdAt.seconds * 1000).toLocaleDateString() : ''}"`
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "ows_community_members.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadCertificate = async (member: CommunityMember) => {
        if(!member.id) return;
        setCertMember({
            ...member,
            nameForCert: member.name,
            issueDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        });
        setCertGeneratingId(member.id);
        
        // Wait for render
        setTimeout(async () => {
            if (adminCertRef.current) {
                try {
                    const canvas = await html2canvas(adminCertRef.current, { 
                        scale: 2,
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff',
                        width: 1123,
                        height: 794
                    });
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('l', 'px', [1123, 794]);
                    pdf.addImage(imgData, 'PNG', 0, 0, 1123, 794);
                    pdf.save(`Certificate_${member.name}.pdf`);
                } catch (e) { console.error(e); alert("Failed to generate"); }
            }
            setCertGeneratingId(null);
            setCertMember(null);
        }, 1500);
    };

    const filteredMembers = communityMembers.filter(m => {
        const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;
        const matchesSearch = memberSearch === '' || 
            m.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
            m.phone.includes(memberSearch);
        return matchesCategory && matchesSearch;
    });

    // --- Filter Users List ---
    const filteredUsers = usersList.filter(u => 
        (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.phone || '').includes(userSearch)
    ).sort((a, b) => {
        // Sort logic: Admin > Instructor > User, then by date
        const getRank = (u: any) => {
            if (ADMIN_EMAILS.includes(u.email)) return 3;
            if (u.role === 'instructor') return 2;
            return 1;
        };
        return getRank(b) - getRank(a);
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
                        { id: 'community', icon: Share2, label: 'Community Lead' },
                        { id: 'instructors', icon: UserPlus, label: 'Instructors' },
                        { id: 'jobs', icon: Briefcase, label: 'Manage Jobs' },
                        { id: 'analytics', icon: MousePointerClick, label: 'Job Tracking' },
                        { id: 'ecosystem', icon: CreditCard, label: 'Ecosystem Students' },
                        { id: 'blogs', icon: BookOpen, label: 'Manage Blog' },
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
                {loading ? <div className="text-center py-20 text-slate-500">Loading data...</div> : (
                    <>
                        {activeTab === 'overview' && (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><h3 className="text-slate-500 font-medium mb-2 text-sm">Total Users</h3><p className="text-4xl font-bold text-slate-800">{usersList.length}</p></div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><h3 className="text-slate-500 font-medium mb-2 text-sm">Community Members</h3><p className="text-4xl font-bold text-blue-600">{communityMembers.length}</p></div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><h3 className="text-slate-500 font-medium mb-2 text-sm">Active Jobs</h3><p className="text-4xl font-bold text-orange-600">{jobs.length}</p></div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><h3 className="text-slate-500 font-medium mb-2 text-sm">Ecosystem Students</h3><p className="text-4xl font-bold text-green-600">{ecosystemApps.length}</p></div>
                             </div>
                        )}

                        {/* --- USER LIST TAB --- */}
                        {activeTab === 'users' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-600 p-2 rounded-lg text-white"><Users size={24}/></div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-800">User Management</h2>
                                            <p className="text-xs text-slate-500">Total Registered: {usersList.length}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="relative w-full md:w-auto">
                                        <Search className="absolute left-3 top-3 text-slate-400" size={16}/>
                                        <input 
                                            placeholder="Search name, email..." 
                                            value={userSearch}
                                            onChange={e => setUserSearch(e.target.value)}
                                            className="w-full md:w-64 pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="p-4 text-slate-500 font-medium">User Profile</th>
                                                <th className="p-4 text-slate-500 font-medium">Role</th>
                                                <th className="p-4 text-slate-500 font-medium">Contact</th>
                                                <th className="p-4 text-slate-500 font-medium">Last Login</th>
                                                <th className="p-4 text-slate-500 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredUsers.map(u => (
                                                <tr key={u.id} className="hover:bg-slate-50">
                                                    <td className="p-4 flex items-center gap-3">
                                                        <img 
                                                            src={u.photoURL || 'https://via.placeholder.com/40'} 
                                                            alt={u.name} 
                                                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                                        />
                                                        <div>
                                                            <div className="font-bold text-slate-800">{u.name || 'Unknown User'}</div>
                                                            <div className="text-xs text-slate-500">{u.email}</div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        {ADMIN_EMAILS.includes(u.email) ? (
                                                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><Shield size={12}/> Admin</span>
                                                        ) : u.role === 'instructor' ? (
                                                            <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs font-bold w-fit">Instructor</span>
                                                        ) : (
                                                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold w-fit">User</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-slate-700">{u.phone || 'N/A'}</div>
                                                        <div className="text-xs text-slate-400">{u.address || u.currentAddress || ''}</div>
                                                    </td>
                                                    <td className="p-4 text-slate-500 text-xs">
                                                        {u.lastLogin ? new Date(u.lastLogin.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        {!ADMIN_EMAILS.includes(u.email) && (
                                                            <button 
                                                                onClick={() => handleDelete('user', u.id)} 
                                                                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                                                                title="Delete User Data"
                                                            >
                                                                <Trash2 size={18}/>
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredUsers.length === 0 && (
                                                <tr><td colSpan={5} className="p-8 text-center text-slate-400">No users found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'jobs' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h2 className="text-lg font-bold text-slate-800">Posted Jobs</h2>
                                    <button onClick={openNewJobModal} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"><Plus size={18}/> Post New Job</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50"><tr><th className="p-4">Title</th><th className="p-4">Company</th><th className="p-4">Deadline</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead>
                                        <tbody className="divide-y">
                                            {jobs.map(job => (
                                                <tr key={job.id} className="hover:bg-slate-50">
                                                    <td className="p-4 font-bold">{job.title}</td>
                                                    <td className="p-4">{job.company}</td>
                                                    <td className="p-4 text-red-500">{job.deadline}</td>
                                                    <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Active</span></td>
                                                    <td className="p-4 flex gap-2">
                                                        <button onClick={() => openEditJobModal(job)} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Edit size={16}/></button>
                                                        <button onClick={() => handleDelete('job', job.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'blogs' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h2 className="text-lg font-bold text-slate-800">Blog Posts</h2>
                                    <button onClick={openNewBlogModal} className="bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all"><Plus size={18}/> Write Blog</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50"><tr><th className="p-4">Title</th><th className="p-4">Author</th><th className="p-4">Date</th><th className="p-4">Actions</th></tr></thead>
                                        <tbody className="divide-y">
                                            {blogs.map(blog => (
                                                <tr key={blog.id} className="hover:bg-slate-50">
                                                    <td className="p-4 font-bold max-w-xs truncate">{blog.title}</td>
                                                    <td className="p-4">{blog.author}</td>
                                                    <td className="p-4 text-slate-500">{blog.date ? new Date(blog.date.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                                                    <td className="p-4 flex gap-2">
                                                        <button onClick={() => openEditBlogModal(blog)} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Edit size={16}/></button>
                                                        <button onClick={() => handleDelete('blog', blog.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* --- COMMUNITY DATABASE SECTION --- */}
                         {activeTab === 'database' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-600 p-2 rounded-lg text-white"><Database size={24}/></div>
                                            <div>
                                                <h2 className="text-lg font-bold text-slate-800">Community Database</h2>
                                                <p className="text-xs text-slate-500">{communityMembers.length} Registered Members</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {/* Hidden Input for CSV */}
                                            <input type="file" ref={fileInputRef} onChange={handleCsvUpload} accept=".csv" className="hidden"/>
                                            <button onClick={() => fileInputRef.current?.click()} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-700 shadow-sm"><FileSpreadsheet size={16}/> Bulk Import</button>
                                            <button onClick={downloadCsv} className="bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-700 shadow-sm"><Download size={16}/> CSV Export</button>
                                            <button onClick={openNewMemberModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-sm"><Plus size={16}/> Add Member</button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="p-2.5 border border-slate-200 rounded-lg bg-white text-sm outline-none focus:border-blue-500">
                                            <option value="All">All Categories</option>
                                            {MEMBER_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-3 text-slate-400" size={16}/>
                                            <input 
                                                placeholder="Search by Name, Phone or ID..." 
                                                value={memberSearch}
                                                onChange={e => setMemberSearch(e.target.value)}
                                                className="w-full p-2.5 pl-10 border border-slate-200 rounded-lg bg-white text-sm outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="p-4 text-slate-500 font-medium">Member Info</th>
                                                <th className="p-4 text-slate-500 font-medium">Contact</th>
                                                <th className="p-4 text-slate-500 font-medium">Position</th>
                                                <th className="p-4 text-slate-500 font-medium">Joined</th>
                                                <th className="p-4 text-slate-500 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredMembers.map(m => (
                                                <tr key={m.id} className="hover:bg-slate-50 group">
                                                    <td className="p-4">
                                                        <div className="font-bold text-slate-800">{m.name}</div>
                                                        <div className="text-xs text-slate-400">ID: {m.id?.substring(0,6)}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-slate-700">{m.phone}</div>
                                                        <div className="text-xs text-slate-400">{m.email}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-slate-700 font-medium">{m.role}</div>
                                                        <span className="inline-block bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold mt-1 uppercase tracking-wide">{m.category}</span>
                                                    </td>
                                                    <td className="p-4 text-slate-500 text-xs">
                                                        {m.createdAt ? new Date(m.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="p-4 flex gap-2 justify-end">
                                                        <button 
                                                            onClick={() => handleDownloadCertificate(m)} 
                                                            disabled={certGeneratingId === m.id}
                                                            className="text-orange-600 hover:bg-orange-50 p-2 rounded-lg transition-colors disabled:opacity-50" 
                                                            title="Download Certificate"
                                                        >
                                                            {certGeneratingId === m.id ? <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div> : <Award size={18}/>}
                                                        </button>
                                                        <button onClick={() => openEditMemberModal(m)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Edit"><Edit size={18}/></button>
                                                        <button onClick={() => handleDelete('member', m.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Delete"><Trash2 size={18}/></button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredMembers.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-slate-400">No members found matching filters.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* --- COMMUNITY LEADS (Affiliates) SECTION --- */}
                        {activeTab === 'community' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-purple-600 p-2 rounded-lg text-white"><Share2 size={24}/></div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-800">Community Leads</h2>
                                            <p className="text-xs text-slate-500">Affiliate & Ambassador Applications</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="p-4 text-slate-500 font-medium">Applicant</th>
                                                <th className="p-4 text-slate-500 font-medium">Type</th>
                                                <th className="p-4 text-slate-500 font-medium">Details</th>
                                                <th className="p-4 text-slate-500 font-medium">Stats</th>
                                                <th className="p-4 text-slate-500 font-medium">Status</th>
                                                <th className="p-4 text-slate-500 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {affiliates.map(lead => (
                                                <tr key={lead.id} className="hover:bg-slate-50">
                                                    <td className="p-4">
                                                        <div className="font-bold text-slate-800">{lead.name}</div>
                                                        <div className="text-xs text-slate-500">{lead.phone}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${lead.type === 'Campus Ambassador' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{lead.type}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-xs text-slate-600">{lead.institution || 'N/A'}</div>
                                                        <div className="text-xs text-slate-400">{lead.email}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-xs font-bold text-slate-700">Earned: ৳{lead.totalEarnings}</div>
                                                        {lead.referralCode && <div className="text-xs text-green-600 font-mono">Ref: {lead.referralCode}</div>}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${lead.status==='approved'?'bg-green-100 text-green-700':lead.status==='rejected'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{lead.status}</span>
                                                    </td>
                                                    <td className="p-4 flex gap-2 justify-end">
                                                        {lead.status === 'pending' && (
                                                            <>
                                                                <button onClick={() => handleAffiliateStatus(lead.id!, 'approved', lead.name)} className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors" title="Approve"><CheckCircle size={18}/></button>
                                                                <button onClick={() => handleAffiliateStatus(lead.id!, 'rejected')} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Reject"><XCircle size={18}/></button>
                                                            </>
                                                        )}
                                                        <button onClick={() => {}} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg"><Settings size={18}/></button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {affiliates.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-slate-400">No leads found.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'instructors' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h2 className="text-lg font-bold text-slate-800">Instructors List</h2>
                                    <button onClick={openNewInstructorModal} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all"><Plus size={18}/> Create Instructor</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50"><tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Phone</th><th className="p-4">Joined</th></tr></thead>
                                        <tbody className="divide-y">
                                            {instructors.map((ins) => (
                                                <tr key={ins.id} className="hover:bg-slate-50">
                                                    <td className="p-4 font-bold">{ins.name}</td>
                                                    <td className="p-4">{ins.email}</td>
                                                    <td className="p-4">{ins.phone}</td>
                                                    <td className="p-4 text-slate-500">{ins.createdAt ? new Date(ins.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}</td>
                                                </tr>
                                            ))}
                                            {instructors.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-slate-400">No instructors created yet.</td></tr>}
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
                                                                <Settings size={14}/> Manage
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
                    </>
                )}
            </div>

            {/* Hidden Certificate Template for Admin Generation */}
            <div style={{ position: 'absolute', top: -9999, left: -9999 }}>
                {certMember && (
                    <div ref={adminCertRef} className="w-[1123px] h-[794px] relative bg-white overflow-hidden text-slate-900 font-['Hind_Siliguri'] flex flex-col justify-between">
                        {/* --- Background Elements --- */}
                        <div className="absolute inset-0 bg-white z-0"></div>
                        <div className="absolute inset-0 opacity-[0.03] z-0" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        <div className="absolute inset-6 border-[8px] border-[#1e3a8a] z-10"></div>
                        <div className="absolute inset-9 border-[2px] border-[#DAA520] z-10"></div>
                        
                        {/* --- Watermark --- */}
                        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                             <img src="https://iili.io/f3k62rG.md.png" className="w-[600px] h-auto opacity-[0.06] grayscale blur-[0.5px]" alt="Watermark" />
                        </div>

                        {/* --- Header --- */}
                        <div className="relative z-20 w-full flex flex-col items-center pt-16 px-20 text-center">
                            <img src="https://iili.io/f3k62rG.md.png" alt="Logo" className="h-24 object-contain mb-2" />
                            <h1 className="text-6xl font-serif font-bold text-[#1e3a8a] tracking-wide mb-2 uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
                                Certificate of Recognition
                            </h1>
                            <p className="text-2xl text-[#DAA520] font-medium tracking-[0.4em] uppercase">
                                Official Membership
                            </p>
                        </div>

                        {/* --- Name --- */}
                        <div className="relative z-20 w-full flex flex-col items-center justify-center text-center px-24 -mt-2">
                            <p className="text-2xl text-slate-500 font-serif italic mb-2">This certificate is proudly presented to</p>
                            <div className="w-full max-w-5xl border-b-2 border-slate-300 pb-2 mb-6">
                                <h2 className="text-7xl font-bold text-slate-900 capitalize leading-tight" style={{ fontFamily: 'Hind Siliguri, sans-serif' }}>
                                    {certMember.nameForCert}
                                </h2>
                            </div>
                            <p className="text-2xl text-slate-600 leading-relaxed max-w-5xl font-light">
                                For successfully securing a verified position as a <span className="font-bold text-[#1e3a8a]">Community Member</span> at 
                                One Way School. We recognize your dedication towards personal development, leadership, and community service.
                            </p>
                        </div>

                        {/* --- Info --- */}
                        <div className="relative z-20 flex justify-center gap-16 w-full px-20 items-start mb-6">
                            <div className="text-center">
                                <p className="text-slate-400 text-sm uppercase tracking-wider font-bold mb-1">Membership ID</p>
                                <p className="text-2xl font-mono font-bold text-slate-800">OWS-{certMember.id ? certMember.id.slice(0,6).toUpperCase() : 'N/A'}</p>
                            </div>
                            <div className="text-center border-l border-r border-slate-200 px-16 min-w-[300px]">
                                <p className="text-slate-400 text-sm uppercase tracking-wider font-bold mb-2">Role / Position</p>
                                <span className="text-[#1e3a8a] font-bold text-3xl">{certMember.role}</span>
                            </div>
                            <div className="text-center">
                                <p className="text-slate-400 text-sm uppercase tracking-wider font-bold mb-1">Date of Issue</p>
                                <p className="text-2xl font-bold text-slate-800">{certMember.issueDate}</p>
                            </div>
                        </div>

                        {/* --- Footer --- */}
                        <div className="relative z-20 w-full px-28 pb-24 flex justify-between items-end">
                            <div className="flex flex-col items-center w-64">
                                <img src="https://iili.io/KB8jgte.md.png" alt="Sig" className="h-16 object-contain mb-4 z-10 filter grayscale brightness-50" />
                                <div className="w-full h-[2px] bg-slate-300 mb-2"></div>
                                <p className="font-bold text-slate-800 text-lg">Sifatur Rahman</p>
                                <p className="text-sm text-slate-500 uppercase tracking-wider">Founder</p>
                            </div>
                            <div className="flex flex-col items-center w-64">
                                <img src="https://iili.io/KB8j4ou.md.png" alt="Sig" className="h-16 object-contain mb-4 z-10 filter grayscale brightness-50" />
                                <div className="w-full h-[2px] bg-slate-300 mb-2"></div>
                                <p className="font-bold text-slate-800 text-lg">Faria Hoque</p>
                                <p className="text-sm text-slate-500 uppercase tracking-wider">Co-Founder</p>
                            </div>
                            <div className="flex flex-col items-center w-64">
                                <img src="https://iili.io/KTuZeGp.png" alt="Sig" className="h-16 object-contain mb-4 z-10 filter grayscale brightness-50" />
                                <div className="w-full h-[2px] bg-slate-300 mb-2"></div>
                                <p className="font-bold text-slate-800 text-lg">Dipta Halder</p>
                                <p className="text-sm text-slate-500 uppercase tracking-wider">Co-Founder</p>
                            </div>
                        </div>
                    </div>
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
                            
                             {/* Job Modal */}
                             {modalType === 'job' && (
                                <form onSubmit={handleSaveJob} className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-bold text-slate-700 mb-1">Job Title</label><input required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
                                        <div><label className="block text-sm font-bold text-slate-700 mb-1">Company</label><input required value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
                                        <div><label className="block text-sm font-bold text-slate-700 mb-1">Deadline</label><input type="date" required value={newJob.deadline} onChange={e => setNewJob({...newJob, deadline: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
                                        <div><label className="block text-sm font-bold text-slate-700 mb-1">Salary</label><input required value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. 25k - 35k"/></div>
                                        <div><label className="block text-sm font-bold text-slate-700 mb-1">Location</label><input required value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
                                        <div><label className="block text-sm font-bold text-slate-700 mb-1">Employment Status</label>
                                            <select value={newJob.employmentStatus} onChange={e => setNewJob({...newJob, employmentStatus: e.target.value as any})} className="w-full px-4 py-2 border rounded-lg bg-white">
                                                <option>Full-time</option><option>Part-time</option><option>Contractual</option><option>Internship</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Apply Link/Email</label><input required value={newJob.applyLink} onChange={e => setNewJob({...newJob, applyLink: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="https://... or mailto:..."/></div>
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Responsibilities</label><textarea rows={3} value={newJob.responsibilities} onChange={e => setNewJob({...newJob, responsibilities: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Requirements</label><textarea rows={3} value={newJob.educationalRequirements} onChange={e => setNewJob({...newJob, educationalRequirements: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
                                    <button disabled={formLoading} type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">{formLoading ? 'Saving...' : 'Save Job'}</button>
                                </form>
                            )}

                             {/* Blog Modal */}
                             {modalType === 'blog' && (
                                <form onSubmit={handleSaveBlog} className="space-y-4">
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Title</label><input required value={newBlog.title} onChange={e => setNewBlog({...newBlog, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Excerpt (Short Description)</label><textarea required rows={2} value={newBlog.excerpt} onChange={e => setNewBlog({...newBlog, excerpt: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Image URL</label><input required value={newBlog.imageUrl} onChange={e => setNewBlog({...newBlog, imageUrl: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Full Content</label><textarea required rows={6} value={newBlog.content} onChange={e => setNewBlog({...newBlog, content: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
                                    <div className="flex gap-4">
                                        <div className="flex-1"><label className="block text-sm font-bold text-slate-700 mb-1">Author</label><input value={newBlog.author} onChange={e => setNewBlog({...newBlog, author: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
                                    </div>
                                    <button disabled={formLoading} type="submit" className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700">{formLoading ? 'Saving...' : 'Publish Blog'}</button>
                                </form>
                            )}

                             {/* Member Modal */}
                             {modalType === 'member' && (
                                <form onSubmit={handleSaveMember} className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-bold text-slate-700 mb-1">Name</label><input required value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
                                        <div><label className="block text-sm font-bold text-slate-700 mb-1">Phone</label><input required value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
                                        <div><label className="block text-sm font-bold text-slate-700 mb-1">Email</label><input value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                                            <select value={newMember.category} onChange={e => setNewMember({...newMember, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white">
                                                {MEMBER_CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Role / Position</label><input required value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. General Member, President"/></div>
                                    <button disabled={formLoading} type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800">{formLoading ? 'Saving...' : 'Save Member'}</button>
                                </form>
                            )}

                            {/* Create Instructor Modal */}
                            {modalType === 'instructor' && (
                                <form onSubmit={handleSaveInstructor} className="space-y-4">
                                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700 mb-4">
                                        This will create a profile for the instructor. They can use these credentials to log in.
                                    </div>
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Name</label><input required value={newInstructor.name} onChange={e => setNewInstructor({...newInstructor, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Email (Username)</label><input required type="email" value={newInstructor.email} onChange={e => setNewInstructor({...newInstructor, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Password</label><input required type="password" value={newInstructor.password} onChange={e => setNewInstructor({...newInstructor, password: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Phone</label><input value={newInstructor.phone} onChange={e => setNewInstructor({...newInstructor, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
                                    
                                    <button disabled={formLoading} type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800">
                                        {formLoading ? 'Creating...' : 'Create Instructor'}
                                    </button>
                                </form>
                            )}

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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;