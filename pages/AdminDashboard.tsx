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
import { GoogleGenAI } from "@google/genai";
import { User, Lead, Affiliate, Job, BlogPost, Course, JobInterest, EcosystemApplication, CommunityMember, Instructor, ClassSession } from '../types';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Briefcase, BookOpen, 
    Trash2, X, ChevronLeft, LogOut, Search, Globe, Edit, CheckCircle, XCircle, MousePointerClick, CreditCard, Database, Download, Filter, UserPlus, FileSpreadsheet, Award, Layers, Bell, Calendar, Clock, ChevronRight, Sparkles, Zap, Package, Truck, Phone, ChevronDown, MessageCircle, PieChart, BarChart2, Home, Settings, Users, Share2, Mail, Plus, TrendingUp, FileText, Settings2, Megaphone, DollarSign, CheckSquare, ExternalLink, Video, Wallet, TrendingDown, Percent, AlertCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface AdminDashboardProps {
    user: User | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
    // Admin Configuration
    const ADMIN_EMAILS = ['onewayschool.bd@gmail.com', 'onewayschool.bd@gamil.com'];
    const navigate = useNavigate();

    // Data State
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'community' | 'jobs' | 'blogs' | 'courses' | 'ecosystem' | 'analytics' | 'database' | 'instructors'>('overview');
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [globalSearch, setGlobalSearch] = useState('');
    
    // Core Data
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

    // Community Sub-States
    const [communitySubTab, setCommunitySubTab] = useState<'affiliates' | 'ambassadors'>('affiliates');
    const [taskForm, setTaskForm] = useState({ title: '', description: '', deadline: '', targetGroup: 'Affiliate' });
    const [meetingForm, setMeetingForm] = useState({ title: '', date: '', time: '', link: '', targetGroup: 'Affiliate' });
    const [paymentProcessingId, setPaymentProcessingId] = useState<string | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');

    // Ecosystem Sub-states
    const [ecoSubTab, setEcoSubTab] = useState<'list' | 'classes' | 'kit' | 'payments' | 'notice' | 'batch_control'>('list');
    const [ecoFilterBatch, setEcoFilterBatch] = useState('All');
    
    // Ecosystem Forms
    const [classSessionForm, setClassSessionForm] = useState<ClassSession>({ batch: '', topic: '', mentorName: '', date: '', time: '', link: '' });
    const [noticeForm, setNoticeForm] = useState({ targetBatch: 'All', title: '', message: '' });
    const [batchControlForm, setBatchControlForm] = useState({ batch: '', module: 1 });

    // General Forms State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'job' | 'blog' | 'course' | 'member' | 'ecosystem_grading' | 'assign_internship' | 'instructor' | 'task' | 'meeting' | 'payment' | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Smart Job Parse State
    const [rawJobText, setRawJobText] = useState('');
    const [isParsing, setIsParsing] = useState(false);

    // Specific Forms
    const [newInstructor, setNewInstructor] = useState({ name: '', email: '', password: '', phone: '' });
    const [manageStudent, setManageStudent] = useState<EcosystemApplication | null>(null);
    const [studentEditForm, setStudentEditForm] = useState<Partial<EcosystemApplication>>({});
    const [internshipForm, setInternshipForm] = useState({ companyName: '', role: '', type: 'Online', joiningDate: '', stipend: '' });

    // Community Member specific states
    const [categoryFilter, setCategoryFilter] = useState('All');
    
    const [certGeneratingId, setCertGeneratingId] = useState<string | null>(null);
    const [certMember, setCertMember] = useState<any>(null); // For hidden certificate render
    const adminCertRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Job Management States
    const [jobCategoryFilter, setJobCategoryFilter] = useState('All');
    const [jobDateFilter, setJobDateFilter] = useState('');

    // Analytics Expanded State
    const [expandedJobStats, setExpandedJobStats] = useState<string | null>(null);

    const MEMBER_CATEGORIES = ['Central Team', 'Sub Central Team', 'Division Team', 'District Team', 'Campus Ambassador', 'Volunteer'];
    const JOB_CATEGORIES = ['Engineering', 'Marketing', 'Sales', 'Design', 'HR', 'Finance', 'IT', 'Others'];

    const initialJobState: Job = { title: '', company: '', vacancy: '', deadline: '', jobContext: '', responsibilities: '', employmentStatus: 'Full-time', workplace: 'Work at office', educationalRequirements: '', experienceRequirements: '', additionalRequirements: '', location: '', salary: '', compensationAndBenefits: '', description: '', applyLink: '', category: 'Others' };
    const [newJob, setNewJob] = useState<Job>(initialJobState);
    const [newBlog, setNewBlog] = useState<BlogPost>({ title: '', excerpt: '', author: 'Admin', imageUrl: '', content: '' });
    const [newCourse, setNewCourse] = useState<Course>({ title: '', instructor: '', price: '', duration: '', imageUrl: '', category: '' });
    const [newMember, setNewMember] = useState<CommunityMember>({ name: '', phone: '', email: '', role: '', category: 'Volunteer' });

    // Constants for Fees
    const FEES = {
        admission: 1500,
        module: 2000
    };

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

    // --- Derived Data & Helpers ---
    const uniqueBatches = Array.from(new Set(ecosystemApps.map(app => app.batch).filter(Boolean)));

    // Chart Data Generation (Enrollment per Month)
    const getEnrollmentStats = () => {
        const last6Months = Array.from({length: 6}, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return d.toLocaleString('default', { month: 'short' });
        }).reverse();
        // This is mock data for visual, real implementation would map `ecosystemApps` by date
        return [20, 35, 45, 30, 55, 65]; 
    };
    const enrollmentData = getEnrollmentStats();

    const sanitizeData = (data: any) => {
        const clean: any = {};
        Object.keys(data).forEach(key => { if (data[key] !== undefined) clean[key] = data[key]; });
        return clean;
    };

    // Calculate Payment Details for Single Student
    const calculatePayments = (status: EcosystemApplication['paymentStatus']) => {
        if (!status) return { totalPaid: 0, due: 9500 }; // 1500 + 4*2000
        let total = 0;
        if (status.admission) total += FEES.admission;
        if (status.module1) total += FEES.module;
        if (status.module2) total += FEES.module;
        if (status.module3) total += FEES.module;
        if (status.module4) total += FEES.module;
        return { totalPaid: total, due: 9500 - total };
    };

    // --- Search Filter Logic ---
    const getFilteredData = () => {
        const lowerSearch = globalSearch.toLowerCase();
        
        switch(activeTab) {
            case 'community':
                return affiliates.filter(a => 
                    (communitySubTab === 'affiliates' ? a.type === 'Affiliate' : a.type === 'Campus Ambassador') &&
                    (a.name.toLowerCase().includes(lowerSearch) || a.phone.includes(lowerSearch) || a.institution?.toLowerCase().includes(lowerSearch))
                );
            case 'ecosystem':
                return ecosystemApps.filter(app => 
                    (ecoFilterBatch === 'All' || app.batch === ecoFilterBatch) &&
                    (app.name.toLowerCase().includes(lowerSearch) || 
                     app.phone.includes(lowerSearch) || 
                     app.studentId?.toLowerCase().includes(lowerSearch))
                );
            case 'jobs':
                return jobs.filter(job => 
                    job.title.toLowerCase().includes(lowerSearch) || 
                    job.company.toLowerCase().includes(lowerSearch)
                );
            case 'blogs':
                return blogs.filter(blog => 
                    blog.title.toLowerCase().includes(lowerSearch) || 
                    blog.author.toLowerCase().includes(lowerSearch)
                );
            case 'users':
                return usersList.filter(u => 
                    (u.name || '').toLowerCase().includes(lowerSearch) || 
                    (u.email || '').toLowerCase().includes(lowerSearch)
                );
            case 'database':
                return communityMembers.filter(m => 
                    m.name.toLowerCase().includes(lowerSearch) || 
                    m.phone.includes(lowerSearch)
                );
            default:
                return [];
        }
    };

    const filteredCommunity = activeTab === 'community' ? getFilteredData() as Affiliate[] : [];
    const filteredEcosystemApps = activeTab === 'ecosystem' ? getFilteredData() as EcosystemApplication[] : ecosystemApps;


    // --- Modal Openers ---
    const openNewJobModal = () => { setEditingId(null); setNewJob(initialJobState); setRawJobText(''); setModalType('job'); setIsModalOpen(true); };
    const openEditJobModal = (job: Job) => { setEditingId(job.id || null); setNewJob(job); setModalType('job'); setIsModalOpen(true); };
    const openNewBlogModal = () => { setEditingId(null); setNewBlog({ title: '', excerpt: '', author: 'Admin', imageUrl: '', content: '' }); setModalType('blog'); setIsModalOpen(true); };
    const openEditBlogModal = (blog: BlogPost) => { setEditingId(blog.id || null); setNewBlog(blog); setModalType('blog'); setIsModalOpen(true); };
    const openNewMemberModal = () => { setEditingId(null); setNewMember({ name: '', phone: '', email: '', role: '', category: 'Volunteer' }); setModalType('member'); setIsModalOpen(true); };
    const openEditMemberModal = (m: CommunityMember) => { setEditingId(m.id || null); setNewMember({ ...m, category: m.category || 'Volunteer' }); setModalType('member'); setIsModalOpen(true); };
    const openNewInstructorModal = () => { setNewInstructor({ name: '', email: '', password: '', phone: '' }); setModalType('instructor'); setIsModalOpen(true); };
    
    // Community Modals
    const openTaskModal = (group: string) => { setTaskForm({ title: '', description: '', deadline: '', targetGroup: group }); setModalType('task'); setIsModalOpen(true); };
    const openMeetingModal = (group: string) => { setMeetingForm({ title: '', date: '', time: '', link: '', targetGroup: group }); setModalType('meeting'); setIsModalOpen(true); };
    const openPaymentModal = (affiliate: Affiliate) => { setPaymentProcessingId(affiliate.id || null); setPaymentAmount(affiliate.balance?.toString() || '0'); setModalType('payment'); setIsModalOpen(true); };

    // Ecosystem Modals
    const openManageEcosystemModal = (app: EcosystemApplication) => {
        setManageStudent(app);
        setStudentEditForm({
            name: app.name,
            phone: app.phone,
            email: app.email,
            institution: app.institution,
            batch: app.batch,
            studentId: app.studentId || `OWS-${app.id?.substring(0,4).toUpperCase()}`,
            currentPhase: app.currentPhase || 'Learning',
            scores: app.scores || { sales: 0, communication: 0, networking: 0, eq: 0, attendance: 0, assignment: 0 },
            remarks: app.remarks || '',
            transactionId: app.transactionId,
            paymentMethod: app.paymentMethod,
            paymentDetails: app.paymentDetails,
            paymentStatus: app.paymentStatus || { admission: false, module1: false, module2: false, module3: false, module4: false }
        });
        setModalType('ecosystem_grading');
        setIsModalOpen(true);
    };

    const openAssignInternshipModal = (app: EcosystemApplication) => {
        setManageStudent(app);
        setInternshipForm({ companyName: '', role: '', type: 'Online', joiningDate: '', stipend: '' });
        setModalType('assign_internship');
        setIsModalOpen(true);
    }

    // --- Action Handlers ---
    const handleSmartParse = async () => {
        if (!rawJobText) return;
        setIsParsing(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Extract job details from the following text and return a JSON object ONLY. Keys: title, company, vacancy, deadline, jobContext, responsibilities, employmentStatus, workplace, educationalRequirements, experienceRequirements, additionalRequirements, location, salary, compensationAndBenefits, applyLink, category. Input: ${rawJobText}`;
            const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt, config: { responseMimeType: 'application/json' } });
            const data = JSON.parse(response.text || "{}");
            setNewJob({ ...initialJobState, ...data });
            alert("Auto-filled successfully!");
        } catch (e) { alert("Failed to parse automatically."); }
        setIsParsing(false);
    };

    const handleSaveJob = async (e: React.FormEvent) => {
        e.preventDefault(); if (!user) return; setFormLoading(true);
        try {
            const jobData = { ...sanitizeData(newJob), userId: user.uid, userEmail: user.email || '', postedDate: new Date() };
            if (editingId) await updateJob(editingId, jobData); else await saveJob(jobData);
            setIsModalOpen(false); await fetchData(); alert("Job Saved!");
        } catch (error: any) { alert(`Error: ${error.message}`); } setFormLoading(false);
    };

    const handleSaveBlog = async (e: React.FormEvent) => {
        e.preventDefault(); if (!user) return; setFormLoading(true);
        try {
            const blogData = { ...sanitizeData(newBlog), userId: user.uid, userEmail: user.email || '' };
            if(!editingId) blogData.date = new Date();
            if (editingId) await updateBlogPost(editingId, blogData); else await saveBlogPost(blogData);
            setIsModalOpen(false); await fetchData(); alert("Blog Published!");
        } catch (error: any) { alert(`Error: ${error.message}`); } setFormLoading(false);
    };

    const handleSaveMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const memberData = { ...newMember, userId: auth.currentUser?.uid };
            if (editingId) await updateData('community_members', editingId, memberData); else await saveCommunityMember(memberData);
            setIsModalOpen(false); await fetchData(); alert("Member Saved!");
        } catch(e: any) { alert("Error: " + e.message); }
        setFormLoading(false);
    };

    const handleSaveInstructor = async (e: React.FormEvent) => {
        e.preventDefault(); setFormLoading(true);
        try {
            await createInstructor(newInstructor, newInstructor.password);
            alert("Instructor created!"); setIsModalOpen(false); fetchData();
        } catch (error: any) { alert("Error: " + error.message); } setFormLoading(false);
    };

    const handleSaveEcosystemStudent = async (e: React.FormEvent) => {
        e.preventDefault(); if(!manageStudent?.id) return;
        setFormLoading(true);
        try { await updateEcosystemStudent(manageStudent.id, studentEditForm); setIsModalOpen(false); fetchData(); alert("Updated!"); } catch(e) { alert("Failed"); } setFormLoading(false);
    };

    const handleBatchModuleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!batchControlForm.batch) { alert("Select a batch first"); return; }
        setFormLoading(true);
        try {
            const count = await updateBatchClassDetails(batchControlForm.batch, {
                currentModule: batchControlForm.module,
                moduleStatus: 'In Progress'
            });
            alert(`Updated ${count} students in ${batchControlForm.batch} to Module ${batchControlForm.module}`);
            fetchData();
        } catch(e) { alert("Batch update failed"); }
        setFormLoading(false);
    };

    const handleAssignInternship = async (e: React.FormEvent) => {
        e.preventDefault(); if(!manageStudent?.id) return;
        setFormLoading(true);
        try { await updateEcosystemStudent(manageStudent.id, { assignedInternship: internshipForm, currentPhase: 'Internship' }); setIsModalOpen(false); fetchData(); alert("Assigned!"); } catch(e) { alert("Failed"); } setFormLoading(false);
    };

    const handleSaveClassSession = async (e: React.FormEvent) => {
        e.preventDefault(); setFormLoading(true);
        try { 
            await saveClassSession(classSessionForm); 
            alert("Class Scheduled!"); 
            setClassSessionForm({ batch: '', topic: '', mentorName: '', date: '', time: '', link: '' }); 
            // Important: Fetch data to refresh the list
            fetchData(); 
        } catch(e) { alert("Failed to schedule class"); } 
        setFormLoading(false);
    };

    const handleSendNotice = async (e: React.FormEvent) => {
        e.preventDefault(); if(!noticeForm.title) return;
        setFormLoading(true);
        try { await sendBatchNotice(noticeForm.targetBatch, { title: noticeForm.title, message: noticeForm.message, date: new Date() }); alert("Notice Sent!"); setNoticeForm({ ...noticeForm, title: '', message: '' }); fetchData(); } catch(e) { alert("Failed"); } setFormLoading(false);
    };

    // Community Tasks & Meetings
    const handleBroadcastTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            alert(`Task "${taskForm.title}" broadcasted to ${taskForm.targetGroup}s!`);
            setIsModalOpen(false);
        } catch(e) { alert("Failed to send task"); }
        setFormLoading(false);
    };

    const handleScheduleMeeting = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            alert(`Meeting "${meetingForm.title}" scheduled for ${meetingForm.targetGroup}s!`);
            setIsModalOpen(false);
        } catch(e) { alert("Failed to schedule meeting"); }
        setFormLoading(false);
    };

    const handleDisbursePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!paymentProcessingId) return;
        setFormLoading(true);
        try {
            await updateAffiliateStatus(paymentProcessingId, 'approved'); 
            alert(`Payment of ৳${paymentAmount} disbursed successfully!`);
            setIsModalOpen(false);
            fetchData();
        } catch(e) { alert("Payment failed"); }
        setFormLoading(false);
    }

    const handleDelete = async (type: string, id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            if (type === 'job') await deleteJob(id);
            if (type === 'blog') await deleteBlogPost(id);
            if (type === 'course') await deleteCourse(id);
            if (type === 'member') await deleteCommunityMember(id);
            if (type === 'user') await deleteUserDoc(id);
            if (type === 'class') await deleteClassSession(id);
            await fetchData();
        } catch (error) { alert("Delete failed"); }
    };

    const handleEcosystemStatus = async (id: string, status: string) => {
        try { await updateEcosystemAppStatus(id, status); fetchData(); } catch(e) { alert("Failed"); }
    };

    const updateKitStatus = async (id: string, status: string) => {
        try { await updateEcosystemStudent(id, { kitStatus: status }); fetchData(); } catch(e) { alert("Failed"); }
    };

    const handleAffiliateStatus = async (id: string, status: string, name?: string) => {
        const referralCode = status === 'approved' && name ? name.split(' ')[0].toUpperCase() + Math.floor(100 + Math.random() * 900) : undefined;
        try { await updateAffiliateStatus(id, status, referralCode); fetchData(); } catch(e) { alert("Failed"); }
    };

    // CSV & Certs
    const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'member' | 'job') => { 
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n');
            const newItems: any[] = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                const cols = line.split(','); 
                if (type === 'member' && cols.length >= 2) {
                     newItems.push({ name: cols[0]?.trim(), phone: cols[1]?.trim(), email: cols[2]?.trim() || '', role: cols[3]?.trim() || 'Member', category: cols[4]?.trim() || 'Volunteer', userId: user?.uid, createdAt: new Date() });
                } else if (type === 'job' && cols.length >= 4) {
                    newItems.push({ title: cols[0]?.trim(), company: cols[1]?.trim(), deadline: cols[2]?.trim(), salary: cols[3]?.trim(), location: cols[4]?.trim(), applyLink: cols[5]?.trim(), category: cols[6]?.trim() || 'Others', employmentStatus: 'Full-time', userId: user?.uid, userEmail: user?.email, createdAt: new Date() });
                }
            }
            if (newItems.length > 0) {
                setLoading(true);
                try {
                    if (type === 'member') await bulkSaveCommunityMembers(newItems);
                    if (type === 'job') await bulkSaveJobs(newItems);
                    alert(`${newItems.length} items imported!`); fetchData();
                } catch (e) { alert("Import failed."); }
                setLoading(false);
            }
        };
        reader.readAsText(file);
        if (e.target) e.target.value = '';
    };

    const downloadCsv = () => {
        const headers = ["Name,Phone,Email,Role,Category,Joined Date"];
        const rows = communityMembers.map(m => `"${m.name || ''}","${m.phone || ''}","${m.email || ''}","${m.role || ''}","${m.category || ''}","${m.createdAt ? new Date(m.createdAt.seconds * 1000).toLocaleDateString() : ''}"`);
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
        setCertMember({ ...member, nameForCert: member.name, issueDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) });
        setCertGeneratingId(member.id);
        setTimeout(async () => {
            if (adminCertRef.current) {
                try {
                    const canvas = await html2canvas(adminCertRef.current, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff', width: 1123, height: 794, allowTaint: true });
                    const pdf = new jsPDF('l', 'px', [1123, 794]);
                    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 1123, 794);
                    pdf.save(`Certificate_${member.name}.pdf`);
                } catch (e) { alert("Failed"); }
            }
            setCertGeneratingId(null); setCertMember(null);
        }, 1500);
    };

    // Calculate Total Financials
    const getFinancialSummary = () => {
        let totalRevenue = 0;
        let totalDue = 0;
        let totalStudents = filteredEcosystemApps.length;
        let fullyPaidCount = 0;

        filteredEcosystemApps.forEach(app => {
            const { totalPaid, due } = calculatePayments(app.paymentStatus);
            totalRevenue += totalPaid;
            totalDue += due;
            if (due === 0) fullyPaidCount++;
        });

        return { totalRevenue, totalDue, totalStudents, fullyPaidCount };
    };

    // Filters
    const filteredMembers = communityMembers.filter(m => (categoryFilter === 'All' || m.category === categoryFilter) && (m.name.toLowerCase().includes(globalSearch.toLowerCase()) || m.phone.includes(globalSearch)));
    const filteredUsers = usersList.filter(u => (u.name || '').toLowerCase().includes(globalSearch.toLowerCase()) || (u.email || '').toLowerCase().includes(globalSearch.toLowerCase()) || (u.phone || '').includes(globalSearch)).sort((a, b) => (ADMIN_EMAILS.includes(a.email) ? -1 : 1));
    const filteredJobs = jobs.filter(job => (jobCategoryFilter === 'All' || job.category === jobCategoryFilter) && (jobDateFilter === '' || job.deadline === jobDateFilter) && (job.title.toLowerCase().includes(globalSearch.toLowerCase()) || job.company.toLowerCase().includes(globalSearch.toLowerCase())));
    const jobInterestStats = jobs.map(job => { const clicks = jobInterests.filter(i => i.jobId === job.id); return { ...job, clicks: clicks.length, interestedUsers: clicks.map(c => ({ name: c.userName, email: c.userEmail, date: c.clickedAt })) }; }).sort((a, b) => b.clicks - a.clicks);

    if (!user || !ADMIN_EMAILS.includes(user.email || '')) return <div className="p-10 text-center">Access Denied</div>;

    const navItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
        { id: 'ecosystem', icon: CreditCard, label: 'Ecosystem' },
        { id: 'jobs', icon: Briefcase, label: 'Jobs' },
        { id: 'blogs', icon: BookOpen, label: 'Blogs' },
        { id: 'community', icon: Share2, label: 'Community' },
        { id: 'database', icon: Database, label: 'Database' },
        { id: 'users', icon: Users, label: 'Users' },
        { id: 'analytics', icon: MousePointerClick, label: 'Analytics' },
        { id: 'instructors', icon: UserPlus, label: 'Instructors' }
    ];

    const financialSummary = getFinancialSummary();

    return (
        <div className="bg-[#2B2B52] min-h-screen flex relative overflow-hidden font-['Hind_Siliguri']">
             
             {/* --- SIDEBAR --- */}
             <div className="w-64 h-screen fixed top-0 left-0 z-50 flex flex-col py-6">
                <div className="px-8 mb-8 flex items-center gap-3">
                    <img src="https://iili.io/f3k62rG.md.png" alt="OWS Logo" className="h-10 w-auto brightness-0 invert object-contain" />
                </div>

                <nav className="flex-1 space-y-2 px-4 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <button 
                            key={item.id} 
                            onClick={() => { setActiveTab(item.id as any); setGlobalSearch(''); }} 
                            className={`w-full flex items-center gap-4 px-6 py-3 rounded-full transition-all duration-200 group relative ${activeTab === item.id ? 'bg-white/10 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                            <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                            {activeTab === item.id && <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </button>
                    ))}
                </nav>

                <div className="px-8 mt-4 pt-4 border-t border-white/10">
                    <button onClick={() => navigate('/')} className="flex items-center gap-3 text-slate-400 hover:text-white mb-4 text-sm font-medium"><Home size={18} /> Home Page</button>
                    <button onClick={() => logout()} className="flex items-center gap-3 text-red-400 hover:text-red-300 text-sm font-medium"><LogOut size={18} /> Logout</button>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 ml-64 bg-[#F4F7FE] rounded-l-[40px] h-screen overflow-y-auto relative shadow-2xl">
                <div className="p-8 md:p-10 min-h-full">
                    
                    {/* Top Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-[#2B3674] capitalize">{activeTab.replace('-', ' ')}</h2>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-sm">
                            <div className="relative bg-white border border-slate-200 rounded-full px-4 py-2 flex items-center w-64">
                                <Search size={16} className="text-[#8F9BBA] mr-2"/>
                                <input 
                                    type="text" 
                                    placeholder="Search..." 
                                    value={globalSearch}
                                    onChange={(e) => setGlobalSearch(e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm text-[#2B3674] placeholder-[#8F9BBA] w-full"
                                />
                            </div>
                            <div className="flex items-center gap-3 px-2">
                                <div className="w-8 h-8 rounded-full bg-[#11047A] text-white flex items-center justify-center text-xs font-bold">
                                    {user?.displayName?.charAt(0) || 'A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Body */}
                    {loading ? <div className="text-center py-20 text-slate-500">Loading data...</div> : (
                        <>
                            {/* --- OVERVIEW --- */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {/* Row 1: Summary Cards (5 Items) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                        <div className="bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-sm border border-slate-100">
                                            <div className="bg-[#F4F7FE] p-3 rounded-full"><Users size={24} className="text-[#4318FF]"/></div>
                                            <div><p className="text-xs text-[#A3AED0]">Students</p><h4 className="text-xl font-bold text-[#2B3674]">{ecosystemApps.length}</h4></div>
                                        </div>
                                        <div className="bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-sm border border-slate-100">
                                            <div className="bg-[#F4F7FE] p-3 rounded-full"><Briefcase size={24} className="text-[#4318FF]"/></div>
                                            <div><p className="text-xs text-[#A3AED0]">Total Jobs</p><h4 className="text-xl font-bold text-[#2B3674]">{jobs.length}</h4></div>
                                        </div>
                                        <div className="bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-sm border border-slate-100">
                                            <div className="bg-[#F4F7FE] p-3 rounded-full"><UserPlus size={24} className="text-[#05CD99]"/></div>
                                            <div><p className="text-xs text-[#A3AED0]">Total Users</p><h4 className="text-xl font-bold text-[#2B3674]">{usersList.length}</h4></div>
                                        </div>
                                        <div className="bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-sm border border-slate-100">
                                            <div className="bg-[#F4F7FE] p-3 rounded-full"><Database size={24} className="text-[#FFB547]"/></div>
                                            <div><p className="text-xs text-[#A3AED0]">Community</p><h4 className="text-xl font-bold text-[#2B3674]">{communityMembers.length}</h4></div>
                                        </div>
                                        <div className="bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-sm border border-slate-100">
                                            <div className="bg-[#F4F7FE] p-3 rounded-full"><BookOpen size={24} className="text-[#E31A1A]"/></div>
                                            <div><p className="text-xs text-slate-400">Total Blogs</p><h4 className="text-xl font-bold text-[#2B3674]">{blogs.length}</h4></div>
                                        </div>
                                    </div>

                                    {/* Row 2: Statistics Chart & Recent Users */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Chart (Left) */}
                                        <div className="lg:col-span-2 bg-white rounded-[20px] p-6 shadow-sm border border-slate-100">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-lg font-bold text-[#2B3674]">Monthly Enrollment Statistic</h3>
                                                <button className="bg-[#F4F7FE] p-2 rounded-lg text-[#4318FF]"><BarChart2 size={20}/></button>
                                            </div>
                                            <div className="h-64 flex items-end justify-between gap-4 px-4">
                                                {enrollmentData.map((h, i) => (
                                                    <div key={i} className="flex flex-col items-center gap-2 w-full h-full justify-end group">
                                                        <div className="w-full bg-[#EFF4FB] rounded-t-lg relative h-full flex items-end overflow-hidden">
                                                            <div style={{height: `${h}%`}} className="w-full bg-[#4318FF] rounded-t-lg opacity-80 group-hover:opacity-100 transition-all duration-500"></div>
                                                        </div>
                                                        <span className="text-xs text-[#A3AED0] font-medium">Month {i+1}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Recent Users (Right) */}
                                        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100 overflow-hidden">
                                            <h3 className="text-lg font-bold text-[#2B3674] mb-4">Recent Users</h3>
                                            <div className="space-y-4">
                                                {usersList.slice(0, 5).map(u => (
                                                    <div key={u.id} className="flex items-center gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                                                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                                            <img src={u.photoURL || 'https://via.placeholder.com/40'} className="w-full h-full object-cover"/>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-[#2B3674] text-sm">{u.name}</h4>
                                                            <p className="text-xs text-[#A3AED0]">{u.email}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- ECOSYSTEM TAB --- */}
                            {activeTab === 'ecosystem' && (
                                <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 min-h-[80vh]">
                                    <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-100 pb-4">
                                        {[
                                            {id: 'list', label: 'Student List', icon: Users},
                                            {id: 'batch_control', label: 'Batch Control', icon: Settings2},
                                            {id: 'classes', label: 'Class Schedule', icon: Layers},
                                            {id: 'kit', label: 'Logistics', icon: Package},
                                            {id: 'payments', label: 'Payments & Due', icon: DollarSign},
                                            {id: 'notice', label: 'Notice', icon: Bell}
                                        ].map(tab => (
                                            <button 
                                                key={tab.id}
                                                onClick={() => setEcoSubTab(tab.id as any)}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${ecoSubTab === tab.id ? 'bg-[#4318FF] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                            >
                                                <tab.icon size={16}/> {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Student List */}
                                    {ecoSubTab === 'list' && (
                                        <div className="overflow-x-auto">
                                            <div className="flex justify-end mb-4"><select className="bg-white border border-slate-200 text-sm p-2 rounded-lg text-[#2B3674] font-bold outline-none" value={ecoFilterBatch} onChange={e => setEcoFilterBatch(e.target.value)}><option value="All">All Batches</option>{uniqueBatches.map(b => <option key={b}>{b}</option>)}</select></div>
                                            <table className="w-full text-left text-sm text-[#2B3674]">
                                                <thead className="text-[#A3AED0] border-b border-slate-100"><tr><th className="p-3">SL</th><th className="p-3">Name</th><th className="p-3">Phase</th><th className="p-3">Scores</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
                                                <tbody className="divide-y divide-slate-100">{filteredEcosystemApps.map((app, idx) => (
                                                    <tr key={app.id} className="hover:bg-[#F4F7FE] transition-colors">
                                                        <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                                                        <td className="p-3 font-bold">{app.name}<div className="text-xs text-[#A3AED0] font-normal">{app.studentId || 'N/A'} <br/> {app.phone}</div></td>
                                                        <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${app.currentPhase === 'Internship' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{app.currentPhase || 'Learning'}</span></td>
                                                        <td className="p-3 text-xs">S: {app.scores?.sales || 0} | C: {app.scores?.communication || 0}</td>
                                                        <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${app.status==='approved'?'bg-green-50 text-green-600':'bg-yellow-50 text-yellow-600'}`}>{app.status}</span></td>
                                                        <td className="p-3">{app.status === 'approved' ? <button onClick={() => openManageEcosystemModal(app)} className="bg-blue-50 text-[#4318FF] hover:bg-blue-100 px-3 py-1 rounded text-xs font-bold">View/Edit</button> : <button onClick={() => handleEcosystemStatus(app.id!, 'approved')} className="text-green-500 hover:bg-green-50 p-2 rounded"><CheckCircle size={16}/></button>}</td>
                                                    </tr>
                                                ))}</tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Payments & Due Tab (Revamped UI) */}
                                    {ecoSubTab === 'payments' && (
                                        <div className="space-y-8">
                                            {/* Financial Dashboard Cards */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="bg-gradient-to-br from-[#05CD99] to-[#049f75] p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                                                    <div className="absolute -right-4 -top-4 bg-white/20 w-24 h-24 rounded-full blur-xl"></div>
                                                    <div className="relative z-10">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="p-2 bg-white/20 rounded-lg"><Wallet size={20}/></div>
                                                            <span className="font-bold text-sm uppercase tracking-wide opacity-90">Total Collected</span>
                                                        </div>
                                                        <h3 className="text-3xl font-mono font-bold">৳ {financialSummary.totalRevenue.toLocaleString()}</h3>
                                                        <p className="text-xs mt-2 opacity-80 flex items-center gap-1"><TrendingUp size={12}/> Lifetime Revenue</p>
                                                    </div>
                                                </div>

                                                <div className="bg-gradient-to-br from-[#E31A1A] to-[#b91515] p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                                                    <div className="absolute -right-4 -top-4 bg-white/20 w-24 h-24 rounded-full blur-xl"></div>
                                                    <div className="relative z-10">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="p-2 bg-white/20 rounded-lg"><TrendingDown size={20}/></div>
                                                            <span className="font-bold text-sm uppercase tracking-wide opacity-90">Total Due Amount</span>
                                                        </div>
                                                        <h3 className="text-3xl font-mono font-bold">৳ {financialSummary.totalDue.toLocaleString()}</h3>
                                                        <p className="text-xs mt-2 opacity-80 flex items-center gap-1"><AlertCircle size={12} /> Pending Collections</p>
                                                    </div>
                                                </div>

                                                <div className="bg-gradient-to-br from-[#4318FF] to-[#2B3674] p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                                                    <div className="absolute -right-4 -top-4 bg-white/20 w-24 h-24 rounded-full blur-xl"></div>
                                                    <div className="relative z-10">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="p-2 bg-white/20 rounded-lg"><Percent size={20}/></div>
                                                            <span className="font-bold text-sm uppercase tracking-wide opacity-90">Completion Rate</span>
                                                        </div>
                                                        <div className="flex items-end gap-2">
                                                            <h3 className="text-3xl font-mono font-bold">{Math.round((financialSummary.fullyPaidCount / (financialSummary.totalStudents || 1)) * 100)}%</h3>
                                                            <span className="text-sm mb-1 opacity-80">Fully Paid</span>
                                                        </div>
                                                        <p className="text-xs mt-2 opacity-80">{financialSummary.fullyPaidCount} out of {financialSummary.totalStudents} students</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Advanced Table */}
                                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                                    <h3 className="font-bold text-[#2B3674] flex items-center gap-2"><FileText size={18}/> Student Ledger</h3>
                                                    <select className="bg-white border border-slate-200 text-sm p-2 rounded-lg text-[#2B3674] font-bold outline-none shadow-sm" value={ecoFilterBatch} onChange={e => setEcoFilterBatch(e.target.value)}><option value="All">All Batches</option>{uniqueBatches.map(b => <option key={b}>{b}</option>)}</select>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left text-sm text-[#2B3674] whitespace-nowrap">
                                                        <thead className="text-slate-500 border-b border-slate-200 bg-slate-50 font-bold uppercase text-xs tracking-wider">
                                                            <tr>
                                                                <th className="p-4">SL</th>
                                                                <th className="p-4">Student Info</th>
                                                                <th className="p-4 text-center">Admission</th>
                                                                <th className="p-4 text-center">Mod 1</th>
                                                                <th className="p-4 text-center">Mod 2</th>
                                                                <th className="p-4 text-center">Mod 3</th>
                                                                <th className="p-4 text-center">Mod 4</th>
                                                                <th className="p-4 text-right">Total Paid</th>
                                                                <th className="p-4 text-right">Due</th>
                                                                <th className="p-4 text-center">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {filteredEcosystemApps.map((app, idx) => {
                                                                const p = calculatePayments(app.paymentStatus);
                                                                return (
                                                                    <tr key={app.id} className="hover:bg-blue-50/50 transition-colors group">
                                                                        <td className="p-4 text-slate-400 font-mono">{idx + 1}</td>
                                                                        <td className="p-4">
                                                                            <div className="font-bold text-[#2B3674]">{app.name}</div>
                                                                            <div className="text-xs text-slate-500 font-mono">{app.studentId || 'N/A'}</div>
                                                                        </td>
                                                                        <td className="p-4 text-center">{app.paymentStatus?.admission ? <span className="inline-block w-2 h-2 rounded-full bg-green-500 ring-4 ring-green-100"></span> : <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">DUE</span>}</td>
                                                                        <td className="p-4 text-center">{app.paymentStatus?.module1 ? <span className="inline-block w-2 h-2 rounded-full bg-green-500 ring-4 ring-green-100"></span> : <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">DUE</span>}</td>
                                                                        <td className="p-4 text-center">{app.paymentStatus?.module2 ? <span className="inline-block w-2 h-2 rounded-full bg-green-500 ring-4 ring-green-100"></span> : <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">DUE</span>}</td>
                                                                        <td className="p-4 text-center">{app.paymentStatus?.module3 ? <span className="inline-block w-2 h-2 rounded-full bg-green-500 ring-4 ring-green-100"></span> : <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">DUE</span>}</td>
                                                                        <td className="p-4 text-center">{app.paymentStatus?.module4 ? <span className="inline-block w-2 h-2 rounded-full bg-green-500 ring-4 ring-green-100"></span> : <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">DUE</span>}</td>
                                                                        <td className="p-4 text-right font-mono font-bold text-slate-700">৳{p.totalPaid}</td>
                                                                        <td className="p-4 text-right font-mono font-bold text-red-500">{p.due > 0 ? `৳${p.due}` : '-'}</td>
                                                                        <td className="p-4 text-center"><button onClick={() => openManageEcosystemModal(app)} className="bg-white border border-slate-200 hover:border-blue-500 text-slate-500 hover:text-blue-600 p-2 rounded-lg transition-all shadow-sm"><Edit size={16}/></button></td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ... Other sub-tabs (batch_control, classes, kit, notice) remain same ... */}
                                    {/* Batch Control */}
                                    {ecoSubTab === 'batch_control' && (
                                        <div className="bg-[#F4F7FE] p-6 rounded-2xl">
                                            <h3 className="font-bold text-[#2B3674] mb-4">Set Module for Batch</h3>
                                            <div className="space-y-4 max-w-lg">
                                                <div className="bg-white p-4 rounded-xl border border-slate-200">
                                                    <label className="block text-xs font-bold text-slate-500 mb-2">Select Batch</label>
                                                    <select className="w-full p-3 rounded-lg border border-slate-200 bg-white" value={batchControlForm.batch} onChange={e => setBatchControlForm({...batchControlForm, batch: e.target.value})}>
                                                        <option value="">Select a Batch</option>
                                                        {uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}
                                                    </select>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl border border-slate-200">
                                                    <label className="block text-xs font-bold text-slate-500 mb-2">Select Active Module</label>
                                                    <select className="w-full p-3 rounded-lg border border-slate-200 bg-white" value={batchControlForm.module} onChange={e => setBatchControlForm({...batchControlForm, module: Number(e.target.value)})}>
                                                        <option value={1}>Module 1: Sales & Psychology</option>
                                                        <option value={2}>Module 2: Communication</option>
                                                        <option value={3}>Module 3: Networking</option>
                                                        <option value={4}>Module 4: Corporate Politics</option>
                                                    </select>
                                                </div>
                                                <button onClick={handleBatchModuleUpdate} disabled={formLoading} className="w-full bg-[#4318FF] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#3311CC]">
                                                    {formLoading ? 'Updating...' : 'Update Module for All Students'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {/* Classes */}
                                    {ecoSubTab === 'classes' && (
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            <div className="bg-[#F4F7FE] p-6 rounded-2xl">
                                                <h4 className="font-bold text-[#2B3674] mb-4">Schedule Class</h4>
                                                <form onSubmit={handleSaveClassSession} className="space-y-3">
                                                    <input className="w-full p-3 rounded-xl border border-slate-200 bg-white outline-none text-sm" placeholder="Topic" value={classSessionForm.topic} onChange={e => setClassSessionForm({...classSessionForm, topic: e.target.value})}/>
                                                    <div className="grid grid-cols-2 gap-2"><input type="date" className="p-3 rounded-xl border border-slate-200 bg-white text-sm" value={classSessionForm.date} onChange={e => setClassSessionForm({...classSessionForm, date: e.target.value})}/><input className="p-3 rounded-xl border border-slate-200 bg-white text-sm" placeholder="Time" value={classSessionForm.time} onChange={e => setClassSessionForm({...classSessionForm, time: e.target.value})}/></div>
                                                    <select className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm" value={classSessionForm.batch} onChange={e => setClassSessionForm({...classSessionForm, batch: e.target.value})}><option value="">Select Batch</option>{uniqueBatches.map(b=><option key={b}>{b}</option>)}</select>
                                                    <input className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm" placeholder="Mentor" value={classSessionForm.mentorName} onChange={e => setClassSessionForm({...classSessionForm, mentorName: e.target.value})}/>
                                                    <input className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm" placeholder="Link" value={classSessionForm.link} onChange={e => setClassSessionForm({...classSessionForm, link: e.target.value})}/>
                                                    <button className="w-full bg-[#4318FF] text-white py-3 rounded-xl font-bold text-sm">Schedule</button>
                                                </form>
                                            </div>
                                            <div className="lg:col-span-2 space-y-3">
                                                {classSessions.map(cs => (
                                                    <div key={cs.id} className="bg-white border border-slate-100 p-4 rounded-xl flex justify-between items-center shadow-sm">
                                                        <div><h5 className="font-bold text-[#2B3674]">{cs.topic}</h5><p className="text-xs text-[#A3AED0]">{cs.date} at {cs.time} • {cs.batch}</p></div>
                                                        <button onClick={() => handleDelete('class', cs.id!)} className="text-red-400"><Trash2 size={16}/></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {/* Kit */}
                                    {ecoSubTab === 'kit' && (
                                        <div>
                                            <h3 className="font-bold text-[#2B3674] mb-6 flex items-center gap-2"><Truck size={20}/> Welcome Kit Logistics</h3>
                                            <div className="overflow-x-auto"><table className="w-full text-left text-sm text-[#2B3674]"><thead className="text-[#A3AED0] border-b border-slate-100"><tr><th className="p-4">SL</th><th className="p-4">Student</th><th className="p-4">Current Status</th><th className="p-4">Update</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredEcosystemApps.filter(app => app.status === 'approved').map((app, idx) => (<tr key={app.id}><td className="p-4 text-slate-400">{idx + 1}</td><td className="p-4 font-bold">{app.name}<br/><span className="text-xs text-[#A3AED0]">{app.phone}</span></td><td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${app.kitStatus === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>{app.kitStatus || 'Pending'}</span></td><td className="p-4">
                                                <select className="p-2 border border-slate-200 rounded bg-white text-xs" value={app.kitStatus || 'Pending'} onChange={(e) => updateKitStatus(app.id!, e.target.value)}>
                                                    <option>Pending</option>
                                                    <option>Processing</option>
                                                    <option>Shipped</option>
                                                    <option>Delivered</option>
                                                </select>
                                            </td></tr>))}</tbody></table></div>
                                        </div>
                                    )}
                                    {/* Notice */}
                                    {ecoSubTab === 'notice' && (
                                        <div className="bg-[#F4F7FE] p-6 rounded-2xl">
                                            <h3 className="font-bold text-[#2B3674] mb-4">Broadcast Notice</h3>
                                            <form onSubmit={handleSendNotice} className="space-y-4">
                                                <select className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm" value={noticeForm.targetBatch} onChange={e => setNoticeForm({...noticeForm, targetBatch: e.target.value})}><option value="All">All Approved Students</option>{uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}</select>
                                                <input className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm" placeholder="Title" value={noticeForm.title} onChange={e => setNoticeForm({...noticeForm, title: e.target.value})}/>
                                                <textarea className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm" placeholder="Message" rows={3} value={noticeForm.message} onChange={e => setNoticeForm({...noticeForm, message: e.target.value})}/>
                                                <button className="w-full bg-[#4318FF] text-white py-3 rounded-xl font-bold text-sm">Send Notice</button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* --- ANALYTICS TAB (RESTORED) --- */}
                            {activeTab === 'analytics' && (
                                <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 min-h-[80vh]">
                                    <div className="mb-6 border-b border-slate-100 pb-4 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-bold text-[#2B3674]">Job Application Analytics</h3>
                                            <p className="text-xs text-[#A3AED0]">Track user interest and apply clicks on posted jobs.</p>
                                        </div>
                                        <div className="bg-blue-50 px-4 py-2 rounded-lg text-blue-700 font-bold text-sm">
                                            Total Interests: {jobInterestStats.reduce((sum, job) => sum + job.clicks, 0)}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {jobInterestStats.map(job => (
                                            <div key={job.id} className="border border-slate-100 rounded-xl overflow-hidden">
                                                <div className="bg-[#F4F7FE] p-4 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setExpandedJobStats(expandedJobStats === job.id ? null : job.id!)}>
                                                    <div>
                                                        <h4 className="font-bold text-[#2B3674]">{job.title}</h4>
                                                        <p className="text-xs text-[#A3AED0]">{job.company}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${job.clicks > 0 ? 'bg-[#4318FF] text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                            {job.clicks} Clicks
                                                        </span>
                                                        <ChevronDown size={16} className={`text-[#A3AED0] transition-transform ${expandedJobStats === job.id ? 'rotate-180' : ''}`}/>
                                                    </div>
                                                </div>
                                                {expandedJobStats === job.id && (
                                                    <div className="p-4 bg-white border-t border-slate-100">
                                                        {job.interestedUsers.length > 0 ? (
                                                            <div className="overflow-x-auto">
                                                                <table className="w-full text-left text-sm">
                                                                    <thead className="text-[#A3AED0] bg-[#F4F7FE] text-xs uppercase"><tr><th className="p-3">User Name</th><th className="p-3">Email</th><th className="p-3">Time</th></tr></thead>
                                                                    <tbody className="divide-y divide-slate-100">
                                                                        {job.interestedUsers.map((u,i) => (
                                                                            <tr key={i} className="hover:bg-slate-50">
                                                                                <td className="p-3 text-[#2B3674] font-medium">{u.name}</td>
                                                                                <td className="p-3 text-slate-500">{u.email}</td>
                                                                                <td className="p-3 text-xs text-[#A3AED0] font-mono">{u.date ? new Date(u.date.seconds*1000).toLocaleString() : '-'}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : <p className="text-slate-400 text-sm italic text-center py-4">No clicks recorded yet.</p>}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {jobInterestStats.length === 0 && <p className="text-center text-slate-400 py-10">No job data available.</p>}
                                    </div>
                                </div>
                            )}

                            {/* --- COMMUNITY (LEADS/AFFILIATES/AMBASSADORS) TAB --- */}
                            {activeTab === 'community' && (
                                <div className="space-y-6">
                                    {/* ... Community Content (Kept same as before) ... */}
                                    <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-4 flex gap-4">
                                        <button onClick={() => setCommunitySubTab('affiliates')} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${communitySubTab === 'affiliates' ? 'bg-[#4318FF] text-white shadow-lg' : 'bg-[#F4F7FE] text-[#A3AED0] hover:bg-slate-100'}`}><Share2 size={18}/> Affiliates</button>
                                        <button onClick={() => setCommunitySubTab('ambassadors')} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${communitySubTab === 'ambassadors' ? 'bg-[#4318FF] text-white shadow-lg' : 'bg-[#F4F7FE] text-[#A3AED0] hover:bg-slate-100'}`}><Megaphone size={18}/> Campus Ambassadors</button>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-white p-6 rounded-[20px] shadow-sm border border-slate-100 flex items-center gap-4"><div className="bg-[#F4F7FE] p-4 rounded-full text-[#4318FF]"><Users size={24}/></div><div><p className="text-xs text-[#A3AED0]">Total Members</p><h4 className="text-2xl font-bold text-[#2B3674]">{filteredCommunity.length}</h4></div></div>
                                        <div className="bg-white p-6 rounded-[20px] shadow-sm border border-slate-100 flex items-center gap-4"><div className="bg-[#F4F7FE] p-4 rounded-full text-[#05CD99]"><CheckSquare size={24}/></div><div><p className="text-xs text-[#A3AED0]">Active Tasks</p><h4 className="text-2xl font-bold text-[#2B3674]">0</h4></div></div>
                                        {communitySubTab === 'affiliates' && <div className="bg-white p-6 rounded-[20px] shadow-sm border border-slate-100 flex items-center gap-4"><div className="bg-[#F4F7FE] p-4 rounded-full text-[#FFB547]"><DollarSign size={24}/></div><div><p className="text-xs text-[#A3AED0]">Pending Payments</p><h4 className="text-2xl font-bold text-[#2B3674]">৳ 0</h4></div></div>}
                                    </div>

                                    {/* Main Content Area */}
                                    <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 min-h-[60vh]">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-bold text-[#2B3674]">{communitySubTab === 'affiliates' ? 'Affiliate Management' : 'Ambassador Management'}</h3>
                                            <div className="flex gap-2">
                                                <button onClick={() => openTaskModal(communitySubTab === 'affiliates' ? 'Affiliate' : 'Ambassador')} className="bg-[#F4F7FE] text-[#4318FF] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-100"><CheckSquare size={16}/> Assign Task</button>
                                                <button onClick={() => openMeetingModal(communitySubTab === 'affiliates' ? 'Affiliate' : 'Ambassador')} className="bg-[#F4F7FE] text-[#4318FF] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-100"><Video size={16}/> Schedule Meeting</button>
                                            </div>
                                        </div>

                                        <table className="w-full text-left text-sm text-[#2B3674]">
                                            <thead className="text-[#A3AED0] border-b border-slate-100"><tr><th className="p-4">SL</th><th className="p-4">Name & Contact</th><th className="p-4">{communitySubTab === 'affiliates' ? 'Commission & Earnings' : 'Institution & Role'}</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredCommunity.map((member, idx) => (
                                                    <tr key={member.id} className="hover:bg-[#F4F7FE] transition-colors group">
                                                        <td className="p-4 text-slate-400">{idx + 1}</td>
                                                        <td className="p-4 font-bold"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden"><img src={member.imageUrl || 'https://via.placeholder.com/40'} className="w-full h-full object-cover"/></div><div>{member.name}<div className="text-xs text-[#A3AED0] font-normal">{member.phone}</div></div></div></td>
                                                        <td className="p-4">{communitySubTab === 'affiliates' ? (<div><p className="font-bold text-green-600">Balance: ৳{member.balance || 0}</p><p className="text-xs text-[#A3AED0]">Lifetime: ৳{member.totalEarnings || 0}</p></div>) : (<div><p className="font-bold">{member.institution}</p><p className="text-xs text-[#A3AED0]">Campus Ambassador</p></div>)}</td>
                                                        <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${member.status==='approved'?'bg-green-50 text-green-600':'bg-yellow-50 text-yellow-600'}`}>{member.status}</span></td>
                                                        <td className="p-4 flex gap-2">
                                                            {member.status === 'pending' ? (
                                                                <><button onClick={() => handleAffiliateStatus(member.id!, 'approved', member.name)} className="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100" title="Approve"><CheckCircle size={18}/></button><button onClick={() => handleAffiliateStatus(member.id!, 'rejected')} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100" title="Reject"><XCircle size={18}/></button></>
                                                            ) : (
                                                                <>{communitySubTab === 'affiliates' && <button onClick={() => openPaymentModal(member)} className="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100 font-bold flex items-center gap-1 text-xs"><DollarSign size={16}/> Pay</button>}<button className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100" title="Edit"><Edit size={18}/></button></>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* --- (JOBS, BLOGS, DATABASE, INSTRUCTORS, USERS tabs remain same) ... */}
                            {/* --- JOBS TAB --- */}
                            {activeTab === 'jobs' && (
                                <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 min-h-[80vh]">
                                    <div className="flex justify-between mb-6">
                                        <h3 className="text-lg font-bold text-[#2B3674]">Job Management</h3>
                                        <button onClick={openNewJobModal} className="bg-[#4318FF] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Sparkles size={16}/> Post Job</button>
                                    </div>
                                    <table className="w-full text-left text-sm text-[#2B3674]">
                                        <thead className="text-[#A3AED0] border-b border-slate-100"><tr><th className="p-3">SL</th><th className="p-3">Title</th><th className="p-3">Company</th><th className="p-3">Deadline</th><th className="p-3">Actions</th></tr></thead>
                                        <tbody className="divide-y divide-slate-100">{filteredJobs.map((j, idx) => (
                                            <tr key={j.id} className="hover:bg-[#F4F7FE]">
                                                <td className="p-3 text-slate-400">{idx + 1}</td>
                                                <td className="p-3 font-bold">{j.title}</td>
                                                <td className="p-3">{j.company}</td>
                                                <td className="p-3 text-red-500 font-medium">{j.deadline}</td>
                                                <td className="p-3 flex gap-2"><button onClick={() => openEditJobModal(j)} className="text-[#4318FF]"><Edit size={16}/></button><button onClick={() => handleDelete('job', j.id!)} className="text-red-400"><Trash2 size={16}/></button></td>
                                            </tr>
                                        ))}</tbody>
                                    </table>
                                </div>
                            )}

                            {/* --- BLOGS TAB --- */}
                            {activeTab === 'blogs' && (
                                <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 min-h-[80vh]">
                                    <div className="flex justify-between mb-6">
                                        <h3 className="text-lg font-bold text-[#2B3674]">Blog Management</h3>
                                        <button onClick={openNewBlogModal} className="bg-[#4318FF] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Sparkles size={16}/> Write Blog</button>
                                    </div>
                                    <table className="w-full text-left text-sm text-[#2B3674]">
                                        <thead className="text-[#A3AED0] border-b border-slate-100"><tr><th className="p-3">SL</th><th className="p-3">Title</th><th className="p-3">Author</th><th className="p-3">Actions</th></tr></thead>
                                        <tbody className="divide-y divide-slate-100">{getFilteredData().map((b: any, idx) => (
                                            <tr key={b.id} className="hover:bg-[#F4F7FE]">
                                                <td className="p-3 text-slate-400">{idx + 1}</td>
                                                <td className="p-3 font-bold">{b.title}</td>
                                                <td className="p-3">{b.author}</td>
                                                <td className="p-3 flex gap-2"><button onClick={() => openEditBlogModal(b)} className="text-[#4318FF]"><Edit size={16}/></button><button onClick={() => handleDelete('blog', b.id!)} className="text-red-400"><Trash2 size={16}/></button></td>
                                            </tr>
                                        ))}</tbody>
                                    </table>
                                </div>
                            )}

                            {/* --- DATABASE TAB --- */}
                            {activeTab === 'database' && (
                                <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 min-h-[80vh]">
                                    <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                                        <h3 className="text-lg font-bold text-[#2B3674]">Community Database</h3>
                                        <div className="flex gap-2">
                                            <input type="file" ref={fileInputRef} onChange={(e) => handleCsvUpload(e, 'member')} accept=".csv" className="hidden"/>
                                            <button onClick={() => fileInputRef.current?.click()} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-700 shadow-sm"><FileSpreadsheet size={16}/> Import</button>
                                            <button onClick={downloadCsv} className="bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-700 shadow-sm"><Download size={16}/> Export</button>
                                            <button onClick={openNewMemberModal} className="bg-[#4318FF] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm"><Plus size={16}/> Add Member</button>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mb-4">
                                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="p-2 border border-slate-200 rounded-lg text-sm bg-white"><option value="All">All Categories</option>{MEMBER_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-[#2B3674]">
                                            <thead className="text-[#A3AED0] border-b border-slate-100"><tr><th className="p-3">SL</th><th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3">Category</th><th className="p-3">Actions</th></tr></thead>
                                            <tbody className="divide-y divide-slate-100">{filteredMembers.map((m, idx) => (
                                                <tr key={m.id} className="hover:bg-[#F4F7FE]">
                                                    <td className="p-3 text-slate-400">{idx + 1}</td>
                                                    <td className="p-3 font-bold">{m.name}<br/><span className="text-xs text-[#A3AED0]">{m.phone}</span></td>
                                                    <td className="p-3">{m.role}</td>
                                                    <td className="p-3">{m.category}</td>
                                                    <td className="p-3 flex gap-2"><button onClick={() => openEditMemberModal(m)} className="text-[#4318FF] hover:bg-blue-50 p-1 rounded"><Edit size={16}/></button><button onClick={() => handleDownloadCertificate(m)} className="text-orange-500 hover:bg-orange-50 p-1 rounded"><Award size={16}/></button><button onClick={() => handleDelete('member', m.id!)} className="text-red-400 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button></td>
                                                </tr>
                                            ))}</tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* --- INSTRUCTORS TAB --- */}
                            {activeTab === 'instructors' && (
                                <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 min-h-[80vh]">
                                    <div className="flex justify-between mb-6">
                                        <h3 className="text-lg font-bold text-[#2B3674]">Instructor Management</h3>
                                        <button onClick={openNewInstructorModal} className="bg-[#4318FF] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><UserPlus size={16}/> Add Instructor</button>
                                    </div>
                                    <table className="w-full text-left text-sm text-[#2B3674]">
                                        <thead className="text-[#A3AED0] border-b border-slate-100"><tr><th className="p-3">SL</th><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Joined</th></tr></thead>
                                        <tbody className="divide-y divide-slate-100">{instructors.map((ins, idx) => (
                                            <tr key={ins.id} className="hover:bg-[#F4F7FE]">
                                                <td className="p-3 text-slate-400">{idx + 1}</td>
                                                <td className="p-3 font-bold">{ins.name}</td>
                                                <td className="p-3">{ins.email}</td>
                                                <td className="p-3 text-xs text-[#A3AED0]">{ins.createdAt ? new Date(ins.createdAt.seconds * 1000).toLocaleDateString() : '-'}</td>
                                            </tr>
                                        ))}</tbody>
                                    </table>
                                </div>
                            )}

                            {/* --- USERS TAB --- */}
                            {activeTab === 'users' && (
                                <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 min-h-[80vh]">
                                    <h3 className="text-lg font-bold text-[#2B3674] mb-6">User Management</h3>
                                    <table className="w-full text-left text-sm text-[#2B3674]">
                                        <thead className="text-[#A3AED0] border-b border-slate-100"><tr><th className="p-3">SL</th><th className="p-3">User</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Action</th></tr></thead>
                                        <tbody className="divide-y divide-slate-100">{filteredUsers.map((u, idx) => (
                                            <tr key={u.id} className="hover:bg-[#F4F7FE]">
                                                <td className="p-3 text-slate-400">{idx + 1}</td>
                                                <td className="p-3 font-bold flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden"><img src={u.photoURL || 'https://via.placeholder.com/40'} className="w-full h-full object-cover"/></div> {u.name}</td>
                                                <td className="p-3">{u.email}</td>
                                                <td className="p-3 capitalize">{u.role}</td>
                                                <td className="p-3"><button onClick={() => handleDelete('user', u.id)} className="text-red-400"><Trash2 size={16}/></button></td>
                                            </tr>
                                        ))}</tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Hidden Certificate Template */}
            <div style={{ position: 'absolute', top: -9999, left: -9999 }}>{certMember && <div ref={adminCertRef} className="w-[1123px] h-[794px] bg-white text-slate-900 font-['Hind_Siliguri'] flex flex-col justify-between p-20 border-[8px] border-[#1e3a8a] relative"><div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"><img src="https://iili.io/f3k62rG.md.png" className="w-[600px]"/></div><div className="text-center z-10"><h1 className="text-5xl font-bold text-[#1e3a8a] mb-2">CERTIFICATE</h1><p className="text-xl tracking-widest text-[#DAA520]">OF RECOGNITION</p></div><div className="text-center z-10"><p className="text-xl italic text-slate-500 mb-4">Proudly Presented To</p><h2 className="text-6xl font-bold text-slate-900 border-b-2 border-slate-300 pb-2 inline-block mb-6">{certMember.nameForCert}</h2><p className="text-xl text-slate-600 max-w-3xl mx-auto">For securing a verified position as a <b>{certMember.role}</b> at One Way School.</p></div><div className="flex justify-between items-end z-10 mt-10"><div className="text-center"><p className="font-bold text-slate-900 text-lg">Sifatur Rahman</p><p className="text-sm text-slate-500">Founder</p></div><div className="text-center"><p className="font-bold text-slate-900 text-lg">OWS-{certMember.id?.slice(0,6)}</p><p className="text-sm text-slate-500">Certificate ID</p></div></div></div>}</div>

             {/* Modals - Kept same logic, just updated button colors to match theme */}
             {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#11047A]/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-[20px] w-full max-w-4xl my-8 relative shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center rounded-t-[20px]">
                            <h3 className="text-xl font-bold text-[#2B3674]">{editingId ? 'Edit Content' : 'Manage Content'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-[#A3AED0] hover:text-[#2B3674]"><X size={24}/></button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                             {/* Job Modal (With Smart Auto-Fill) */}
                             {modalType === 'job' && (
                                <div className="space-y-6">
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-4">
                                        <div className="flex items-center gap-2 mb-3 text-[#4318FF] font-bold"><Sparkles size={18}/> Smart Auto-Fill from Text</div>
                                        <textarea value={rawJobText} onChange={(e) => setRawJobText(e.target.value)} placeholder="Paste full job description here..." rows={3} className="w-full p-3 border border-indigo-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#4318FF] outline-none mb-3"/>
                                        <button onClick={handleSmartParse} disabled={isParsing || !rawJobText} className="bg-[#4318FF] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#3311CC] disabled:opacity-50 transition-all">{isParsing ? 'Analyzing...' : <><Zap size={16}/> Auto Fill Form</>}</button>
                                    </div>
                                    <form onSubmit={handleSaveJob} className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Job Title</label><input required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                            <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Company</label><input required value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                            <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Category</label><select value={newJob.category} onChange={e => setNewJob({...newJob, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white">{JOB_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                                            <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Deadline</label><input type="date" required value={newJob.deadline} onChange={e => setNewJob({...newJob, deadline: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                            <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Salary</label><input required value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white" placeholder="e.g. 25k - 35k"/></div>
                                            <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Location</label><input required value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                        </div>
                                        <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Apply Link/Email</label><input required value={newJob.applyLink} onChange={e => setNewJob({...newJob, applyLink: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                        <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Responsibilities</label><textarea rows={3} value={newJob.responsibilities} onChange={e => setNewJob({...newJob, responsibilities: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                        <button disabled={formLoading} type="submit" className="w-full bg-[#4318FF] text-white font-bold py-3 rounded-lg hover:bg-[#3311CC]">{formLoading ? 'Saving...' : 'Save Job'}</button>
                                    </form>
                                </div>
                            )}
                             {/* Blog Modal */}
                             {modalType === 'blog' && (
                                <form onSubmit={handleSaveBlog} className="space-y-4">
                                    <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Title</label><input required value={newBlog.title} onChange={e => setNewBlog({...newBlog, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                    <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Excerpt</label><textarea required rows={2} value={newBlog.excerpt} onChange={e => setNewBlog({...newBlog, excerpt: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                    <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Image URL</label><input required value={newBlog.imageUrl} onChange={e => setNewBlog({...newBlog, imageUrl: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                    <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Content</label><textarea required rows={6} value={newBlog.content} onChange={e => setNewBlog({...newBlog, content: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                    <div className="flex gap-4"><div className="flex-1"><label className="block text-sm font-bold text-[#2B3674] mb-1">Author</label><input value={newBlog.author} onChange={e => setNewBlog({...newBlog, author: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div></div>
                                    <button disabled={formLoading} type="submit" className="w-full bg-[#4318FF] text-white font-bold py-3 rounded-lg hover:bg-[#3311CC]">{formLoading ? 'Saving...' : 'Publish Blog'}</button>
                                </form>
                            )}
                            {/* Ecosystem Grading Modal - Enhanced with All Information */}
                            {modalType === 'ecosystem_grading' && manageStudent && (
                                <form onSubmit={handleSaveEcosystemStudent} className="space-y-6">
                                    {/* Student Basic Info */}
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <h4 className="font-bold text-[#2B3674] mb-3 border-b pb-2">Student Information</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="text-xs font-bold text-[#A3AED0]">Name</label><input className="w-full p-2 border rounded bg-white" value={studentEditForm.name} readOnly/></div>
                                            <div><label className="text-xs font-bold text-[#A3AED0]">Phone</label><input className="w-full p-2 border rounded bg-white" value={studentEditForm.phone} readOnly/></div>
                                            <div><label className="text-xs font-bold text-[#A3AED0]">Email</label><input className="w-full p-2 border rounded bg-white" value={studentEditForm.email} readOnly/></div>
                                            <div><label className="text-xs font-bold text-[#A3AED0]">Institution</label><input className="w-full p-2 border rounded bg-white" value={studentEditForm.institution} readOnly/></div>
                                        </div>
                                    </div>

                                    {/* Payment Status Toggle Section */}
                                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                        <h4 className="font-bold text-green-800 mb-3 border-b border-green-200 pb-2">Payment Status (Admin Control)</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" checked={studentEditForm.paymentStatus?.admission} onChange={e => setStudentEditForm({...studentEditForm, paymentStatus: {...studentEditForm.paymentStatus!, admission: e.target.checked}})} className="w-4 h-4"/>
                                                <label className="text-sm font-bold text-slate-700">Admission Fee (1500)</label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" checked={studentEditForm.paymentStatus?.module1} onChange={e => setStudentEditForm({...studentEditForm, paymentStatus: {...studentEditForm.paymentStatus!, module1: e.target.checked}})} className="w-4 h-4"/>
                                                <label className="text-sm font-bold text-slate-700">Module 1 (2000)</label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" checked={studentEditForm.paymentStatus?.module2} onChange={e => setStudentEditForm({...studentEditForm, paymentStatus: {...studentEditForm.paymentStatus!, module2: e.target.checked}})} className="w-4 h-4"/>
                                                <label className="text-sm font-bold text-slate-700">Module 2 (2000)</label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" checked={studentEditForm.paymentStatus?.module3} onChange={e => setStudentEditForm({...studentEditForm, paymentStatus: {...studentEditForm.paymentStatus!, module3: e.target.checked}})} className="w-4 h-4"/>
                                                <label className="text-sm font-bold text-slate-700">Module 3 (2000)</label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" checked={studentEditForm.paymentStatus?.module4} onChange={e => setStudentEditForm({...studentEditForm, paymentStatus: {...studentEditForm.paymentStatus!, module4: e.target.checked}})} className="w-4 h-4"/>
                                                <label className="text-sm font-bold text-slate-700">Module 4 (2000)</label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Info */}
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <h4 className="font-bold text-blue-800 mb-3 border-b border-blue-200 pb-2">Last Payment Details</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="text-xs font-bold text-blue-600">Trx ID</label><p className="font-mono font-bold">{studentEditForm.transactionId}</p></div>
                                            <div><label className="text-xs font-bold text-blue-600">Method</label><p>{studentEditForm.paymentMethod}</p></div>
                                            <div className="col-span-2"><label className="text-xs font-bold text-blue-600">Details</label><p className="text-sm">{studentEditForm.paymentDetails}</p></div>
                                        </div>
                                    </div>

                                    {/* Academic Control */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-xs font-bold text-[#A3AED0] mb-1">Batch</label><input className="w-full p-2 border rounded bg-white" value={studentEditForm.batch} onChange={e => setStudentEditForm({...studentEditForm, batch: e.target.value})}/></div>
                                        <div><label className="block text-xs font-bold text-[#A3AED0] mb-1">Student ID</label><input className="w-full p-2 border rounded bg-white" value={studentEditForm.studentId} onChange={e => setStudentEditForm({...studentEditForm, studentId: e.target.value})}/></div>
                                        <div><label className="block text-xs font-bold text-[#A3AED0] mb-1">Phase</label><select className="w-full p-2 border rounded bg-white" value={studentEditForm.currentPhase} onChange={e => setStudentEditForm({...studentEditForm, currentPhase: e.target.value as any})}><option>Learning</option><option>Assessment</option><option>Internship</option></select></div>
                                    </div>

                                    {/* Grading */}
                                    <div className="border-t pt-4">
                                        <h4 className="font-bold text-[#2B3674] mb-2">Skill Grading (0-100)</h4>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div><label className="text-xs">Sales</label><input type="number" className="w-full p-2 border rounded bg-white" value={studentEditForm.scores?.sales} onChange={e => setStudentEditForm({...studentEditForm, scores: {...studentEditForm.scores!, sales: Number(e.target.value)}})}/></div>
                                            <div><label className="text-xs">Communication</label><input type="number" className="w-full p-2 border rounded bg-white" value={studentEditForm.scores?.communication} onChange={e => setStudentEditForm({...studentEditForm, scores: {...studentEditForm.scores!, communication: Number(e.target.value)}})}/></div>
                                            <div><label className="text-xs">Attendance %</label><input type="number" className="w-full p-2 border rounded bg-white" value={studentEditForm.scores?.attendance} onChange={e => setStudentEditForm({...studentEditForm, scores: {...studentEditForm.scores!, attendance: Number(e.target.value)}})}/></div>
                                        </div>
                                    </div>
                                    <button className="w-full bg-[#4318FF] text-white font-bold py-3 rounded-lg mt-4 hover:bg-[#3311CC]">Save All Changes</button>
                                </form>
                            )}
                            {/* Internship Assignment Modal */}
                            {modalType === 'assign_internship' && manageStudent && (
                                <form onSubmit={handleAssignInternship} className="space-y-4">
                                    <div className="bg-green-50 p-3 rounded-lg text-sm text-green-800 mb-2">Assigning internship to <strong>{manageStudent.name}</strong></div>
                                    <div><label className="block text-xs font-bold mb-1">Company Name</label><input className="w-full p-2 border rounded bg-white" value={internshipForm.companyName} onChange={e => setInternshipForm({...internshipForm, companyName: e.target.value})}/></div>
                                    <div><label className="block text-xs font-bold mb-1">Role / Position</label><input className="w-full p-2 border rounded bg-white" value={internshipForm.role} onChange={e => setInternshipForm({...internshipForm, role: e.target.value})}/></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-xs font-bold mb-1">Type</label><select className="w-full p-2 border rounded bg-white" value={internshipForm.type} onChange={e => setInternshipForm({...internshipForm, type: e.target.value})}><option>Online</option><option>Offline</option></select></div>
                                        <div><label className="block text-xs font-bold mb-1">Joining Date</label><input type="date" className="w-full p-2 border rounded bg-white" value={internshipForm.joiningDate} onChange={e => setInternshipForm({...internshipForm, joiningDate: e.target.value})}/></div>
                                    </div>
                                    <button className="w-full bg-[#05CD99] text-white font-bold py-2 rounded-lg mt-4">Confirm Assignment</button>
                                </form>
                            )}
                            {/* Community Modals */}
                            {modalType === 'task' && (
                                <form onSubmit={handleBroadcastTask} className="space-y-4">
                                    <h4 className="font-bold text-[#2B3674] mb-2">Assign New Task</h4>
                                    <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Task Title</label><input required className="w-full p-3 border rounded-lg bg-white" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})}/></div>
                                    <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Description</label><textarea required rows={3} className="w-full p-3 border rounded-lg bg-white" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})}/></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Target Group</label><input disabled className="w-full p-3 border rounded-lg bg-slate-50" value={taskForm.targetGroup}/></div>
                                        <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Deadline</label><input type="date" required className="w-full p-3 border rounded-lg bg-white" value={taskForm.deadline} onChange={e => setTaskForm({...taskForm, deadline: e.target.value})}/></div>
                                    </div>
                                    <button className="w-full bg-[#4318FF] text-white font-bold py-3 rounded-lg hover:bg-[#3311CC]">Broadcast Task</button>
                                </form>
                            )}
                            {modalType === 'meeting' && (
                                <form onSubmit={handleScheduleMeeting} className="space-y-4">
                                    <h4 className="font-bold text-[#2B3674] mb-2">Schedule Meeting</h4>
                                    <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Meeting Title</label><input required className="w-full p-3 border rounded-lg bg-white" value={meetingForm.title} onChange={e => setMeetingForm({...meetingForm, title: e.target.value})}/></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Date</label><input type="date" required className="w-full p-3 border rounded-lg bg-white" value={meetingForm.date} onChange={e => setMeetingForm({...meetingForm, date: e.target.value})}/></div>
                                        <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Time</label><input required className="w-full p-3 border rounded-lg bg-white" placeholder="e.g. 8:00 PM" value={meetingForm.time} onChange={e => setMeetingForm({...meetingForm, time: e.target.value})}/></div>
                                    </div>
                                    <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Meeting Link</label><input required className="w-full p-3 border rounded-lg bg-white" placeholder="Google Meet / Zoom" value={meetingForm.link} onChange={e => setMeetingForm({...meetingForm, link: e.target.value})}/></div>
                                    <button className="w-full bg-[#4318FF] text-white font-bold py-3 rounded-lg hover:bg-[#3311CC]">Schedule Meeting</button>
                                </form>
                            )}
                            {modalType === 'payment' && paymentProcessingId && (
                                <form onSubmit={handleDisbursePayment} className="space-y-4">
                                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-yellow-800 text-sm mb-4">
                                        Ensure you have sent the money via Bkash/Nagad before confirming here.
                                    </div>
                                    <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Amount to Disburse</label><input type="number" className="w-full p-3 border rounded-lg bg-white font-bold text-lg" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)}/></div>
                                    <button className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"><DollarSign size={18}/> Confirm Disbursement</button>
                                </form>
                            )}
                            {/* Other Modals (Member, Instructor) */}
                            {modalType === 'member' && (
                                <form onSubmit={handleSaveMember} className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Name</label><input required value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                        <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Phone</label><input required value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                        <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Email</label><input value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                        <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Category</label><select value={newMember.category} onChange={e => setNewMember({...newMember, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white">{MEMBER_CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}</select></div>
                                    </div>
                                    <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Role</label><input required value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                    <button disabled={formLoading} type="submit" className="w-full bg-[#4318FF] text-white font-bold py-3 rounded-lg hover:bg-[#3311CC]">{formLoading ? 'Saving...' : 'Save Member'}</button>
                                </form>
                            )}
                            {modalType === 'instructor' && (
                                <form onSubmit={handleSaveInstructor} className="space-y-4">
                                    <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Name</label><input required value={newInstructor.name} onChange={e => setNewInstructor({...newInstructor, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                    <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Email</label><input required type="email" value={newInstructor.email} onChange={e => setNewInstructor({...newInstructor, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                    <div><label className="block text-sm font-bold text-[#2B3674] mb-1">Password</label><input required type="password" value={newInstructor.password} onChange={e => setNewInstructor({...newInstructor, password: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"/></div>
                                    <button disabled={formLoading} type="submit" className="w-full bg-[#4318FF] text-white font-bold py-3 rounded-lg hover:bg-[#3311CC]">Create Instructor</button>
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
