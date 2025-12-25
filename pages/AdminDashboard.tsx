import React, { useEffect, useState, useRef } from 'react';
import { 
    getLeads, getAffiliates, getUsers, getJobs, saveJob, updateJob, deleteJob, 
    getBlogPosts, saveBlogPost, updateBlogPost, deleteBlogPost, 
    getCourses, saveCourse, updateCourse, deleteCourse, updateAffiliateStatus,
    getJobInterests, getEcosystemApplications, updateEcosystemAppStatus, updateEcosystemStudent,
    getCommunityMembers, saveCommunityMember, deleteCommunityMember, bulkSaveCommunityMembers,
    logout, auth, updateData, createInstructor, getInstructors, deleteUserDoc,
    updateBatchClassDetails, sendBatchNotice, saveClassSession, updateClassSession, getClassSessions, deleteClassSession, bulkSaveJobs,
    updateUserProfile, saveFinancialRecord, getFinancialRecords, saveEmployer, getEmployers, deleteEmployer, deleteData,
    getAuditLogs, addAuditLog, globalSearchSystem,
    getNoticesHistory, updateNoticeHistory, saveResource, updateResource, getResources, deleteResource,
    getWithdrawalRequests, updateWithdrawalStatus, saveAmbassadorTask, getAmbassadorTasks, deleteAmbassadorTask,
    completeAmbassadorTenure
} from '../services/firebase';
import { User, Lead, Affiliate, Job, BlogPost, Course, JobInterest, EcosystemApplication, CommunityMember, Instructor, ClassSession, FinancialRecord, Employer, AuditLog, WithdrawalRequest, AmbassadorTask } from '../types';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Briefcase, BookOpen, 
    Trash2, X, ChevronLeft, LogOut, Search, Globe, Edit, CheckCircle, XCircle, MousePointerClick, CreditCard, Database, Download, Filter, UserPlus, FileSpreadsheet, Award, Layers, Bell, Calendar, Clock, ChevronRight, Sparkles, Zap, Package, Truck, Phone, ChevronDown, MessageCircle, PieChart, BarChart2, Home, Settings, Users, Share2, Mail, Plus, TrendingUp, FileText, Settings2, Megaphone, DollarSign, CheckSquare, ExternalLink, Video, Wallet, TrendingDown, Percent, AlertCircle, Monitor, MapPin, Eye, Printer, Landmark, Building, FileCheck, ClipboardList, PenTool, UserCheck, CalendarCheck, FileOutput, ShieldAlert, History, Activity, Box, GraduationCap, BookOpenCheck, LayoutList, List, Calculator, Gift
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface AdminDashboardProps {
    user: User | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
    const ADMIN_EMAILS = ['onewayschool.bd@gmail.com', 'onewayschool.bd@gamil.com', 'admin@ows.com']; 
    const navigate = useNavigate();

    // --- Tab States ---
    const [activeTab, setActiveTab] = useState<'overview' | 'ecosystem' | 'community' | 'jobs' | 'blogs' | 'database' | 'users' | 'employers' | 'finance' | 'audit'>('overview');
    
    // --- Sub-Tab States ---
    const [ecoSubTab, setEcoSubTab] = useState<'list' | 'batch' | 'routine' | 'attendance' | 'notice' | 'cv_resource'>('list');
    const [communitySubTab, setCommunitySubTab] = useState<'affiliate' | 'ambassador' | 'tasks'>('affiliate');
    const [comListFilter, setComListFilter] = useState<'active' | 'pending'>('active');

    // --- Data Loading & Search ---
    const [loading, setLoading] = useState(false);
    const [globalSearch, setGlobalSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    
    // --- Core Data ---
    const [usersList, setUsersList] = useState<User[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [jobInterests, setJobInterests] = useState<JobInterest[]>([]);
    const [ecosystemApps, setEcosystemApps] = useState<EcosystemApplication[]>([]);
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>([]);
    const [employers, setEmployers] = useState<Employer[]>([]);
    const [classSessions, setClassSessions] = useState<ClassSession[]>([]);
    const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    
    const [noticesHistory, setNoticesHistory] = useState<any[]>([]);
    const [resourcesList, setResourcesList] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
    const [ambassadorTasks, setAmbassadorTasks] = useState<AmbassadorTask[]>([]);

    // --- Filtering State ---
    const [filterBatch, setFilterBatch] = useState('All');
    const [routineFilterBatch, setRoutineFilterBatch] = useState('All'); 
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterDate, setFilterDate] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // --- Forms & Modal State ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    // Edit States
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
    const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);

    // Dynamic Form Objects
    const [newEmployer, setNewEmployer] = useState<Employer>({ name: '' });
    const [newJob, setNewJob] = useState<Job>({ title: '', company: '', location: '', salary: '', employmentStatus: 'Full-time' });
    const [newBlog, setNewBlog] = useState<BlogPost>({ title: '', excerpt: '', author: 'Admin', imageUrl: '', content: '' });
    const [manageStudent, setManageStudent] = useState<EcosystemApplication | null>(null);
    const [studentEditForm, setStudentEditForm] = useState<Partial<EcosystemApplication>>({});
    const [classSessionForm, setClassSessionForm] = useState<ClassSession>({ batch: '', topic: '', mentorName: '', date: '', time: '', link: '' });
    const [noticeForm, setNoticeForm] = useState({ targetBatch: 'All', title: '', message: '' });
    const [resourceForm, setResourceForm] = useState({ title: '', link: '', type: 'PDF' });
    const [newTaskForm, setNewTaskForm] = useState<Partial<AmbassadorTask>>({ type: 'Social Share', status: 'Active', assignedTo: 'All' });
    
    // Community Member Manage State
    const [selectedMember, setSelectedMember] = useState<Affiliate | null>(null);
    const [memberEditForm, setMemberEditForm] = useState<Partial<Affiliate>>({});

    // Attendance specific state
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [batchModuleForm, setBatchModuleForm] = useState({ batch: '', moduleId: 1 });

    const MODULES = [
        { id: 1, title: "মডিউল ১: সেলস সাইকোলজি এবং ব্রেইন হ্যাকিং" },
        { id: 2, title: "মডিউল ২: হিপনোটিক কমিউনিকেশন ও ইনফ্লুয়েন্স" },
        { id: 3, title: "মডিউল ৩: এলিট নেটওয়ার্কিং ও পার্সোনাল ব্র্যান্ডিং" },
        { id: 4, title: "মডিউল ৪: কর্পোরেট পলিটিক্স ও ইমোশনাল মাস্টারি" }
    ];
    
    const ADMISSION_FEE = 1500;
    const MODULE_FEE = 2000;

    // Derived Data
    const uniqueBatches = Array.from(new Set(ecosystemApps.map(app => app.batch).filter(Boolean))) as string[];
    const batchStatusList = uniqueBatches.map(batchName => {
        const studentsInBatch = ecosystemApps.filter(s => s.batch === batchName);
        const currentModule = studentsInBatch[0]?.currentModule || 1;
        const studentCount = studentsInBatch.length;
        const currentPhase = studentsInBatch[0]?.currentPhase || 'Learning';
        return { batchName, currentModule, studentCount, currentPhase };
    });

    useEffect(() => {
        if (user && (ADMIN_EMAILS.includes(user.email || '') || user.role === 'admin' || user.role === 'moderator')) {
            fetchData();
        }
    }, [user]);

    useEffect(() => {
        if (user && activeTab === 'ecosystem') fetchEcosystemSpecifics();
        if (user && activeTab === 'community') fetchCommunitySpecifics();
    }, [activeTab, ecoSubTab, communitySubTab, user]);

    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (globalSearch.length > 2) {
                setLoading(true);
                const results = await globalSearchSystem(globalSearch);
                setSearchResults(results);
                setLoading(false);
            } else {
                setSearchResults([]);
            }
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [globalSearch]);

    const fetchEcosystemSpecifics = async () => {
        try {
            const [cs, nh, rl] = await Promise.all([getClassSessions(), getNoticesHistory(), getResources()]);
            setClassSessions(cs as ClassSession[]);
            setNoticesHistory(nh as any[]);
            setResourcesList(rl as any[]);
        } catch (e) { console.error("Eco fetch error:", e); }
    };

    const fetchCommunitySpecifics = async () => {
        try {
            const [w, t] = await Promise.all([getWithdrawalRequests(), getAmbassadorTasks()]);
            setWithdrawals(w as WithdrawalRequest[]);
            setAmbassadorTasks(t as AmbassadorTask[]);
        } catch (e) { console.error("Com fetch error:", e); }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [u, j, b, ji, ea, af, cm, em, cs, fr, al, l, nh, rl, w, t] = await Promise.all([
                getUsers(), getJobs(), getBlogPosts(), getJobInterests(), 
                getEcosystemApplications(), getAffiliates(), getCommunityMembers(), 
                getEmployers(), getClassSessions(), getFinancialRecords(), getAuditLogs(),
                getLeads(), getNoticesHistory(), getResources(), getWithdrawalRequests(), getAmbassadorTasks()
            ]);
            setUsersList(u as User[]);
            setJobs(j as Job[]);
            setBlogs(b as BlogPost[]);
            setJobInterests(ji as JobInterest[]);
            setEcosystemApps(ea as EcosystemApplication[]);
            setAffiliates(af as Affiliate[]);
            setCommunityMembers(cm as CommunityMember[]);
            setEmployers(em as Employer[]);
            setClassSessions(cs as ClassSession[]);
            setFinancialRecords(fr as FinancialRecord[]);
            setAuditLogs(al as AuditLog[]);
            setLeads(l as Lead[]);
            setNoticesHistory(nh as any[]);
            setResourcesList(rl as any[]);
            setWithdrawals(w as WithdrawalRequest[]);
            setAmbassadorTasks(t as AmbassadorTask[]);
        } catch (error) { console.error("Data fetch error:", error); }
        setLoading(false);
    };

    // --- Helper Functions ---
    const isToday = (timestamp: any) => {
        if(!timestamp) return false;
        const d = new Date(timestamp.seconds * 1000);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    };

    const getFinancialOverview = () => {
        let totalIncome = 0, totalExpense = 0, todayIncome = 0, todayExpense = 0;
        financialRecords.forEach(rec => {
            const amt = Number(rec.amount) || 0;
            if (rec.type === 'Income') {
                totalIncome += amt;
                if (isToday(rec.date)) todayIncome += amt;
            } else {
                totalExpense += amt;
                if (isToday(rec.date)) todayExpense += amt;
            }
        });
        return { totalIncome, totalExpense, todayIncome, todayExpense };
    };

    const financeData = getFinancialOverview();

    const calculateFinancials = (module: number = 1, paid: number = 0) => {
        const totalPayable = ADMISSION_FEE + (module * MODULE_FEE);
        const due = totalPayable - paid;
        return { totalPayable, due };
    };

    const handleSelect = (id: string) => {
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
        else setSelectedIds([...selectedIds, id]);
    };

    const handleSelectAll = (ids: string[]) => {
        if (selectedIds.length === ids.length) setSelectedIds([]);
        else setSelectedIds(ids);
    };

    // --- Actions ---
    const handleGenericSave = async (promise: Promise<any>, successMsg: string, auditAction: string) => {
        setFormLoading(true);
        try { 
            await promise; 
            await addAuditLog(auditAction, successMsg, user);
            alert(successMsg); 
            setIsModalOpen(false); 
            if (activeTab === 'ecosystem') await fetchEcosystemSpecifics();
            if (activeTab === 'community') await fetchCommunitySpecifics();
            fetchData(); 
        } 
        catch (e) { console.error(e); alert("Action Failed. Check console."); }
        setFormLoading(false);
    };

    // --- Ecosystem Actions ---
    const handleAddClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSessionId) {
            await handleGenericSave(updateClassSession(editingSessionId, classSessionForm), "Class Updated!", "Routine Update");
            setEditingSessionId(null);
        } else {
            await handleGenericSave(saveClassSession(classSessionForm), "Class Scheduled!", "Routine Update");
        }
        setClassSessionForm({ batch: '', topic: '', mentorName: '', date: '', time: '', link: '' });
    };

    const handleEditClass = (session: ClassSession) => {
        setClassSessionForm(session);
        setEditingSessionId(session.id || null);
    };

    const cancelEditClass = () => {
        setEditingSessionId(null);
        setClassSessionForm({ batch: '', topic: '', mentorName: '', date: '', time: '', link: '' });
    };

    const handleUpdateBatchModule = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!batchModuleForm.batch) {
            alert("Select a batch first.");
            return;
        }
        await handleGenericSave(
            updateBatchClassDetails(batchModuleForm.batch, { currentModule: Number(batchModuleForm.moduleId) }),
            `Batch ${batchModuleForm.batch} updated to Module ${batchModuleForm.moduleId}`,
            "Batch Module Update"
        );
    };

    const handleSendNotice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingNoticeId) {
            await handleGenericSave(updateNoticeHistory(editingNoticeId, noticeForm), "Notice Record Updated", "Notice Edit");
            setEditingNoticeId(null);
        } else {
            await handleGenericSave(
                sendBatchNotice(noticeForm.targetBatch, { title: noticeForm.title, message: noticeForm.message, date: new Date(), type: 'info' }), 
                "Notice Sent!", 
                "Notice Sent"
            );
        }
        setNoticeForm({ targetBatch: 'All', title: '', message: '' });
    };

    const handleEditNotice = (notice: any) => {
        setNoticeForm({ targetBatch: notice.targetBatch, title: notice.title, message: notice.message });
        setEditingNoticeId(notice.id);
    };

    const cancelEditNotice = () => {
        setEditingNoticeId(null);
        setNoticeForm({ targetBatch: 'All', title: '', message: '' });
    };

    const handleAddResource = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingResourceId) {
            await handleGenericSave(updateResource(editingResourceId, resourceForm), "Resource Updated!", "Resource Edit");
            setEditingResourceId(null);
        } else {
            await handleGenericSave(saveResource(resourceForm), "Resource Uploaded!", "Resource Added");
        }
        setResourceForm({ title: '', link: '', type: 'PDF' });
    };

    const handleEditResource = (res: any) => {
        setResourceForm(res);
        setEditingResourceId(res.id);
    };

    const cancelEditResource = () => {
        setEditingResourceId(null);
        setResourceForm({ title: '', link: '', type: 'PDF' });
    };

    const handleAttendance = async (studentId: string, status: 'Present' | 'Absent') => {
        const dateKey = attendanceDate;
        const student = ecosystemApps.find(s => s.id === studentId);
        if(!student) return;
        
        const newRecord = { ...(student.attendanceRecord || {}), [dateKey]: status };
        const total = Object.keys(newRecord).length;
        const present = Object.values(newRecord).filter(s => s === 'Present').length;
        const score = total === 0 ? 0 : Math.round((present/total)*100);
        
        try {
            await updateEcosystemStudent(studentId, { attendanceRecord: newRecord, scores: { ...(student.scores || {}), attendance: score } });
            // Optimistic Update
            setEcosystemApps(prev => prev.map(s => s.id === studentId ? { ...s, attendanceRecord: newRecord, scores: { ...s.scores, attendance: score } as any } : s));
        } catch (e) {
            alert("Failed to mark attendance.");
        }
    };

    // --- Community Actions ---
    const handleApproveAffiliate = async (id: string, name: string) => {
        if (!window.confirm("Approve this user?")) return;
        const code = (name.slice(0, 3).toUpperCase() + Math.floor(1000 + Math.random() * 9000)).replace(/\s/g, '');
        await handleGenericSave(updateAffiliateStatus(id, 'approved', code), `Affiliate Approved! Code: ${code}`, "Affiliate Approval");
    };

    const handleBulkAction = async (action: 'approve' | 'delete' | 'ban') => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Are you sure you want to ${action} ${selectedIds.length} items?`)) return;
        
        setFormLoading(true);
        try {
            for (const id of selectedIds) {
                if (action === 'approve') {
                    const member = affiliates.find(a => a.id === id);
                    if(member) await handleApproveAffiliate(id, member.name); 
                } else if (action === 'delete') {
                    // delete logic
                } else if (action === 'ban') {
                    await updateAffiliateStatus(id, 'banned');
                }
            }
            alert("Bulk Action Completed");
            fetchData();
            setSelectedIds([]);
        } catch (e) { console.error(e); }
        setFormLoading(false);
    };

    const handleMarkPaid = async (id: string) => {
        await handleGenericSave(updateWithdrawalStatus(id, 'paid'), "Marked as Paid", "Payout");
    };

    const handleSaveTask = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleGenericSave(saveAmbassadorTask({...newTaskForm, createdAt: new Date()}), "Task Created", "Task Creation");
        setNewTaskForm({ type: 'Social Share', status: 'Active', assignedTo: 'All' });
    };

    const handleCompleteTenure = async (id: string) => {
        if (!window.confirm("Are you sure? This will graduate the Ambassador to Alumni status and enable their certificate.")) return;
        await handleGenericSave(completeAmbassadorTenure(id), "Ambassador Graduated! Certificate Enabled.", "Ambassador Completion");
    };

    // Member Modal Helpers
    const openMemberModal = (member: Affiliate) => {
        setSelectedMember(member);
        setMemberEditForm(member);
        setModalType('manage_member');
        setIsModalOpen(true);
    };

    const exportToCSV = (data: any[], filename: string) => {
        if (!data || !data.length) return;
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => Object.values(obj).map(v => `"${v}"`).join(',')).join('\n');
        const csvContent = "data:text/csv;charset=utf-8," + headers + '\n' + rows;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- FILTERING ---
    const getFilteredEcosystemList = () => {
        let list = ecosystemApps;
        if (filterBatch !== 'All') {
            if (filterBatch === 'Unassigned') list = list.filter(app => !app.batch);
            else list = list.filter(app => app.batch === filterBatch);
        }
        if (filterStatus !== 'All') {
            list = list.filter(app => app.status.toLowerCase() === filterStatus.toLowerCase());
        }
        if (filterDate) {
            list = list.filter(app => {
                const d = app.createdAt ? new Date(app.createdAt.seconds * 1000).toISOString().split('T')[0] : '';
                return d === filterDate;
            });
        }
        return list;
    };

    const approvedStudents = getFilteredEcosystemList().filter(s => s.status === 'approved');
    const pendingStudents = getFilteredEcosystemList().filter(s => s.status !== 'approved');

    // Community Filter
    const getCommunityList = (type: string) => {
        let list = affiliates.filter(a => a.type === type);
        if (comListFilter === 'pending') return list.filter(a => a.status === 'pending');
        if (comListFilter === 'active') return list.filter(a => a.status === 'approved' || a.status === 'alumni');
        return list;
    };

    // --- NAVIGATION ---
    const navItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
        { id: 'ecosystem', icon: Layers, label: 'Ecosystem' },
        { id: 'community', icon: Users, label: 'Community' },
        { id: 'jobs', icon: Briefcase, label: 'Jobs' },
        { id: 'blogs', icon: BookOpen, label: 'Blogs' },
        { id: 'database', icon: Database, label: 'Database' },
        { id: 'users', icon: UserPlus, label: 'Users' },
        { id: 'employers', icon: Building, label: 'HR & Employers' },
        { id: 'finance', icon: Landmark, label: 'Finance' },
        { id: 'audit', icon: History, label: 'Audit Log' },
    ];

    if (!user || !ADMIN_EMAILS.includes(user.email || '')) return <div className="p-10 text-center">Access Denied</div>;

    return (
        <div className="bg-[#2B2B52] min-h-screen flex font-['Hind_Siliguri'] overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-[#2B2B52] text-white flex flex-col h-screen fixed overflow-y-auto border-r border-white/10">
                <div className="p-6"><img src="https://iili.io/f3k62rG.md.png" className="h-10 brightness-0 invert object-contain" /></div>
                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => {setActiveTab(item.id as any); setGlobalSearch(''); setSearchResults([]);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-white/10 font-bold' : 'hover:bg-white/5 text-slate-400'}`}>
                            <item.icon size={18}/> {item.label}
                        </button>
                    ))}
                </nav>
                <div className="p-4"><button onClick={() => navigate('/')} className="w-full flex items-center gap-2 text-slate-400 hover:text-white p-2"><Home size={18}/> Home</button></div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64 bg-[#F4F7FE] h-screen overflow-y-auto p-8 rounded-l-[30px]">
                {/* Header (Global Search) */}
                <div className="flex justify-between items-center mb-8 relative">
                    <h2 className="text-2xl font-bold text-[#2B3674] capitalize">{activeTab.replace('_', ' ')}</h2>
                    <div className="relative w-96">
                        <div className="bg-white p-2 rounded-full flex items-center shadow-sm border border-slate-200">
                            <Search className="text-slate-400 mx-2" size={20}/>
                            <input className="bg-transparent outline-none flex-1 text-sm text-slate-800" placeholder="Global Search (Name, Phone, ID)..." value={globalSearch} onChange={e => setGlobalSearch(e.target.value)}/>
                        </div>
                        {searchResults.length > 0 && (
                            <div className="absolute top-12 left-0 w-full bg-white rounded-xl shadow-xl z-50 p-2 max-h-64 overflow-y-auto">
                                {searchResults.map((res, i) => (
                                    <div key={i} className="p-2 hover:bg-slate-50 rounded cursor-pointer border-b text-sm">
                                        <p className="font-bold text-[#2B3674]">{res.name} <span className="text-xs text-slate-400">({res.type})</span></p>
                                        <p className="text-xs text-slate-500">{res.phone || res.email}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {loading ? <div className="text-center py-20">Loading...</div> : (
                    <>
                        {/* --- OVERVIEW TAB --- */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-fade-in">
                                {/* Summary Cards & Finance Logic */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:-translate-y-1 transition-transform">
                                        <div>
                                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Students</p>
                                            <h3 className="text-3xl font-bold text-[#2B3674]">{ecosystemApps.length}</h3>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <GraduationCap />
                                        </div>
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:-translate-y-1 transition-transform">
                                        <div>
                                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Users</p>
                                            <h3 className="text-3xl font-bold text-[#2B3674]">{usersList.length}</h3>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                            <Users />
                                        </div>
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:-translate-y-1 transition-transform">
                                        <div>
                                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Affiliates</p>
                                            <h3 className="text-3xl font-bold text-[#2B3674]">{affiliates.length}</h3>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                            <Share2 />
                                        </div>
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:-translate-y-1 transition-transform">
                                        <div>
                                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Community</p>
                                            <h3 className="text-3xl font-bold text-[#2B3674]">{communityMembers.length}</h3>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                                            <Database />
                                        </div>
                                    </div>
                                </div>
                                {/* Finance Overview */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                                        <h4 className="font-bold text-emerald-100 text-sm uppercase tracking-wider mb-4 flex items-center gap-2"><TrendingUp size={18}/> Income Summary</h4>
                                        <div className="flex justify-between items-end">
                                            <div><p className="text-emerald-100 text-xs mb-1">Total Revenue</p><h3 className="text-4xl font-bold">৳{financeData.totalIncome.toLocaleString()}</h3></div>
                                            <div className="text-right bg-white/10 p-3 rounded-xl backdrop-blur-sm"><p className="text-emerald-100 text-xs mb-1">Today</p><h3 className="text-xl font-bold">+ ৳{financeData.todayIncome.toLocaleString()}</h3></div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                                        <h4 className="font-bold text-red-500 text-sm uppercase tracking-wider mb-4 flex items-center gap-2"><TrendingDown size={18}/> Expense Summary</h4>
                                        <div className="flex justify-between items-end">
                                            <div><p className="text-slate-400 text-xs mb-1">Total Expense</p><h3 className="text-4xl font-bold text-slate-800">৳{financeData.totalExpense.toLocaleString()}</h3></div>
                                            <div className="text-right bg-red-50 p-3 rounded-xl"><p className="text-red-500 text-xs mb-1">Today</p><h3 className="text-xl font-bold text-red-600">- ৳{financeData.todayExpense.toLocaleString()}</h3></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- COMMUNITY MANAGEMENT TAB --- */}
                        {activeTab === 'community' && (
                            <div className="space-y-6 animate-fade-in">
                                {/* Sub Navigation */}
                                <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-wrap gap-2">
                                    <button onClick={()=>setCommunitySubTab('affiliate')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${communitySubTab === 'affiliate' ? 'bg-[#2B3674] text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                                        <Share2 size={18}/> Affiliates
                                    </button>
                                    <button onClick={()=>setCommunitySubTab('ambassador')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${communitySubTab === 'ambassador' ? 'bg-[#2B3674] text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                                        <Award size={18}/> Ambassadors
                                    </button>
                                    <button onClick={()=>setCommunitySubTab('tasks')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${communitySubTab === 'tasks' ? 'bg-[#2B3674] text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                                        <CheckSquare size={18}/> Tasks & Meetings
                                    </button>
                                </div>

                                {/* List Filtering Buttons (Inside Affiliate/Ambassador) */}
                                {communitySubTab !== 'tasks' && (
                                    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                        <div className="flex gap-2">
                                            <button onClick={()=>setComListFilter('active')} className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${comListFilter==='active'?'bg-green-50 text-green-600 border-green-200':'text-slate-500 border-slate-200 hover:bg-slate-50'}`}>Active List</button>
                                            <button onClick={()=>setComListFilter('pending')} className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${comListFilter==='pending'?'bg-orange-50 text-orange-600 border-orange-200':'text-slate-500 border-slate-200 hover:bg-slate-50'}`}>Pending Requests</button>
                                        </div>
                                        <div className="flex gap-2">
                                            {selectedIds.length > 0 && (
                                                <>
                                                    <button onClick={()=>handleBulkAction('approve')} className="bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition">Approve ({selectedIds.length})</button>
                                                    <button onClick={()=>handleBulkAction('ban')} className="bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition">Ban ({selectedIds.length})</button>
                                                </>
                                            )}
                                            <button onClick={() => exportToCSV(getCommunityList(communitySubTab === 'affiliate' ? 'Affiliate' : 'Campus Ambassador'), `${communitySubTab}_list`)} className="flex items-center gap-2 text-slate-600 hover:text-[#2B3674] font-bold text-xs"><FileSpreadsheet size={16}/> Export CSV</button>
                                        </div>
                                    </div>
                                )}

                                {/* MAIN TABLE VIEW */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                    {communitySubTab === 'tasks' ? (
                                        // Tasks View
                                        <div className="p-6">
                                            <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-200">
                                                <h4 className="font-bold text-[#2B3674] mb-6 flex items-center gap-2"><CheckSquare size={20}/> Create Task / Meeting</h4>
                                                <form onSubmit={handleSaveTask} className="grid md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                                                            <input className="w-full p-3 border rounded-xl" value={newTaskForm.title || ''} onChange={e=>setNewTaskForm({...newTaskForm, title: e.target.value})} required/>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                                                            <textarea className="w-full p-3 border rounded-xl h-24" value={newTaskForm.description || ''} onChange={e=>setNewTaskForm({...newTaskForm, description: e.target.value})} required/>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                                                            <select className="w-full p-3 border rounded-xl" value={newTaskForm.type} onChange={e=>setNewTaskForm({...newTaskForm, type: e.target.value as any})}>
                                                                <option>Social Share</option><option>Event</option><option>Content</option><option>Meeting</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="flex gap-4">
                                                            <div className="flex-1">
                                                                <label className="text-xs font-bold text-slate-500 uppercase">Points</label>
                                                                <input type="number" className="w-full p-3 border rounded-xl" value={newTaskForm.points || ''} onChange={e=>setNewTaskForm({...newTaskForm, points: Number(e.target.value)})}/>
                                                            </div>
                                                            <div className="flex-1">
                                                                <label className="text-xs font-bold text-slate-500 uppercase">Deadline</label>
                                                                <input type="date" className="w-full p-3 border rounded-xl" value={newTaskForm.deadline || ''} onChange={e=>setNewTaskForm({...newTaskForm, deadline: e.target.value})} required/>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-slate-500 uppercase">Link (Meeting/Resource)</label>
                                                            <input className="w-full p-3 border rounded-xl" value={newTaskForm.link || ''} onChange={e=>setNewTaskForm({...newTaskForm, link: e.target.value})}/>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-slate-500 uppercase">Assign To</label>
                                                            <select className="w-full p-3 border rounded-xl" value={newTaskForm.assignedTo} onChange={e=>setNewTaskForm({...newTaskForm, assignedTo: e.target.value})}>
                                                                <option value="All">All Members</option>
                                                                <option value="Affiliates">All Affiliates</option>
                                                                <option value="Ambassadors">All Ambassadors</option>
                                                            </select>
                                                        </div>
                                                        <button className="w-full bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition">Create & Assign</button>
                                                    </div>
                                                </form>
                                            </div>
                                            
                                            <h4 className="font-bold text-slate-700 mb-4">Active Assignments</h4>
                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {ambassadorTasks.map(task => (
                                                    <div key={task.id} className="p-5 border border-slate-100 rounded-2xl hover:shadow-md transition bg-white relative">
                                                        <div className="flex justify-between mb-2">
                                                            <h5 className="font-bold text-slate-800">{task.title}</h5>
                                                            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold">{task.points} Pts</span>
                                                        </div>
                                                        <p className="text-sm text-slate-500 line-clamp-2">{task.description}</p>
                                                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50">
                                                            <span className="text-xs font-bold text-slate-400">{task.deadline}</span>
                                                            <button onClick={()=>deleteAmbassadorTask(task.id!)} className="text-red-500 text-xs hover:underline">Delete</button>
                                                        </div>
                                                        {task.type === 'Meeting' && <span className="absolute top-2 right-2 bg-blue-100 text-blue-600 text-[10px] px-2 rounded">Meeting</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        // Affiliate/Ambassador List
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                                    <tr>
                                                        <th className="p-4 w-10"><input type="checkbox" onChange={(e) => handleSelectAll(e.target.checked ? getCommunityList(communitySubTab === 'affiliate' ? 'Affiliate' : 'Campus Ambassador').map(a=>a.id!) : [])}/></th>
                                                        <th className="p-4">Name & Contact</th>
                                                        {communitySubTab === 'affiliate' ? (
                                                            <>
                                                                <th className="p-4">Referral Info</th>
                                                                <th className="p-4">Earnings</th>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <th className="p-4">Institution</th>
                                                                <th className="p-4">Joining Date</th>
                                                            </>
                                                        )}
                                                        <th className="p-4">Status</th>
                                                        <th className="p-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getCommunityList(communitySubTab === 'affiliate' ? 'Affiliate' : 'Campus Ambassador').map(member => (
                                                        <tr key={member.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                            <td className="p-4"><input type="checkbox" checked={selectedIds.includes(member.id!)} onChange={() => handleSelect(member.id!)}/></td>
                                                            <td className="p-4">
                                                                <div className="font-bold text-slate-800">{member.name}</div>
                                                                <div className="text-xs text-slate-500">{member.phone}</div>
                                                            </td>
                                                            
                                                            {communitySubTab === 'affiliate' ? (
                                                                <>
                                                                    <td className="p-4">
                                                                        <div className="flex flex-col gap-1">
                                                                            <span className="text-xs text-slate-500">Code: <span className="font-mono font-bold text-blue-600">{member.referralCode || 'N/A'}</span></span>
                                                                            <span className="text-xs text-slate-500">Refs: <span className="font-bold text-slate-700">{member.referralCount || 0}</span></span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-4 font-mono font-bold text-green-600">৳{member.totalEarnings || 0}</td>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <td className="p-4 text-slate-600 font-medium">{member.institution}</td>
                                                                    <td className="p-4 text-xs text-slate-500">{member.startDate ? new Date(member.startDate.seconds * 1000).toLocaleDateString() : 'Pending'}</td>
                                                                </>
                                                            )}

                                                            <td className="p-4">
                                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${member.status==='approved'?'bg-green-100 text-green-600':member.status==='alumni'?'bg-blue-100 text-blue-600':member.status==='pending'?'bg-orange-100 text-orange-600':'bg-red-100 text-red-600'}`}>{member.status}</span>
                                                            </td>
                                                            
                                                            <td className="p-4 text-right flex justify-end gap-2">
                                                                {member.status === 'pending' ? (
                                                                    <button onClick={()=>handleApproveAffiliate(member.id!, member.name)} className="text-green-600 hover:bg-green-50 p-2 rounded flex items-center gap-1 font-bold text-xs border border-green-200"><CheckCircle size={14}/> Approve</button>
                                                                ) : (
                                                                    <>
                                                                        <button onClick={()=>openMemberModal(member)} className="text-blue-600 hover:bg-blue-50 p-2 rounded flex items-center gap-1 font-bold text-xs border border-blue-100">Manage</button>
                                                                        
                                                                        {communitySubTab === 'ambassador' && member.status !== 'alumni' && (
                                                                            <button onClick={()=>handleCompleteTenure(member.id!)} className="text-purple-600 hover:bg-purple-50 p-2 rounded flex items-center gap-1 font-bold text-xs border border-purple-100" title="Mark as Alumni & Enable Certificate">
                                                                                <Award size={14}/> Complete
                                                                            </button>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {getCommunityList(communitySubTab === 'affiliate' ? 'Affiliate' : 'Campus Ambassador').length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-400">No members found.</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* --- ECOSYSTEM TAB (Student Management) --- */}
                        {activeTab === 'ecosystem' && (
                            <div className="animate-fade-in">
                                {/* Beautiful Tabs Navigation */}
                                <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-wrap gap-2">
                                    {[
                                        { id: 'list', label: 'Student List', icon: Users },
                                        { id: 'batch', label: 'Batch Control', icon: BookOpenCheck },
                                        { id: 'routine', label: 'Class Routine', icon: Calendar },
                                        { id: 'attendance', label: 'Attendance', icon: CheckSquare },
                                        { id: 'notice', label: 'Notice Board', icon: Megaphone },
                                        { id: 'cv_resource', label: 'CV & Resources', icon: FileText },
                                    ].map(t => (
                                        <button 
                                            key={t.id} 
                                            onClick={() => setEcoSubTab(t.id as any)} 
                                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                                                ecoSubTab === t.id 
                                                ? 'bg-[#2B3674] text-white shadow-lg scale-105' 
                                                : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                            }`}
                                        >
                                            <t.icon size={18} className={ecoSubTab === t.id ? 'text-white' : 'text-slate-400'}/> {t.label}
                                        </button>
                                    ))}
                                </div>

                                {/* 1. STUDENT LIST (Dual Sections) */}
                                {ecoSubTab === 'list' && (
                                    <div className="space-y-10">
                                        
                                        {/* SECTION 1: Active/Approved Students */}
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                            <h3 className="font-bold text-[#2B3674] text-lg mb-6 flex items-center gap-2">
                                                <div className="bg-green-100 p-2 rounded-lg text-green-600"><CheckCircle size={20}/></div>
                                                Active Students (Approved)
                                            </h3>
                                            
                                            <div className="flex gap-4 mb-6">
                                                <select className="border border-slate-200 p-2.5 rounded-xl bg-white text-slate-800 text-sm outline-none font-bold" value={filterBatch} onChange={e=>setFilterBatch(e.target.value)}>
                                                    <option value="All">All Batches</option>
                                                    {uniqueBatches.map(b=><option key={b}>{b}</option>)}
                                                </select>
                                                <button onClick={() => setFilterBatch('All')} className="text-red-500 text-sm font-bold hover:underline">Reset Filter</button>
                                            </div>

                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-sm border-separate border-spacing-y-2">
                                                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
                                                        <tr>
                                                            <th className="p-4 rounded-l-xl">#</th>
                                                            <th className="p-4">Student</th>
                                                            <th className="p-4">Batch Info</th>
                                                            <th className="p-4">Progress</th>
                                                            <th className="p-4 rounded-r-xl">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {approvedStudents.filter(s => filterBatch === 'All' || s.batch === filterBatch).map((app, idx) => (
                                                            <tr key={app.id} className="bg-white hover:shadow-md transition-all duration-200 group">
                                                                <td className="p-4 border-y border-l border-slate-100 rounded-l-xl font-mono text-slate-400">{idx + 1}</td>
                                                                <td className="p-4 border-y border-slate-100">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                                                                            {app.photoURL ? <img src={app.photoURL} alt="" className="w-full h-full object-cover"/> : app.name.charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-bold text-[#2B3674]">{app.name}</p>
                                                                            <p className="text-xs text-slate-500 font-mono">{app.studentId || 'No ID'}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="p-4 border-y border-slate-100">
                                                                    {app.batch ? (
                                                                        <div>
                                                                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">{app.batch}</span>
                                                                            <p className="text-[10px] text-slate-500 mt-1">Mod: {app.currentModule || 1}</p>
                                                                        </div>
                                                                    ) : <span className="text-red-400 text-xs italic">Unassigned</span>}
                                                                </td>
                                                                <td className="p-4 border-y border-slate-100 text-xs text-slate-600">
                                                                    Att: <span className="font-bold">{app.scores?.attendance || 0}%</span> | Phase: <span className="font-bold">{app.currentPhase || 'N/A'}</span>
                                                                </td>
                                                                <td className="p-4 border-y border-r border-slate-100 rounded-r-xl flex gap-2">
                                                                    <button onClick={() => {setManageStudent(app); setStudentEditForm(app); setModalType('manage_student_full'); setIsModalOpen(true);}} className="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 text-xs font-bold transition-all flex items-center gap-2">
                                                                        <Edit size={14}/> Manage & Edit
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {approvedStudents.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-400">No active students found.</td></tr>}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* SECTION 2: Pending/Rejected (Read Only Payment Info) */}
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                            <h3 className="font-bold text-[#2B3674] text-lg mb-6 flex items-center gap-2">
                                                <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><AlertCircle size={20}/></div>
                                                New Applications (Pending/Rejected)
                                            </h3>
                                            
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-sm border-separate border-spacing-y-2">
                                                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
                                                        <tr>
                                                            <th className="p-4 rounded-l-xl">#</th>
                                                            <th className="p-4">Applicant Info</th>
                                                            <th className="p-4">Payment Details</th>
                                                            <th className="p-4">Status</th>
                                                            <th className="p-4 rounded-r-xl">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {pendingStudents.map((app, idx) => (
                                                            <tr key={app.id} className="bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-200">
                                                                <td className="p-4 border-y border-l border-slate-100 rounded-l-xl font-mono text-slate-400">{idx + 1}</td>
                                                                <td className="p-4 border-y border-slate-100">
                                                                    <p className="font-bold text-slate-800">{app.name}</p>
                                                                    <p className="text-xs text-slate-500">{app.phone}</p>
                                                                    <p className="text-xs text-slate-400">{app.email}</p>
                                                                </td>
                                                                <td className="p-4 border-y border-slate-100">
                                                                    <div className="space-y-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${app.paymentMethod === 'Bkash' ? 'bg-pink-100 text-pink-600' : 'bg-orange-100 text-orange-600'}`}>{app.paymentMethod}</span>
                                                                            <span className="font-mono font-bold text-slate-700">{app.transactionId}</span>
                                                                        </div>
                                                                        <p className="text-xs text-slate-500">Details: {app.paymentDetails || 'N/A'}</p>
                                                                    </div>
                                                                </td>
                                                                <td className="p-4 border-y border-slate-100">
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${app.status==='rejected'?'bg-red-50 text-red-600 border-red-100':'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>{app.status}</span>
                                                                </td>
                                                                <td className="p-4 border-y border-r border-slate-100 rounded-r-xl">
                                                                    <button 
                                                                        onClick={() => {setManageStudent(app); setStudentEditForm(app); setModalType('manage_student_full'); setIsModalOpen(true);}} 
                                                                        className="bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                                                                    >
                                                                        Review & Approve
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {pendingStudents.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-400">No pending applications.</td></tr>}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 2. BATCH CONTROL */}
                                {ecoSubTab === 'batch' && (
                                    <div className="grid md:grid-cols-3 gap-8 animate-fade-in">
                                        <div className="md:col-span-1">
                                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-6">
                                                <h3 className="font-bold text-[#2B3674] mb-6 flex items-center gap-3 text-xl border-b border-slate-100 pb-4">
                                                    <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600"><BookOpenCheck size={24}/></div>
                                                    Update Batch Module
                                                </h3>
                                                <form onSubmit={handleUpdateBatchModule} className="space-y-6">
                                                    <div>
                                                        <label className="text-sm font-bold text-slate-500 mb-2 block uppercase tracking-wide">Target Batch</label>
                                                        <select required className="w-full p-4 border border-slate-200 rounded-2xl bg-white text-slate-800 font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all" value={batchModuleForm.batch} onChange={e=>setBatchModuleForm({...batchModuleForm, batch: e.target.value})}>
                                                            <option value="">Select a Batch</option>
                                                            {uniqueBatches.map(b=><option key={b} value={b}>{b}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-bold text-slate-500 mb-2 block uppercase tracking-wide">Set Current Module</label>
                                                        <select required className="w-full p-4 border border-slate-200 rounded-2xl bg-white text-slate-800 font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all" value={batchModuleForm.moduleId} onChange={e=>setBatchModuleForm({...batchModuleForm, moduleId: Number(e.target.value)})}>
                                                            {MODULES.map(m => (
                                                                <option key={m.id} value={m.id}>{m.title}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="pt-4">
                                                        <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                                                            <CheckCircle size={20}/> Update Module
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                                <h3 className="font-bold text-[#2B3674] mb-6 text-lg border-b border-slate-100 pb-2">Active Batches Status</h3>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left text-sm border-separate border-spacing-y-2">
                                                        <thead>
                                                            <tr className="text-slate-500 text-xs uppercase bg-slate-50 sticky top-0">
                                                                <th className="px-4 py-3 rounded-l-lg">#</th>
                                                                <th className="px-4 py-3">Batch Name</th>
                                                                <th className="px-4 py-3">Current Module</th>
                                                                <th className="px-4 py-3">Phase</th>
                                                                <th className="px-4 py-3 rounded-r-lg">Students</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {batchStatusList.map((batch, idx) => (
                                                                <tr key={idx} className="bg-slate-50 hover:bg-white hover:shadow-sm transition-all rounded-lg">
                                                                    <td className="px-4 py-4 font-mono text-slate-400">{idx + 1}</td>
                                                                    <td className="px-4 py-4">
                                                                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold">{batch.batchName}</span>
                                                                    </td>
                                                                    <td className="px-4 py-4 font-bold text-slate-700">Module {batch.currentModule}</td>
                                                                    <td className="px-4 py-4 text-xs font-bold text-slate-500 uppercase">{batch.currentPhase}</td>
                                                                    <td className="px-4 py-4 font-mono font-bold text-slate-800">{batch.studentCount}</td>
                                                                </tr>
                                                            ))}
                                                            {batchStatusList.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-slate-400">No active batches found.</td></tr>}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 3. ROUTINE */}
                                {ecoSubTab === 'routine' && (
                                    <div className="grid md:grid-cols-3 gap-8 animate-fade-in">
                                        {/* ... Existing Routine Code ... */}
                                        <div className="md:col-span-1">
                                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit sticky top-6">
                                                <h3 className="font-bold text-[#2B3674] mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Calendar size={18}/></div>
                                                    {editingSessionId ? 'Edit Class Session' : 'Schedule Class'}
                                                </h3>
                                                <form onSubmit={handleAddClass} className="space-y-4">
                                                    <select required className="w-full p-3 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={classSessionForm.batch} onChange={e=>setClassSessionForm({...classSessionForm, batch: e.target.value})}>
                                                        <option value="">Select Batch</option>
                                                        {uniqueBatches.map(b=><option key={b} value={b}>{b}</option>)}
                                                    </select>
                                                    <input required placeholder="Topic Name" className="w-full p-3 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={classSessionForm.topic} onChange={e=>setClassSessionForm({...classSessionForm, topic: e.target.value})}/>
                                                    <input required placeholder="Mentor Name" className="w-full p-3 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={classSessionForm.mentorName} onChange={e=>setClassSessionForm({...classSessionForm, mentorName: e.target.value})}/>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <input required type="date" className="w-full p-3 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={classSessionForm.date} onChange={e=>setClassSessionForm({...classSessionForm, date: e.target.value})}/>
                                                        <input required type="time" className="w-full p-3 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={classSessionForm.time} onChange={e=>setClassSessionForm({...classSessionForm, time: e.target.value})}/>
                                                    </div>
                                                    <input placeholder="Zoom/Meet Link" className="w-full p-3 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={classSessionForm.link} onChange={e=>setClassSessionForm({...classSessionForm, link: e.target.value})}/>
                                                    
                                                    <div className="flex gap-2">
                                                        <button className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                                                            {editingSessionId ? 'Update Routine' : 'Add to Routine'}
                                                        </button>
                                                        {editingSessionId && (
                                                            <button type="button" onClick={cancelEditClass} className="px-4 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </div>
                                                </form>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h3 className="font-bold text-[#2B3674] text-lg">Class Routine List</h3>
                                                    <select className="border border-slate-200 p-2 rounded-lg text-xs font-bold bg-white" value={routineFilterBatch} onChange={e=>setRoutineFilterBatch(e.target.value)}>
                                                        <option value="All">All Batches</option>
                                                        {uniqueBatches.map(b=><option key={b}>{b}</option>)}
                                                    </select>
                                                </div>
                                                
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left text-sm border-separate border-spacing-y-2">
                                                        <thead>
                                                            <tr className="text-slate-500 text-xs uppercase">
                                                                <th className="px-4 py-2">#</th>
                                                                <th className="px-4 py-2">Date & Time</th>
                                                                <th className="px-4 py-2">Batch</th>
                                                                <th className="px-4 py-2">Topic & Mentor</th>
                                                                <th className="px-4 py-2">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {classSessions.filter(c => routineFilterBatch === 'All' || c.batch === routineFilterBatch).map((cls, idx) => (
                                                                <tr key={idx} className="bg-slate-50 hover:bg-white hover:shadow-sm transition-all rounded-lg">
                                                                    <td className="px-4 py-3 font-mono text-slate-400">{idx + 1}</td>
                                                                    <td className="px-4 py-3">
                                                                        <div className="font-bold text-slate-700">{cls.date}</div>
                                                                        <div className="text-xs text-slate-500">{cls.time}</div>
                                                                    </td>
                                                                    <td className="px-4 py-3"><span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">{cls.batch}</span></td>
                                                                    <td className="px-4 py-3">
                                                                        <div className="font-bold text-slate-800">{cls.topic}</div>
                                                                        <div className="text-xs text-slate-500">By {cls.mentorName}</div>
                                                                    </td>
                                                                    <td className="px-4 py-3 flex gap-2">
                                                                        <a href={cls.link} target="_blank" className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Video size={16}/></a>
                                                                        <button onClick={() => handleEditClass(cls)} className="text-indigo-500 hover:bg-indigo-50 p-2 rounded"><Edit size={16}/></button>
                                                                        <button onClick={() => deleteClassSession(cls.id!)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {classSessions.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-slate-400">No classes scheduled.</td></tr>}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 4. ATTENDANCE */}
                                {ecoSubTab === 'attendance' && (
                                    <div className="max-w-4xl mx-auto animate-fade-in">
                                        {/* ... Existing Attendance Code ... */}
                                        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm h-full flex flex-col">
                                            <div className="flex flex-wrap justify-between items-center mb-6 pb-4 border-b border-slate-100 gap-4">
                                                <h3 className="font-bold text-[#2B3674] flex items-center gap-2 text-lg">
                                                    <div className="bg-green-100 p-2 rounded-lg text-green-600"><CheckSquare size={20}/></div>
                                                    Attendance Taker
                                                </h3>
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="date" 
                                                        className="border border-slate-200 p-2.5 rounded-xl text-sm bg-white text-slate-800 font-bold focus:ring-2 focus:ring-green-500 outline-none"
                                                        value={attendanceDate}
                                                        onChange={(e) => setAttendanceDate(e.target.value)}
                                                    />
                                                    <select className="border border-slate-200 p-2.5 rounded-xl text-sm bg-white text-slate-800 font-bold focus:ring-2 focus:ring-green-500 outline-none" value={filterBatch} onChange={e=>setFilterBatch(e.target.value)}>
                                                        <option value="All">Select Batch to Start</option>
                                                        {uniqueBatches.map(b=><option key={b}>{b}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            
                                            {filterBatch === 'All' ? (
                                                <div className="text-center py-20 text-slate-400 flex flex-col items-center">
                                                    <Users size={48} className="mb-4 opacity-20"/>
                                                    <p>Please select a batch to mark attendance.</p>
                                                </div>
                                            ) : (
                                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10">
                                                            <tr>
                                                                <th className="p-4 text-left rounded-l-lg">Student Name</th>
                                                                <th className="p-4 text-center">Mark for {attendanceDate}</th>
                                                                <th className="p-4 text-right rounded-r-lg">Success Rate</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {getFilteredEcosystemList().filter(a => a.status === 'approved').map(app => {
                                                                const currentStatus = app.attendanceRecord?.[attendanceDate];
                                                                const totalClasses = app.attendanceRecord ? Object.keys(app.attendanceRecord).length : 0;
                                                                const presentCount = app.attendanceRecord ? Object.values(app.attendanceRecord).filter(s => s === 'Present').length : 0;
                                                                
                                                                return (
                                                                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                                                                        <td className="p-4 font-bold text-slate-700">
                                                                            {app.name}
                                                                            <div className="text-[10px] text-slate-400 font-normal">Total Present: {presentCount}</div>
                                                                        </td>
                                                                        <td className="p-4 flex justify-center gap-3">
                                                                            {currentStatus ? (
                                                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${currentStatus === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                                    {currentStatus}
                                                                                </span>
                                                                            ) : (
                                                                                <>
                                                                                    <button onClick={()=>handleAttendance(app.id!, 'Present')} className="w-12 h-10 rounded-xl bg-green-50 border border-green-100 text-green-600 hover:bg-green-600 hover:text-white font-bold transition-all shadow-sm">P</button>
                                                                                    <button onClick={()=>handleAttendance(app.id!, 'Absent')} className="w-12 h-10 rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-600 hover:text-white font-bold transition-all shadow-sm">A</button>
                                                                                </>
                                                                            )}
                                                                            {currentStatus && <button onClick={()=>handleAttendance(app.id!, currentStatus === 'Present' ? 'Absent' : 'Present')} className="text-xs text-blue-500 hover:underline ml-2">Edit</button>}
                                                                        </td>
                                                                        <td className="p-4 text-right font-bold text-slate-600">{app.scores?.attendance||0}%</td>
                                                                    </tr>
                                                                )
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* 5. NOTICE BOARD */}
                                {ecoSubTab === 'notice' && (
                                    <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
                                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-8 rounded-3xl shadow-xl flex flex-col relative overflow-hidden h-fit">
                                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                                            
                                            <h3 className="font-bold text-xl mb-6 flex items-center gap-3 relative z-10">
                                                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm"><Megaphone size={24}/></div>
                                                {editingNoticeId ? 'Update Notice Log' : 'Send Notice'}
                                            </h3>
                                            
                                            <form onSubmit={handleSendNotice} className="space-y-5 relative z-10 flex-1 flex flex-col">
                                                <div>
                                                    <label className="text-xs font-bold text-purple-200 uppercase tracking-wider mb-2 block">Recipient</label>
                                                    <select className="w-full p-4 rounded-xl text-slate-800 bg-white border-0 focus:ring-4 focus:ring-purple-400/50 outline-none font-bold" value={noticeForm.targetBatch} onChange={e=>setNoticeForm({...noticeForm, targetBatch: e.target.value})}>
                                                        <option value="All">All Students</option>
                                                        {uniqueBatches.map(b=><option key={b} value={b}>{b}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-purple-200 uppercase tracking-wider mb-2 block">Subject</label>
                                                    <input placeholder="Notice Title" className="w-full p-4 rounded-xl text-slate-800 bg-white border-0 focus:ring-4 focus:ring-purple-400/50 outline-none" value={noticeForm.title} onChange={e=>setNoticeForm({...noticeForm, title: e.target.value})}/>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-purple-200 uppercase tracking-wider mb-2 block">Content</label>
                                                    <textarea placeholder="Write your message here..." className="w-full p-4 rounded-xl text-slate-800 bg-white border-0 focus:ring-4 focus:ring-purple-400/50 outline-none h-40 resize-none" value={noticeForm.message} onChange={e=>setNoticeForm({...noticeForm, message: e.target.value})}/>
                                                </div>
                                                
                                                <div className="flex gap-2 mt-auto">
                                                    <button className="flex-1 bg-white text-purple-700 font-bold py-4 rounded-xl hover:bg-purple-50 transition shadow-lg">
                                                        {editingNoticeId ? 'Update Log' : 'Post Notice'}
                                                    </button>
                                                    {editingNoticeId && (
                                                        <button type="button" onClick={cancelEditNotice} className="px-6 py-4 bg-purple-800 text-white font-bold rounded-xl hover:bg-purple-900 transition">
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </form>
                                        </div>

                                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-[600px] flex flex-col">
                                            <h3 className="font-bold text-[#2B3674] mb-4 text-lg border-b border-slate-100 pb-2">Notice History</h3>
                                            <div className="overflow-y-auto custom-scrollbar flex-1">
                                                <table className="w-full text-left text-sm">
                                                    <thead>
                                                        <tr className="text-slate-500 text-xs uppercase bg-slate-50 sticky top-0">
                                                            <th className="px-4 py-3">#</th>
                                                            <th className="px-4 py-3">Title & Batch</th>
                                                            <th className="px-4 py-3">Date</th>
                                                            <th className="px-4 py-3">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {noticesHistory.map((notice, idx) => (
                                                            <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50">
                                                                <td className="px-4 py-3 text-slate-400 font-mono">{idx + 1}</td>
                                                                <td className="px-4 py-3">
                                                                    <div className="font-bold text-slate-800">{notice.title}</div>
                                                                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded">{notice.targetBatch}</span>
                                                                </td>
                                                                <td className="px-4 py-3 text-xs text-slate-500">
                                                                    {notice.createdAt ? new Date(notice.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <button onClick={() => handleEditNotice(notice)} className="text-indigo-500 hover:bg-indigo-50 p-2 rounded"><Edit size={16}/></button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {noticesHistory.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-slate-400">No notices sent yet.</td></tr>}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 6. CV & RESOURCES */}
                                {ecoSubTab === 'cv_resource' && (
                                    <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
                                        {/* Upload Card */}
                                        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                                            <h4 className="font-bold text-[#2B3674] mb-6 flex items-center gap-3 text-lg">
                                                <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Box size={20}/></div>
                                                {editingResourceId ? 'Edit Resource' : 'Upload Resources'}
                                            </h4>
                                            
                                            <form onSubmit={handleAddResource} className="space-y-4">
                                                <input required placeholder="Resource Title" className="w-full border border-slate-200 p-3 rounded-xl bg-white text-slate-800 outline-none focus:ring-2 focus:ring-purple-500" value={resourceForm.title} onChange={e=>setResourceForm({...resourceForm, title: e.target.value})}/>
                                                <input required placeholder="Drive/File Link" className="w-full border border-slate-200 p-3 rounded-xl bg-white text-slate-800 outline-none focus:ring-2 focus:ring-purple-500" value={resourceForm.link} onChange={e=>setResourceForm({...resourceForm, link: e.target.value})}/>
                                                <select className="w-full border border-slate-200 p-3 rounded-xl bg-white text-slate-800 outline-none" value={resourceForm.type} onChange={e=>setResourceForm({...resourceForm, type: e.target.value})}>
                                                    <option value="PDF">PDF Document</option>
                                                    <option value="Video">Video Link</option>
                                                    <option value="Slide">Slide Deck</option>
                                                </select>
                                                
                                                <div className="flex gap-2">
                                                    <button className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition shadow-lg">
                                                        {editingResourceId ? 'Update Resource' : 'Add Resource'}
                                                    </button>
                                                    {editingResourceId && (
                                                        <button type="button" onClick={cancelEditResource} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </form>
                                        </div>

                                        {/* Resource List */}
                                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-[500px] flex flex-col">
                                            <h4 className="font-bold text-[#2B3674] mb-4 text-lg border-b border-slate-100 pb-2">Resource List</h4>
                                            <div className="overflow-y-auto custom-scrollbar flex-1">
                                                <table className="w-full text-left text-sm">
                                                    <thead>
                                                        <tr className="text-slate-500 text-xs uppercase bg-slate-50 sticky top-0">
                                                            <th className="px-4 py-3">#</th>
                                                            <th className="px-4 py-3">Title</th>
                                                            <th className="px-4 py-3">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {resourcesList.map((res, idx) => (
                                                            <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50">
                                                                <td className="px-4 py-3 text-slate-400 font-mono">{idx + 1}</td>
                                                                <td className="px-4 py-3">
                                                                    <div className="font-bold text-slate-800">{res.title}</div>
                                                                    <span className="text-[10px] bg-slate-100 px-2 rounded text-slate-500">{res.type}</span>
                                                                </td>
                                                                <td className="px-4 py-3 flex gap-2">
                                                                    <a href={res.link} target="_blank" className="text-blue-600 p-1 hover:bg-blue-50 rounded"><ExternalLink size={16}/></a>
                                                                    <button onClick={() => handleEditResource(res)} className="text-indigo-500 p-1 hover:bg-indigo-50 rounded"><Edit size={16}/></button>
                                                                    <button onClick={() => deleteResource(res.id)} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {resourcesList.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-slate-400">No resources added.</td></tr>}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Other Tabs (Placeholder for context) */}
                        {(activeTab !== 'overview' && activeTab !== 'ecosystem' && activeTab !== 'community') && (
                            <div className="bg-white p-10 text-center rounded-2xl shadow-sm"><p className="text-slate-500">Module loaded in previous step.</p></div>
                        )}
                    </>
                )}
            </div>

            {/* --- MODALS --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
                    <div className={`bg-white rounded-3xl w-full shadow-2xl flex flex-col max-h-[95vh] animate-fade-in-up ${modalType === 'manage_student_full' || modalType === 'manage_member' ? 'max-w-5xl' : 'max-w-2xl'}`}>
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-xl text-slate-800 capitalize">{modalType?.replace(/_/g, ' ')}</h3>
                            <button onClick={()=>setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"><X size={20}/></button>
                        </div>
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            
                            {/* --- COMMUNITY MEMBER MANAGEMENT MODAL --- */}
                            {modalType === 'manage_member' && selectedMember && (
                                <div className="space-y-8">
                                    <div className="flex gap-6 items-start">
                                        <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden border-4 border-white shadow-lg shrink-0">
                                            {selectedMember.imageUrl ? <img src={selectedMember.imageUrl} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-400">{selectedMember.name.charAt(0)}</div>}
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
                                            <div><label className="text-xs font-bold text-slate-500 uppercase">Name</label><input className="w-full p-2 border rounded" value={memberEditForm.name || ''} onChange={e=>setMemberEditForm({...memberEditForm, name: e.target.value})}/></div>
                                            <div><label className="text-xs font-bold text-slate-500 uppercase">Phone</label><input className="w-full p-2 border rounded" value={memberEditForm.phone || ''} onChange={e=>setMemberEditForm({...memberEditForm, phone: e.target.value})}/></div>
                                            <div><label className="text-xs font-bold text-slate-500 uppercase">Institution</label><input className="w-full p-2 border rounded" value={memberEditForm.institution || ''} onChange={e=>setMemberEditForm({...memberEditForm, institution: e.target.value})}/></div>
                                            <div><label className="text-xs font-bold text-slate-500 uppercase">Type</label><select className="w-full p-2 border rounded" value={memberEditForm.type} onChange={e=>setMemberEditForm({...memberEditForm, type: e.target.value as any})}><option>Affiliate</option><option>Campus Ambassador</option></select></div>
                                            {selectedMember.type === 'Affiliate' && <div><label className="text-xs font-bold text-slate-500 uppercase">Referral Code</label><input className="w-full p-2 border rounded" value={memberEditForm.referralCode || ''} onChange={e=>setMemberEditForm({...memberEditForm, referralCode: e.target.value})}/></div>}
                                        </div>
                                    </div>

                                    {/* Stats Section */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-xl text-center"><p className="text-xs text-slate-500 uppercase">Earnings</p><h3 className="text-2xl font-bold text-green-600">৳{selectedMember.totalEarnings || 0}</h3></div>
                                        <div className="bg-slate-50 p-4 rounded-xl text-center"><p className="text-xs text-slate-500 uppercase">Referrals</p><h3 className="text-2xl font-bold text-blue-600">{selectedMember.referralCount || 0}</h3></div>
                                        <div className="bg-slate-50 p-4 rounded-xl text-center"><p className="text-xs text-slate-500 uppercase">Status</p><h3 className="text-xl font-bold text-slate-800 uppercase">{selectedMember.status}</h3></div>
                                    </div>

                                    {/* Payment History (Affiliate Only) */}
                                    {selectedMember.type === 'Affiliate' && (
                                        <div className="bg-white border border-slate-200 rounded-xl p-6">
                                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><CreditCard size={18}/> Withdrawal History</h4>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-slate-50"><tr><th className="p-2 text-left">Date</th><th className="p-2">Amount</th><th className="p-2">Method</th><th className="p-2">Status</th><th className="p-2">Action</th></tr></thead>
                                                    <tbody>
                                                        {withdrawals.filter(w => w.userId === selectedMember.userId).map(w => (
                                                            <tr key={w.id} className="border-b">
                                                                <td className="p-2">{w.requestDate ? new Date(w.requestDate.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                                                                <td className="p-2 font-bold">৳{w.amount}</td>
                                                                <td className="p-2">{w.method}</td>
                                                                <td className="p-2"><span className={`px-2 py-0.5 rounded text-xs ${w.status==='paid'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{w.status}</span></td>
                                                                <td className="p-2">
                                                                    {w.status === 'pending' && <button onClick={()=>handleMarkPaid(w.id!)} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">Disburse</button>}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {withdrawals.filter(w => w.userId === selectedMember.userId).length === 0 && <tr><td colSpan={5} className="p-4 text-center text-slate-400">No withdrawal history found.</td></tr>}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Task History (Ambassador Only) */}
                                    {selectedMember.type === 'Campus Ambassador' && (
                                        <div className="bg-white border border-slate-200 rounded-xl p-6">
                                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><CheckSquare size={18}/> Assigned Tasks</h4>
                                            <p className="text-slate-500 text-sm">Task submission history will appear here.</p>
                                        </div>
                                    )}

                                    <div className="flex gap-4 pt-4">
                                        <button onClick={()=>handleGenericSave(updateAffiliateStatus(selectedMember.id!, memberEditForm.status || 'approved', memberEditForm.referralCode), "Profile Updated", "Member Edit")} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">Save Changes</button>
                                        <button onClick={()=>setIsModalOpen(false)} className="px-6 py-3 border rounded-xl hover:bg-slate-50 font-bold">Close</button>
                                    </div>
                                </div>
                            )}

                            {/* --- EXISTING ECOSYSTEM STUDENT MODAL --- */}
                            {modalType === 'manage_student_full' && manageStudent && (
                                <form onSubmit={(e) => { 
                                        e.preventDefault(); 
                                        handleGenericSave(updateEcosystemStudent(manageStudent.id!, studentEditForm), "Full Profile Updated", "Ecosystem Edit"); 
                                    }} className="space-y-8">
                                    {/* ... Existing Code for Student Modal ... */}
                                    {/* 1. Identity & Personal */}
                                    <div className="flex gap-6 items-start">
                                        <div className="w-32 h-32 rounded-2xl bg-slate-200 overflow-hidden border-4 border-white shadow-lg shrink-0">
                                            {manageStudent.photoURL ? <img src={manageStudent.photoURL} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-400">{manageStudent.name.charAt(0)}</div>}
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
                                            <div className="col-span-2 md:col-span-1">
                                                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                                                <input className="w-full p-2 border border-slate-200 bg-white rounded-lg font-bold text-slate-800" value={studentEditForm.name || manageStudent.name} onChange={e=>setStudentEditForm({...studentEditForm, name: e.target.value})}/>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">Student ID</label>
                                                <input className="w-full p-2 border border-slate-200 bg-white rounded-lg font-mono text-blue-600 font-bold" value={studentEditForm.studentId || manageStudent.studentId || ''} onChange={e=>setStudentEditForm({...studentEditForm, studentId: e.target.value})}/>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                                                <select className="w-full p-2 border border-slate-200 bg-white rounded-lg font-bold" value={studentEditForm.status || manageStudent.status} onChange={e=>setStudentEditForm({...studentEditForm, status: e.target.value as any})}>
                                                    <option value="pending">Pending</option>
                                                    <option value="approved">Approved</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                                                <input className="w-full p-2 border border-slate-200 bg-white rounded-lg" value={studentEditForm.phone || manageStudent.phone} onChange={e=>setStudentEditForm({...studentEditForm, phone: e.target.value})}/>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                                                <input className="w-full p-2 border border-slate-200 bg-white rounded-lg" value={studentEditForm.email || manageStudent.email} onChange={e=>setStudentEditForm({...studentEditForm, email: e.target.value})}/>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-100 w-full"></div>

                                    {/* 2. Academic & Progress */}
                                    <div>
                                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><BookOpen size={18} className="text-blue-600"/> Academic Progress</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">Batch</label>
                                                <input list="batches" className="w-full p-2 border border-slate-200 bg-white rounded-lg" value={studentEditForm.batch || manageStudent.batch || ''} onChange={e=>setStudentEditForm({...studentEditForm, batch: e.target.value})}/>
                                                <datalist id="batches">{uniqueBatches.map(b=><option key={b} value={b}/>)}</datalist>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">Current Module</label>
                                                <input 
                                                    type="number" 
                                                    className="w-full p-2 border border-slate-200 bg-white rounded-lg" 
                                                    value={studentEditForm.currentModule ?? manageStudent.currentModule ?? 1} 
                                                    onChange={e => {
                                                        const newModule = Number(e.target.value);
                                                        // Recalculate Due when module changes
                                                        const { due } = calculateFinancials(newModule, studentEditForm.totalPaid ?? manageStudent.totalPaid ?? 0);
                                                        setStudentEditForm({
                                                            ...studentEditForm, 
                                                            currentModule: newModule,
                                                            dueAmount: due
                                                        });
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">Phase</label>
                                                <select className="w-full p-2 border border-slate-200 bg-white rounded-lg" value={studentEditForm.currentPhase || manageStudent.currentPhase || 'Learning'} onChange={e=>setStudentEditForm({...studentEditForm, currentPhase: e.target.value as any})}>
                                                    <option>Learning</option><option>Assessment</option><option>Internship</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">Institution</label>
                                                <input className="w-full p-2 border border-slate-200 bg-white rounded-lg" value={studentEditForm.institution || manageStudent.institution || ''} onChange={e=>setStudentEditForm({...studentEditForm, institution: e.target.value})}/>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Payment & Logistics (UPDATED LOGIC) */}
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
                                            <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2"><DollarSign size={18}/> Payment Info (BDT)</h4>
                                            
                                            {/* Auto Calculation Display */}
                                            <div className="mb-4 bg-white/50 p-3 rounded-lg text-xs font-medium text-slate-600 space-y-1 border border-green-200">
                                                <div className="flex justify-between"><span>Admission:</span> <span>৳{ADMISSION_FEE}</span></div>
                                                <div className="flex justify-between"><span>Module Fee (x{studentEditForm.currentModule ?? manageStudent.currentModule ?? 1}):</span> <span>৳{(studentEditForm.currentModule ?? manageStudent.currentModule ?? 1) * MODULE_FEE}</span></div>
                                                <div className="flex justify-between border-t border-green-200 pt-1 font-bold text-green-700"><span>Total Payable:</span> <span>৳{calculateFinancials(studentEditForm.currentModule ?? manageStudent.currentModule ?? 1, 0).totalPayable}</span></div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-bold text-green-700 uppercase">Method</label>
                                                    <input className="w-full p-2 bg-white border border-green-200 rounded-lg" value={studentEditForm.paymentMethod || manageStudent.paymentMethod} onChange={e=>setStudentEditForm({...studentEditForm, paymentMethod: e.target.value as any})}/>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-green-700 uppercase">TrxID</label>
                                                    <input className="w-full p-2 bg-white border border-green-200 rounded-lg font-mono" value={studentEditForm.transactionId || manageStudent.transactionId} onChange={e=>setStudentEditForm({...studentEditForm, transactionId: e.target.value})}/>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-green-700 uppercase">Total Paid (৳)</label>
                                                    <input 
                                                        type="number" 
                                                        className="w-full p-2 bg-white border border-green-200 rounded-lg" 
                                                        value={studentEditForm.totalPaid ?? manageStudent.totalPaid ?? 0} 
                                                        onChange={e => {
                                                            const newPaid = Number(e.target.value);
                                                            const { due } = calculateFinancials(studentEditForm.currentModule ?? manageStudent.currentModule ?? 1, newPaid);
                                                            setStudentEditForm({
                                                                ...studentEditForm,
                                                                totalPaid: newPaid,
                                                                dueAmount: due
                                                            });
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-green-700 uppercase">Due Amount (Auto)</label>
                                                    <input 
                                                        type="number" 
                                                        readOnly
                                                        className="w-full p-2 bg-slate-100 border border-green-200 rounded-lg font-bold text-red-500 cursor-not-allowed" 
                                                        value={studentEditForm.dueAmount ?? manageStudent.dueAmount ?? 0} 
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                                            <h4 className="font-bold text-orange-800 mb-4 flex items-center gap-2"><Box size={18}/> Logistics & Internship</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-xs font-bold text-orange-700 uppercase">Kit Status</label>
                                                    <select className="w-full p-2 bg-white border border-orange-200 rounded-lg" value={studentEditForm.kitStatus || manageStudent.kitStatus} onChange={e=>setStudentEditForm({...studentEditForm, kitStatus: e.target.value as any})}>
                                                        <option>Pending</option><option>Processing</option><option>Shipped</option><option>Delivered</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-orange-700 uppercase">Internship Company</label>
                                                    <input className="w-full p-2 bg-white border border-orange-200 rounded-lg" value={studentEditForm.assignedInternship?.companyName || manageStudent.assignedInternship?.companyName || ''} onChange={e=>setStudentEditForm({...studentEditForm, assignedInternship: {...(studentEditForm.assignedInternship || {} as any), companyName: e.target.value}})}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4. Scores (Optional Edit) */}
                                    <div>
                                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Award size={18} className="text-yellow-500"/> Performance Scores</h4>
                                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                            {['sales', 'communication', 'networking', 'eq', 'attendance', 'assignment'].map(field => (
                                                <div key={field}>
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{field}</label>
                                                    <input 
                                                        type="number" 
                                                        className="w-full p-2 border border-slate-200 bg-white rounded-lg text-center font-bold" 
                                                        value={studentEditForm.scores?.[field as keyof typeof studentEditForm.scores] ?? manageStudent.scores?.[field as keyof typeof manageStudent.scores] ?? 0}
                                                        onChange={e=> {
                                                            const newScores = { ...(studentEditForm.scores || manageStudent.scores), [field]: Number(e.target.value) };
                                                            setStudentEditForm({...studentEditForm, scores: newScores as any});
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <button className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 text-lg">Save All Changes</button>
                                        <button type="button" onClick={()=>setIsModalOpen(false)} className="px-8 py-4 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition border border-slate-200">Cancel</button>
                                    </div>
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