import React, { useEffect, useState, useRef } from 'react';
import { 
    getLeads, getAffiliates, getUsers, getJobs, saveJob, updateJob, deleteJob, 
    getBlogPosts, saveBlogPost, updateBlogPost, deleteBlogPost, 
    getCourses, saveCourse, updateCourse, deleteCourse, updateAffiliateStatus,
    getJobInterests, getEcosystemApplications, updateEcosystemAppStatus, updateEcosystemStudent,
    getCommunityMembers, saveCommunityMember, deleteCommunityMember, bulkSaveCommunityMembers,
    logout, auth, updateData, createInstructor, getInstructors, deleteUserDoc,
    updateBatchClassDetails, sendBatchNotice, saveClassSession, getClassSessions, deleteClassSession, bulkSaveJobs
} from '../services/firebase';
import { GoogleGenAI } from "@google/genai"; // Import Google GenAI
import { User, Lead, Affiliate, Job, BlogPost, Course, JobInterest, EcosystemApplication, CommunityMember, Instructor, ClassSession } from '../types';
import { useNavigate } from 'react-router-dom';
import { 
    Users, LayoutDashboard, Share2, Briefcase, BookOpen, 
    GraduationCap, Plus, Trash2, X, ChevronLeft, LogOut, Search, Globe, Edit, CheckCircle, XCircle, MousePointerClick, CreditCard, Database, Download, Upload, Filter, Settings, UserPlus, FileSpreadsheet, Award, UserCheck, Shield, Layers, Bell, Video, Calendar, Eye, Activity, Clock, ChevronRight, Sparkles, Zap
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
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    
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
    const [classSessions, setClassSessions] = useState<ClassSession[]>([]);

    // Ecosystem Sub-states
    const [ecoSubTab, setEcoSubTab] = useState<'list' | 'classes' | 'notice'>('list');
    const [ecoFilterBatch, setEcoFilterBatch] = useState('All');
    
    // Ecosystem Bulk Forms
    const [classSessionForm, setClassSessionForm] = useState<ClassSession>({ batch: '', topic: '', mentorName: '', date: '', time: '', link: '' });
    const [noticeForm, setNoticeForm] = useState({ targetBatch: 'All', title: '', message: '' });

    // Forms State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'job' | 'blog' | 'course' | 'member' | 'ecosystem_student_edit' | 'instructor' | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Smart Job Parse State
    const [rawJobText, setRawJobText] = useState('');
    const [isParsing, setIsParsing] = useState(false);

    // Instructor Form
    const [newInstructor, setNewInstructor] = useState({ name: '', email: '', password: '', phone: '' });

    // Ecosystem Management State (Individual)
    const [manageStudent, setManageStudent] = useState<EcosystemApplication | null>(null);
    // Renamed for clarity in student edit modal
    const [studentEditForm, setStudentEditForm] = useState<Partial<EcosystemApplication>>({});

    // Community Member specific states
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [memberSearch, setMemberSearch] = useState('');
    const [userSearch, setUserSearch] = useState(''); // New State for User Tab Search
    const [certGeneratingId, setCertGeneratingId] = useState<string | null>(null);
    const [certMember, setCertMember] = useState<any>(null); // For hidden certificate render
    const adminCertRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const jobFileInputRef = useRef<HTMLInputElement>(null);

    // Job Management States
    const [jobCategoryFilter, setJobCategoryFilter] = useState('All');
    const [jobDateFilter, setJobDateFilter] = useState('');

    // Overview Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());

    const MEMBER_CATEGORIES = [
        'Central Team',
        'Sub Central Team',
        'Division Team',
        'District Team',
        'Campus Ambassador',
        'Volunteer'
    ];

    const JOB_CATEGORIES = ['Engineering', 'Marketing', 'Sales', 'Design', 'HR', 'Finance', 'IT', 'Others'];

    // Initial States
    const initialJobState: Job = {
        title: '', company: '', vacancy: '', deadline: '', 
        jobContext: '', responsibilities: '', employmentStatus: 'Full-time', 
        workplace: 'Work at office', educationalRequirements: '', 
        experienceRequirements: '', additionalRequirements: '', 
        location: '', salary: '', compensationAndBenefits: '', description: '',
        applyLink: '', category: 'Others'
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
            const [l, a, u, j, b, c, ji, ea, cm, ins, cs] = await Promise.all([
                getLeads(), getAffiliates(), getUsers(), getJobs(), getBlogPosts(), getCourses(),
                getJobInterests(), getEcosystemApplications(), getCommunityMembers(), getInstructors(), getClassSessions()
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
            setClassSessions(cs as ClassSession[]);
            setLastUpdated(new Date());
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    // --- Derived Data ---
    const uniqueBatches = Array.from(new Set(ecosystemApps.map(app => app.batch).filter(Boolean)));

    // --- Calendar Helper ---
    const renderCalendar = () => {
        const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];
        
        for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);

        const today = new Date();

        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = i === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
            days.push(
                <div key={i} className={`h-8 w-8 flex items-center justify-center rounded-full text-xs font-medium transition-colors ${isToday ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
                    {i}
                </div>
            );
        }
        return days;
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

    const openNewJobModal = () => { 
        setEditingId(null); 
        setNewJob(initialJobState); 
        setRawJobText(''); // Reset raw text
        setModalType('job'); 
        setIsModalOpen(true); 
    };
    const openEditJobModal = (job: Job) => { setEditingId(job.id || null); setNewJob(job); setModalType('job'); setIsModalOpen(true); };
    const openNewBlogModal = () => { setEditingId(null); setNewBlog({ title: '', excerpt: '', author: 'Admin', imageUrl: '', content: '' }); setModalType('blog'); setIsModalOpen(true); };
    const openEditBlogModal = (blog: BlogPost) => { setEditingId(blog.id || null); setNewBlog(blog); setModalType('blog'); setIsModalOpen(true); };
    const openNewCourseModal = () => { setEditingId(null); setNewCourse({ title: '', instructor: '', price: '', duration: '', imageUrl: '', category: '' }); setModalType('course'); setIsModalOpen(true); };
    
    const openNewMemberModal = () => { setEditingId(null); setNewMember({ name: '', phone: '', email: '', role: '', category: 'Volunteer' }); setModalType('member'); setIsModalOpen(true); };
    const openEditMemberModal = (m: CommunityMember) => { setEditingId(m.id || null); setNewMember({ ...m, category: m.category || 'Volunteer' }); setModalType('member'); setIsModalOpen(true); };
    
    const openManageEcosystemModal = (app: EcosystemApplication) => {
        setManageStudent(app);
        setStudentEditForm({
            name: app.name,
            phone: app.phone,
            batch: app.batch,
            attendance: app.attendance || 0,
            marks: app.marks || 0,
            remarks: app.remarks || ''
        });
        setModalType('ecosystem_student_edit');
        setIsModalOpen(true);
    };

    // --- Smart Job Parser ---
    const handleSmartParse = async () => {
        if (!rawJobText) return;
        setIsParsing(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                You are a smart job parser. Extract job details from the following text and return a JSON object ONLY.
                Match these keys: title, company, vacancy, deadline, jobContext, responsibilities, employmentStatus, workplace, educationalRequirements, experienceRequirements, additionalRequirements, location, salary, compensationAndBenefits, applyLink, category.
                
                Mapping Rules:
                1. deadline: Extract date and format as YYYY-MM-DD. If not found, use a date 30 days from today.
                2. category: Must be one of ['Engineering', 'Marketing', 'Sales', 'Design', 'HR', 'Finance', 'IT', 'Others']. Infer from title.
                3. employmentStatus: Must be one of ['Full-time', 'Part-time', 'Contractual', 'Internship', 'Freelance']. Default to 'Full-time'.
                4. location: Extract city/area.
                5. If a field is missing in text, set it as empty string.
                
                Input Text:
                ${rawJobText}
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });
            
            const data = JSON.parse(response.text || "{}");
            setNewJob({ ...initialJobState, ...data });
            alert("Auto-filled successfully! Please review the fields.");
        } catch (e) {
            console.error("Parse Error", e);
            alert("Failed to parse automatically. Please fill manually.");
        }
        setIsParsing(false);
    };


    // Save Handlers
    const handleSaveJob = async (e: React.FormEvent) => {
        e.preventDefault(); if (!user) return; setFormLoading(true);
        try {
            const jobData = { ...sanitizeData(newJob), userId: user.uid, userEmail: user.email || '', postedDate: new Date() };
            if (editingId) await updateJob(editingId, jobData); else await saveJob(jobData);
            setNewJob(initialJobState); setIsModalOpen(false); await fetchData(); alert("Success!");
        } catch (error: any) { alert(`Error: ${error.message}`); } setFormLoading(false);
    };

    const handleSaveBlog = async (e: React.FormEvent) => {
        e.preventDefault(); if (!user) return; setFormLoading(true);
        try {
            // Auto date on create
            const blogData = { ...sanitizeData(newBlog), userId: user.uid, userEmail: user.email || '' };
            if(!editingId) blogData.date = new Date();
            
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
            await updateEcosystemStudent(manageStudent.id, studentEditForm);
            setIsModalOpen(false);
            fetchData();
            alert("Student Updated!");
        } catch(e) { alert("Update Failed"); }
        setFormLoading(false);
    }

    // --- Bulk Ecosystem Handlers ---
    const handleSaveClassSession = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            await saveClassSession(classSessionForm);
            alert("Class Scheduled!");
            setClassSessionForm({ batch: '', topic: '', mentorName: '', date: '', time: '', link: '' });
            fetchData();
        } catch(e) { alert("Failed to save class."); }
        setFormLoading(false);
    };

    const handleDeleteClass = async (id: string) => {
        if(!confirm("Delete this class?")) return;
        try { await deleteClassSession(id); fetchData(); } catch(e) { alert("Delete failed"); }
    };

    const handleSendNotice = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!noticeForm.title || !noticeForm.message) { alert("Fill all fields!"); return; }
        setFormLoading(true);
        try {
            const notice = {
                title: noticeForm.title,
                message: noticeForm.message,
                date: new Date()
            };
            const count = await sendBatchNotice(noticeForm.targetBatch, notice);
            alert(`Notice sent to ${count} students!`);
            setNoticeForm({ ...noticeForm, title: '', message: '' });
            fetchData();
        } catch(e) { alert("Sending failed."); }
        setFormLoading(false);
    };

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
    const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'member' | 'job') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n');
            const newItems: any[] = [];
            
            for (let i = 1; i < lines.length; i++) { // Skip header
                const line = lines[i].trim();
                if (!line) continue;
                const cols = line.split(','); 
                
                if (type === 'member' && cols.length >= 2) {
                     newItems.push({
                        name: cols[0]?.trim(),
                        phone: cols[1]?.trim(),
                        email: cols[2]?.trim() || '',
                        role: cols[3]?.trim() || 'Member',
                        category: cols[4]?.trim() || 'Volunteer',
                        userId: user?.uid,
                        createdAt: new Date()
                    });
                } else if (type === 'job' && cols.length >= 4) {
                    newItems.push({
                        title: cols[0]?.trim(),
                        company: cols[1]?.trim(),
                        deadline: cols[2]?.trim(),
                        salary: cols[3]?.trim(),
                        location: cols[4]?.trim(),
                        applyLink: cols[5]?.trim(),
                        category: cols[6]?.trim() || 'Others',
                        employmentStatus: 'Full-time',
                        userId: user?.uid,
                        userEmail: user?.email,
                        createdAt: new Date()
                    });
                }
            }

            if (newItems.length > 0) {
                setLoading(true);
                try {
                    if (type === 'member') await bulkSaveCommunityMembers(newItems);
                    if (type === 'job') await bulkSaveJobs(newItems);
                    alert(`${newItems.length} items imported successfully!`);
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
        if (e.target) e.target.value = '';
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

    // Filter Logic
    const filteredMembers = communityMembers.filter(m => {
        const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;
        const matchesSearch = memberSearch === '' || 
            m.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
            m.phone.includes(memberSearch);
        return matchesCategory && matchesSearch;
    });

    const filteredUsers = usersList.filter(u => 
        (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.phone || '').includes(userSearch)
    ).sort((a, b) => {
        const getRank = (u: any) => {
            if (ADMIN_EMAILS.includes(u.email)) return 3;
            if (u.role === 'instructor') return 2;
            return 1;
        };
        return getRank(b) - getRank(a);
    });

    const filteredJobs = jobs.filter(job => {
        const matchesCategory = jobCategoryFilter === 'All' || job.category === jobCategoryFilter;
        const matchesDate = jobDateFilter === '' || job.deadline === jobDateFilter;
        return matchesCategory && matchesDate;
    });

    // Analytics Grouping
    const jobInterestStats = jobs.map(job => {
        const clicks = jobInterests.filter(i => i.jobId === job.id);
        return {
            ...job,
            clicks: clicks.length,
            interestedUsers: clicks.map(c => ({ name: c.userName, email: c.userEmail, date: c.clickedAt }))
        };
    }).sort((a, b) => b.clicks - a.clicks);


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
                        { id: 'ecosystem', icon: CreditCard, label: 'Ecosystem' },
                        { id: 'jobs', icon: Briefcase, label: 'Manage Jobs' },
                        { id: 'analytics', icon: MousePointerClick, label: 'Job Tracking' },
                        { id: 'blogs', icon: BookOpen, label: 'Manage Blog' },
                        { id: 'instructors', icon: UserPlus, label: 'Instructors' },
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
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center text-blue-600 mb-4"><Users size={20}/></div>
                                        <h3 className="text-slate-500 font-medium text-sm">Total Users</h3>
                                        <p className="text-3xl font-bold text-slate-800 mt-1">{usersList.length}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="bg-green-50 w-10 h-10 rounded-full flex items-center justify-center text-green-600 mb-4"><CreditCard size={20}/></div>
                                        <h3 className="text-slate-500 font-medium text-sm">Ecosystem Students</h3>
                                        <p className="text-3xl font-bold text-slate-800 mt-1">{ecosystemApps.length}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="bg-purple-50 w-10 h-10 rounded-full flex items-center justify-center text-purple-600 mb-4"><Database size={20}/></div>
                                        <h3 className="text-slate-500 font-medium text-sm">Community Members</h3>
                                        <p className="text-3xl font-bold text-slate-800 mt-1">{communityMembers.length}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="bg-orange-50 w-10 h-10 rounded-full flex items-center justify-center text-orange-600 mb-4"><Briefcase size={20}/></div>
                                        <h3 className="text-slate-500 font-medium text-sm">Active Jobs</h3>
                                        <p className="text-3xl font-bold text-slate-800 mt-1">{jobs.length}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="bg-pink-50 w-10 h-10 rounded-full flex items-center justify-center text-pink-600 mb-4"><BookOpen size={20}/></div>
                                        <h3 className="text-slate-500 font-medium text-sm">Published Blogs</h3>
                                        <p className="text-3xl font-bold text-slate-800 mt-1">{blogs.length}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="bg-indigo-50 w-10 h-10 rounded-full flex items-center justify-center text-indigo-600 mb-4"><UserPlus size={20}/></div>
                                        <h3 className="text-slate-500 font-medium text-sm">Instructors</h3>
                                        <p className="text-3xl font-bold text-slate-800 mt-1">{instructors.length}</p>
                                    </div>
                                </div>

                                {/* Right Side: Calendar & Clock */}
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-slate-800">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                                            <div className="flex gap-1">
                                                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-1 hover:bg-slate-50 rounded"><ChevronLeft size={16}/></button>
                                                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-1 hover:bg-slate-50 rounded"><ChevronRight size={16}/></button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-7 gap-1 place-items-center text-sm">{renderCalendar()}</div>
                                    </div>

                                    <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-200">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Clock size={20} className="text-blue-200"/>
                                            <span className="text-blue-100 text-sm font-medium">Last Updated</span>
                                        </div>
                                        <p className="text-2xl font-bold">{lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        <p className="text-blue-200 text-sm">{lastUpdated.toLocaleDateString()}</p>
                                    </div>
                                </div>
                             </div>
                        )}

                        {/* --- ECOSYSTEM TAB --- */}
                        {activeTab === 'ecosystem' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><CreditCard size={24} className="text-slate-700"/> Ecosystem Management</h2>
                                            <p className="text-sm text-slate-500 mt-1">Manage Students, Classes, and Notices</p>
                                        </div>
                                        <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                                            <button onClick={() => setEcoSubTab('list')} className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${ecoSubTab === 'list' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>
                                                <Users size={16}/> Students List
                                            </button>
                                            <button onClick={() => setEcoSubTab('classes')} className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${ecoSubTab === 'classes' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>
                                                <Layers size={16}/> Class Management
                                            </button>
                                            <button onClick={() => setEcoSubTab('notice')} className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${ecoSubTab === 'notice' ? 'bg-purple-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>
                                                <Bell size={16}/> Notice Board
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {/* Sub-Tab: Students List */}
                                    {ecoSubTab === 'list' && (
                                        <div className="animate-fade-in">
                                            <div className="flex justify-between items-center mb-6">
                                                <div className="flex items-center gap-3">
                                                    <Filter size={18} className="text-slate-400"/>
                                                    <select 
                                                        value={ecoFilterBatch} 
                                                        onChange={e => setEcoFilterBatch(e.target.value)}
                                                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                                                    >
                                                        <option value="All">All Batches</option>
                                                        {uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}
                                                    </select>
                                                </div>
                                                <div className="text-slate-500 text-sm font-medium">
                                                    Showing: {ecoFilterBatch === 'All' ? ecosystemApps.length : ecosystemApps.filter(a => a.batch === ecoFilterBatch).length} Students
                                                </div>
                                            </div>

                                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-slate-50"><tr><th className="p-4">Name</th><th className="p-4">Batch</th><th className="p-4">Payment Info</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead>
                                                    <tbody className="divide-y">
                                                        {ecosystemApps
                                                            .filter(app => ecoFilterBatch === 'All' || app.batch === ecoFilterBatch)
                                                            .map(app => (
                                                            <tr key={app.id} className="hover:bg-slate-50">
                                                                <td className="p-4 font-bold">{app.name}</td>
                                                                <td className="p-4 text-slate-500">{app.batch || '-'}</td>
                                                                <td className="p-4">
                                                                    <div className="text-xs font-mono bg-slate-100 p-1 rounded inline-block">{app.transactionId}</div>
                                                                    <div className="text-xs text-slate-500 mt-1">{app.paymentMethod} • ৳{app.paidAmount || 0}</div>
                                                                </td>
                                                                <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${app.status==='approved'?'bg-green-100 text-green-700':app.status==='rejected'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{app.status}</span></td>
                                                                <td className="p-4 flex gap-2">
                                                                    {app.status === 'approved' ? (
                                                                        <button onClick={() => openManageEcosystemModal(app)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1 hover:bg-blue-700 shadow-sm">
                                                                            <Eye size={14}/> View/Edit
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

                                    {/* Sub-Tab: Class Management (New) */}
                                    {ecoSubTab === 'classes' && (
                                        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            {/* Left: Schedule Form */}
                                            <div className="lg:col-span-1">
                                                <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl mb-4">
                                                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Plus size={18}/> Schedule Class</h3>
                                                </div>
                                                <form onSubmit={handleSaveClassSession} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-1">Batch</label>
                                                        {/* Dropdown for Batch */}
                                                        <select 
                                                            required 
                                                            value={classSessionForm.batch} 
                                                            onChange={e => setClassSessionForm({...classSessionForm, batch: e.target.value})} 
                                                            className="w-full p-2 border rounded-lg bg-white"
                                                        >
                                                            <option value="">Select a Batch</option>
                                                            {uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-1">Topic Name</label>
                                                        <input required value={classSessionForm.topic} onChange={e => setClassSessionForm({...classSessionForm, topic: e.target.value})} className="w-full p-2 border rounded-lg bg-white" placeholder="e.g. React Hooks"/>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-1">Mentor (Sir Name)</label>
                                                        <input required value={classSessionForm.mentorName} onChange={e => setClassSessionForm({...classSessionForm, mentorName: e.target.value})} className="w-full p-2 border rounded-lg bg-white" placeholder="e.g. John Doe"/>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                                                            <input type="date" required value={classSessionForm.date} onChange={e => setClassSessionForm({...classSessionForm, date: e.target.value})} className="w-full p-2 border rounded-lg bg-white"/>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-bold text-slate-700 mb-1">Time</label>
                                                            <input required value={classSessionForm.time} onChange={e => setClassSessionForm({...classSessionForm, time: e.target.value})} className="w-full p-2 border rounded-lg bg-white" placeholder="9:00 PM"/>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-1">Class Link</label>
                                                        <input required value={classSessionForm.link} onChange={e => setClassSessionForm({...classSessionForm, link: e.target.value})} className="w-full p-2 border rounded-lg bg-white" placeholder="Google Meet Link"/>
                                                    </div>
                                                    <button type="submit" disabled={formLoading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700">{formLoading ? 'Scheduling...' : 'Schedule Class'}</button>
                                                </form>
                                            </div>

                                            {/* Right: Class List */}
                                            <div className="lg:col-span-2">
                                                <h3 className="font-bold text-slate-800 mb-4">Upcoming Classes</h3>
                                                <div className="space-y-3">
                                                    {classSessions.map(cls => (
                                                        <div key={cls.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center hover:shadow-md transition-shadow">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{cls.batch}</span>
                                                                    <span className="text-slate-500 text-xs flex items-center gap-1"><Calendar size={12}/> {cls.date} • {cls.time}</span>
                                                                </div>
                                                                <h4 className="font-bold text-slate-800">{cls.topic}</h4>
                                                                <p className="text-sm text-slate-600 mt-1">Instructor: <span className="font-medium text-slate-800">{cls.mentorName}</span></p>
                                                            </div>
                                                            <button onClick={() => handleDeleteClass(cls.id!)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18}/></button>
                                                        </div>
                                                    ))}
                                                    {classSessions.length === 0 && <p className="text-slate-400 text-center py-10">No classes scheduled.</p>}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Sub-Tab: Notice Board */}
                                    {ecoSubTab === 'notice' && (
                                        <div className="animate-fade-in max-w-2xl mx-auto">
                                            <div className="bg-purple-50 border border-purple-100 p-6 rounded-2xl mb-6">
                                                <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2"><Bell size={20} className="text-purple-600"/> Broadcast Notice</h3>
                                                <p className="text-slate-600 text-sm">Send important updates or announcements to students dashboards.</p>
                                            </div>

                                            <form onSubmit={handleSendNotice} className="space-y-5 bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-2">Target Audience</label>
                                                    <select 
                                                        value={noticeForm.targetBatch} 
                                                        onChange={e => setNoticeForm({...noticeForm, targetBatch: e.target.value})}
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                                                    >
                                                        <option value="All">All Approved Students</option>
                                                        {uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-2">Notice Title</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="e.g. Exam Schedule Changed"
                                                        value={noticeForm.title}
                                                        onChange={e => setNoticeForm({...noticeForm, title: e.target.value})}
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                                                    <textarea 
                                                        rows={4}
                                                        placeholder="Type your announcement here..."
                                                        value={noticeForm.message}
                                                        onChange={e => setNoticeForm({...noticeForm, message: e.target.value})}
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                                                    />
                                                </div>

                                                <button 
                                                    disabled={formLoading}
                                                    type="submit" 
                                                    className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 flex justify-center items-center gap-2"
                                                >
                                                    {formLoading ? 'Sending...' : <><Share2 size={20}/> Send Notice</>}
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* --- ANALYTICS (Job Tracking) --- */}
                        {activeTab === 'analytics' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><MousePointerClick size={20}/> Job Application Tracking</h2>
                                    <p className="text-xs text-slate-500">See who clicked 'Apply' on which jobs.</p>
                                </div>
                                <div className="p-6 space-y-6">
                                    {jobInterestStats.map(job => (
                                        <div key={job.id} className="border border-slate-200 rounded-xl overflow-hidden">
                                            <div className="bg-slate-50 p-4 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors">
                                                <div>
                                                    <h3 className="font-bold text-slate-800">{job.title}</h3>
                                                    <p className="text-xs text-slate-500">{job.company}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{job.clicks} Clicks</span>
                                                </div>
                                            </div>
                                            {job.interestedUsers.length > 0 && (
                                                <div className="p-4 bg-white">
                                                    <table className="w-full text-left text-sm">
                                                        <thead className="text-xs text-slate-400 uppercase border-b"><tr><th className="py-2">User Name</th><th className="py-2">Email</th><th className="py-2">Click Date</th></tr></thead>
                                                        <tbody className="divide-y">
                                                            {job.interestedUsers.map((u, i) => (
                                                                <tr key={i}>
                                                                    <td className="py-2 font-medium text-slate-700">{u.name}</td>
                                                                    <td className="py-2 text-slate-500">{u.email}</td>
                                                                    <td className="py-2 text-slate-400 text-xs">{u.date ? new Date(u.date.seconds * 1000).toLocaleString() : '-'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {jobInterestStats.length === 0 && <p className="text-center text-slate-400">No tracking data available.</p>}
                                </div>
                            </div>
                        )}

                        {/* --- JOBS MANAGEMENT --- */}
                        {activeTab === 'jobs' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-slate-50/50 gap-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800">Job Management</h2>
                                        <p className="text-xs text-slate-500">Post new jobs or manage existing ones</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="file" ref={jobFileInputRef} onChange={(e) => handleCsvUpload(e, 'job')} accept=".csv" className="hidden"/>
                                        <button onClick={() => jobFileInputRef.current?.click()} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-700 shadow-sm"><FileSpreadsheet size={16}/> Bulk Upload</button>
                                        <button onClick={openNewJobModal} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"><Plus size={18}/> Post Job</button>
                                    </div>
                                </div>
                                
                                {/* Filters */}
                                <div className="p-4 bg-white border-b border-slate-100 flex gap-4">
                                    <select value={jobCategoryFilter} onChange={e => setJobCategoryFilter(e.target.value)} className="p-2 border rounded-lg text-sm bg-white">
                                        <option value="All">All Categories</option>
                                        {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <input type="date" value={jobDateFilter} onChange={e => setJobDateFilter(e.target.value)} className="p-2 border rounded-lg text-sm bg-white"/>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50"><tr><th className="p-4">Title</th><th className="p-4">Category</th><th className="p-4">Deadline</th><th className="p-4">Posted</th><th className="p-4">Actions</th></tr></thead>
                                        <tbody className="divide-y">
                                            {filteredJobs.map(job => (
                                                <tr key={job.id} className="hover:bg-slate-50">
                                                    <td className="p-4">
                                                        <div className="font-bold text-slate-800">{job.title}</div>
                                                        <div className="text-xs text-slate-500">{job.company}</div>
                                                    </td>
                                                    <td className="p-4"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">{job.category}</span></td>
                                                    <td className="p-4 text-red-500 font-medium">{job.deadline}</td>
                                                    <td className="p-4 text-slate-400 text-xs">{job.postedDate ? new Date(job.postedDate.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
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

                        {/* ... (Other tabs remain the same: Users, Instructors, Community Database, Community Leads) ... */}
                        {/* Reusing existing implementations for those tabs for brevity, ensuring no functionality loss */}
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
                                            <tr><th className="p-4">User Profile</th><th className="p-4">Role</th><th className="p-4">Contact</th><th className="p-4">Last Login</th><th className="p-4 text-right">Actions</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredUsers.map(u => (
                                                <tr key={u.id} className="hover:bg-slate-50">
                                                    <td className="p-4 flex items-center gap-3"><img src={u.photoURL || 'https://via.placeholder.com/40'} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-slate-200"/><div><div className="font-bold text-slate-800">{u.name || 'Unknown'}</div><div className="text-xs text-slate-500">{u.email}</div></div></td>
                                                    <td className="p-4">{ADMIN_EMAILS.includes(u.email) ? <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><Shield size={12}/> Admin</span> : u.role === 'instructor' ? <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs font-bold w-fit">Instructor</span> : <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold w-fit">User</span>}</td>
                                                    <td className="p-4"><div className="text-slate-700">{u.phone || 'N/A'}</div></td>
                                                    <td className="p-4 text-slate-500 text-xs">{u.lastLogin ? new Date(u.lastLogin.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                                                    <td className="p-4 text-right">{!ADMIN_EMAILS.includes(u.email) && <button onClick={() => handleDelete('user', u.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"><Trash2 size={18}/></button>}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {/* --- DATABASE & LEADS Tabs are same as previous logic, just ensuring they render --- */}
                        {activeTab === 'database' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                                        <div className="flex items-center gap-3"><div className="bg-blue-600 p-2 rounded-lg text-white"><Database size={24}/></div><div><h2 className="text-lg font-bold text-slate-800">Community Database</h2><p className="text-xs text-slate-500">{communityMembers.length} Members</p></div></div>
                                        <div className="flex gap-2">
                                            <input type="file" ref={fileInputRef} onChange={(e) => handleCsvUpload(e, 'member')} accept=".csv" className="hidden"/>
                                            <button onClick={() => fileInputRef.current?.click()} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-700 shadow-sm"><FileSpreadsheet size={16}/> Import</button>
                                            <button onClick={downloadCsv} className="bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-700 shadow-sm"><Download size={16}/> Export</button>
                                            <button onClick={openNewMemberModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-sm"><Plus size={16}/> Add</button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="p-2.5 border border-slate-200 rounded-lg bg-white text-sm outline-none focus:border-blue-500"><option value="All">All Categories</option>{MEMBER_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select>
                                        <div className="relative flex-1"><Search className="absolute left-3 top-3 text-slate-400" size={16}/><input placeholder="Search..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} className="w-full p-2.5 pl-10 border border-slate-200 rounded-lg bg-white text-sm outline-none focus:border-blue-500"/></div>
                                    </div>
                                </div>
                                <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 border-b border-slate-100"><tr><th className="p-4">Member Info</th><th className="p-4">Contact</th><th className="p-4">Position</th><th className="p-4">Joined</th><th className="p-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredMembers.map(m => (<tr key={m.id} className="hover:bg-slate-50 group"><td className="p-4"><div className="font-bold text-slate-800">{m.name}</div><div className="text-xs text-slate-400">ID: {m.id?.substring(0,6)}</div></td><td className="p-4"><div className="text-slate-700">{m.phone}</div><div className="text-xs text-slate-400">{m.email}</div></td><td className="p-4"><div className="text-slate-700 font-medium">{m.role}</div><span className="inline-block bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold mt-1 uppercase tracking-wide">{m.category}</span></td><td className="p-4 text-slate-500 text-xs">{m.createdAt ? new Date(m.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td><td className="p-4 flex gap-2 justify-end"><button onClick={() => handleDownloadCertificate(m)} disabled={certGeneratingId === m.id} className="text-orange-600 hover:bg-orange-50 p-2 rounded-lg transition-colors disabled:opacity-50" title="Download Certificate">{certGeneratingId === m.id ? <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div> : <Award size={18}/>}</button><button onClick={() => openEditMemberModal(m)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Edit"><Edit size={18}/></button><button onClick={() => handleDelete('member', m.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Delete"><Trash2 size={18}/></button></td></tr>))}</tbody></table></div>
                            </div>
                        )}
                        {/* --- Instructors Tab --- */}
                        {activeTab === 'instructors' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50"><h2 className="text-lg font-bold text-slate-800">Instructors List</h2><button onClick={openNewInstructorModal} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all"><Plus size={18}/> Create Instructor</button></div>
                                <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Phone</th><th className="p-4">Joined</th></tr></thead><tbody className="divide-y">{instructors.map((ins) => (<tr key={ins.id} className="hover:bg-slate-50"><td className="p-4 font-bold">{ins.name}</td><td className="p-4">{ins.email}</td><td className="p-4">{ins.phone}</td><td className="p-4 text-slate-500">{ins.createdAt ? new Date(ins.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}</td></tr>))}</tbody></table></div>
                            </div>
                        )}
                        {/* --- Community Leads --- */}
                        {activeTab === 'community' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50"><div className="flex items-center gap-3"><div className="bg-purple-600 p-2 rounded-lg text-white"><Share2 size={24}/></div><div><h2 className="text-lg font-bold text-slate-800">Community Leads</h2><p className="text-xs text-slate-500">Affiliate & Ambassador Applications</p></div></div></div>
                                <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 border-b border-slate-100"><tr><th className="p-4">Applicant</th><th className="p-4">Type</th><th className="p-4">Details</th><th className="p-4">Stats</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{affiliates.map(lead => (<tr key={lead.id} className="hover:bg-slate-50"><td className="p-4"><div className="font-bold text-slate-800">{lead.name}</div><div className="text-xs text-slate-500">{lead.phone}</div></td><td className="p-4"><span className={`px-2 py-1 rounded-md text-xs font-bold ${lead.type === 'Campus Ambassador' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{lead.type}</span></td><td className="p-4"><div className="text-xs text-slate-600">{lead.institution || 'N/A'}</div><div className="text-xs text-slate-400">{lead.email}</div></td><td className="p-4"><div className="text-xs font-bold text-slate-700">Earned: ৳{lead.totalEarnings}</div>{lead.referralCode && <div className="text-xs text-green-600 font-mono">Ref: {lead.referralCode}</div>}</td><td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${lead.status==='approved'?'bg-green-100 text-green-700':lead.status==='rejected'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{lead.status}</span></td><td className="p-4 flex gap-2 justify-end">{lead.status === 'pending' && (<><button onClick={() => handleAffiliateStatus(lead.id!, 'approved', lead.name)} className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors" title="Approve"><CheckCircle size={18}/></button><button onClick={() => handleAffiliateStatus(lead.id!, 'rejected')} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Reject"><XCircle size={18}/></button></>)}<button onClick={() => {}} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg"><Settings size={18}/></button></td></tr>))}</tbody></table></div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Hidden Certificate Template for Admin Generation (Same as before) */}
            <div style={{ position: 'absolute', top: -9999, left: -9999 }}>{certMember && <div ref={adminCertRef} className="w-[1123px] h-[794px] bg-white text-slate-900 font-['Hind_Siliguri'] flex flex-col justify-between p-20 border-[8px] border-[#1e3a8a] relative"><div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"><img src="https://iili.io/f3k62rG.md.png" className="w-[600px]"/></div><div className="text-center z-10"><h1 className="text-5xl font-bold text-[#1e3a8a] mb-2">CERTIFICATE</h1><p className="text-xl tracking-widest text-[#DAA520]">OF RECOGNITION</p></div><div className="text-center z-10"><p className="text-xl italic text-slate-500 mb-4">Proudly Presented To</p><h2 className="text-6xl font-bold text-slate-900 border-b-2 border-slate-300 pb-2 inline-block mb-6">{certMember.nameForCert}</h2><p className="text-xl text-slate-600 max-w-3xl mx-auto">For securing a verified position as a <b>{certMember.role}</b> at One Way School.</p></div><div className="flex justify-between items-end z-10 mt-10"><div className="text-center"><p className="font-bold text-slate-900 text-lg">Sifatur Rahman</p><p className="text-sm text-slate-500">Founder</p></div><div className="text-center"><p className="font-bold text-slate-900 text-lg">OWS-{certMember.id?.slice(0,6)}</p><p className="text-sm text-slate-500">Certificate ID</p></div></div></div>}</div>

             {/* Modals */}
             {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-4xl my-8 relative shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Content' : 'Manage Content'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            
                             {/* Job Modal (Updated UI) */}
                             {modalType === 'job' && (
                                <div className="space-y-6">
                                    {/* Smart Auto-Fill Section */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-4">
                                        <div className="flex items-center gap-2 mb-3 text-blue-700 font-bold">
                                            <Sparkles size={18}/> Smart Auto-Fill from Text
                                        </div>
                                        <textarea
                                            value={rawJobText}
                                            onChange={(e) => setRawJobText(e.target.value)}
                                            placeholder="Paste full job description here (Title, Company, Salary, etc.)"
                                            rows={3}
                                            className="w-full p-3 border border-blue-100 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-400 outline-none mb-3"
                                        />
                                        <button 
                                            onClick={handleSmartParse} 
                                            disabled={isParsing || !rawJobText}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all"
                                        >
                                            {isParsing ? 'Analyzing...' : <><Zap size={16}/> Auto Fill Form</>}
                                        </button>
                                    </div>

                                    <form onSubmit={handleSaveJob} className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div><label className="block text-sm font-bold text-slate-700 mb-1">Job Title</label><input required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                            <div><label className="block text-sm font-bold text-slate-700 mb-1">Company</label><input required value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                            <div><label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                                                <select value={newJob.category} onChange={e => setNewJob({...newJob, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white">
                                                    {JOB_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div><label className="block text-sm font-bold text-slate-700 mb-1">Deadline</label><input type="date" required value={newJob.deadline} onChange={e => setNewJob({...newJob, deadline: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                            <div><label className="block text-sm font-bold text-slate-700 mb-1">Salary</label><input required value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white" placeholder="e.g. 25k - 35k"/></div>
                                            <div><label className="block text-sm font-bold text-slate-700 mb-1">Location</label><input required value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                        </div>
                                        <div><label className="block text-sm font-bold text-slate-700 mb-1">Apply Link/Email</label><input required value={newJob.applyLink} onChange={e => setNewJob({...newJob, applyLink: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white" placeholder="https://... or mailto:..."/></div>
                                        <div><label className="block text-sm font-bold text-slate-700 mb-1">Responsibilities</label><textarea rows={3} value={newJob.responsibilities} onChange={e => setNewJob({...newJob, responsibilities: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                        <div><label className="block text-sm font-bold text-slate-700 mb-1">Requirements</label><textarea rows={3} value={newJob.educationalRequirements} onChange={e => setNewJob({...newJob, educationalRequirements: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                        <button disabled={formLoading} type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">{formLoading ? 'Saving...' : 'Save Job'}</button>
                                    </form>
                                </div>
                            )}

                             {/* Blog Modal (Updated UI - White Fields) */}
                             {modalType === 'blog' && (
                                <form onSubmit={handleSaveBlog} className="space-y-4">
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Title</label><input required value={newBlog.title} onChange={e => setNewBlog({...newBlog, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white text-slate-900"/></div>
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Excerpt (Short Description)</label><textarea required rows={2} value={newBlog.excerpt} onChange={e => setNewBlog({...newBlog, excerpt: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white text-slate-900"/></div>
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Image URL</label><input required value={newBlog.imageUrl} onChange={e => setNewBlog({...newBlog, imageUrl: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white text-slate-900"/></div>
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Full Content</label><textarea required rows={6} value={newBlog.content} onChange={e => setNewBlog({...newBlog, content: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white text-slate-900"/></div>
                                    <div className="flex gap-4">
                                        <div className="flex-1"><label className="block text-sm font-bold text-slate-700 mb-1">Author</label><input value={newBlog.author} onChange={e => setNewBlog({...newBlog, author: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white text-slate-900"/></div>
                                    </div>
                                    <button disabled={formLoading} type="submit" className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700">{formLoading ? 'Saving...' : 'Publish Blog'}</button>
                                </form>
                            )}

                            {/* Ecosystem Student Edit Modal (Full Details) */}
                            {modalType === 'ecosystem_student_edit' && manageStudent && (
                                <form onSubmit={handleSaveEcosystemStudent} className="space-y-6">
                                    <div className="flex justify-between items-start bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">{manageStudent.name}</h4>
                                            <p className="text-sm text-slate-500">{manageStudent.email}</p>
                                            <div className="mt-2 text-xs font-mono bg-white p-1 rounded border inline-block">TrxID: {manageStudent.transactionId}</div>
                                            <div className="mt-1 text-xs text-slate-600">Method: <span className="font-bold">{manageStudent.paymentMethod}</span></div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-slate-500">Paid Amount</div>
                                            <div className="text-xl font-bold text-green-600">৳{manageStudent.paidAmount || 0}</div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                                            <input value={studentEditForm.name} onChange={e => setStudentEditForm({...studentEditForm, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Phone</label>
                                            <input value={studentEditForm.phone} onChange={e => setStudentEditForm({...studentEditForm, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Batch</label>
                                            <input value={studentEditForm.batch} onChange={e => setStudentEditForm({...studentEditForm, batch: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100 pt-4">
                                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Activity size={18}/> Performance & Attendance</h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Attendance (%)</label>
                                                <input type="number" min="0" max="100" value={studentEditForm.attendance} onChange={e => setStudentEditForm({...studentEditForm, attendance: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg bg-white"/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Avg Marks</label>
                                                <input type="number" min="0" max="100" value={studentEditForm.marks} onChange={e => setStudentEditForm({...studentEditForm, marks: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg bg-white"/>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Remarks</label>
                                                <textarea rows={2} value={studentEditForm.remarks} onChange={e => setStudentEditForm({...studentEditForm, remarks: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white" placeholder="Teacher's comments..."/>
                                            </div>
                                        </div>
                                        
                                        {/* Visual Preview */}
                                        <div className="mt-4 bg-slate-50 p-3 rounded-lg">
                                            <div className="flex justify-between text-xs mb-1"><span>Attendance</span><span>{studentEditForm.attendance}%</span></div>
                                            <div className="w-full bg-slate-200 rounded-full h-1.5 mb-3">
                                                <div className="bg-blue-600 h-1.5 rounded-full" style={{width: `${studentEditForm.attendance}%`}}></div>
                                            </div>
                                            <div className="flex justify-between text-xs mb-1"><span>Performance</span><span>{studentEditForm.marks}%</span></div>
                                            <div className="w-full bg-slate-200 rounded-full h-1.5">
                                                <div className="bg-green-600 h-1.5 rounded-full" style={{width: `${studentEditForm.marks}%`}}></div>
                                            </div>
                                        </div>
                                    </div>

                                    <button disabled={formLoading} type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all">
                                        {formLoading ? 'Saving...' : 'Update Student Record'}
                                    </button>
                                </form>
                            )}

                            {/* Other existing modals (Member, Instructor) remain the same... */}
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
                            {modalType === 'instructor' && (
                                <form onSubmit={handleSaveInstructor} className="space-y-4">
                                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700 mb-4">This will create a profile for the instructor.</div>
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Name</label><input required value={newInstructor.name} onChange={e => setNewInstructor({...newInstructor, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Email (Username)</label><input required type="email" value={newInstructor.email} onChange={e => setNewInstructor({...newInstructor, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Password</label><input required type="password" value={newInstructor.password} onChange={e => setNewInstructor({...newInstructor, password: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Phone</label><input value={newInstructor.phone} onChange={e => setNewInstructor({...newInstructor, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
                                    <button disabled={formLoading} type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800">{formLoading ? 'Creating...' : 'Create Instructor'}</button>
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