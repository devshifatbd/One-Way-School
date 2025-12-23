import React, { useState, useEffect, useRef } from 'react';
import { User, EcosystemApplication } from '../types';
import { updateUserProfile, getUserApplications, uploadProfileImage } from '../services/firebase';
import { 
    LayoutDashboard, BookOpen, FileText, CheckSquare, CreditCard, 
    Bell, Search, Calendar as CalendarIcon, LogOut, Edit3, 
    Save, Camera, MapPin, Phone, Briefcase, MessageCircle, GraduationCap,
    Clock, ChevronLeft, ChevronRight
} from 'lucide-react';
import { auth, logout } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

interface UserDashboardProps {
    user: User | null;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'classes' | 'cv' | 'tasks' | 'payment'>('classes');
    const [ecosystemData, setEcosystemData] = useState<EcosystemApplication | null>(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile Form State
    const [profileData, setProfileData] = useState({
        name: '',
        profession: '',
        currentAddress: '',
        phone: '',
        whatsapp: '',
        institution: '',
    });

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.displayName || '',
                profession: user.profession || '',
                currentAddress: user.currentAddress || '',
                phone: user.phone || '',
                whatsapp: user.whatsapp || '',
                institution: user.institution || '',
            });
            fetchEcosystemData();
        } else {
            navigate('/');
        }
    }, [user]);

    const fetchEcosystemData = async () => {
        if (!user) return;
        try {
            const apps = await getUserApplications(user.uid);
            const eco = apps.find(a => a.type === 'Ecosystem Program');
            if (eco) setEcosystemData(eco as EcosystemApplication);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        try {
            await updateUserProfile(user.uid, {
                displayName: profileData.name, // Update auth display name reference if possible
                ...profileData
            });
            setIsEditingProfile(false);
            alert("প্রোফাইল আপডেট হয়েছে!");
        } catch (error) {
            alert("আপডেট ব্যর্থ হয়েছে।");
        }
        setLoading(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!user || !e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setImageUploading(true);
        try {
            await uploadProfileImage(file, user.uid);
            alert("ছবি আপডেট হয়েছে! (পেজ রিফ্রেশ করুন)");
            window.location.reload();
        } catch (error) {
            alert("ছবি আপলোড ব্যর্থ হয়েছে।");
        }
        setImageUploading(false);
    };

    // Calendar Helpers
    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];
        
        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
        }

        const today = new Date();
        const classDates = ecosystemData?.classDates || ['2025-05-10', '2025-05-15', '2025-05-20']; // Mock data or from DB

        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const isToday = i === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
            const hasClass = classDates.includes(dateStr);

            days.push(
                <div key={i} className={`h-8 w-8 flex items-center justify-center rounded-full text-xs font-medium relative ${isToday ? 'bg-blue-600 text-white' : hasClass ? 'bg-orange-100 text-orange-600 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}>
                    {i}
                    {hasClass && <span className="absolute bottom-0.5 w-1 h-1 bg-orange-500 rounded-full"></span>}
                </div>
            );
        }
        return days;
    };

    if (!user) return null;

    // Check if Instructor (Hide Payment)
    const isInstructor = user.role === 'instructor';

    return (
        <div className="bg-[#F8FAFC] min-h-screen font-['Hind_Siliguri'] pt-24 pb-10">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* 1. Left Sidebar (Navigation) */}
                    <div className="lg:col-span-2 hidden lg:block">
                        <div className="sticky top-28 space-y-6">
                            <div className="flex items-center gap-2 mb-8 px-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">L</div>
                                <span className="font-bold text-xl text-slate-800">Lecture.</span>
                            </div>

                            <nav className="space-y-2">
                                <button onClick={() => setActiveTab('classes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'classes' ? 'bg-white text-orange-500 shadow-soft font-bold' : 'text-slate-500 hover:text-slate-800'}`}>
                                    <LayoutDashboard size={20}/> Dashboard
                                </button>
                                <button onClick={() => setActiveTab('classes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'classes' ? 'bg-white text-orange-500 shadow-soft font-bold' : 'text-slate-500 hover:text-slate-800'}`}>
                                    <BookOpen size={20}/> Classes
                                </button>
                                <button onClick={() => setActiveTab('cv')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'cv' ? 'bg-white text-orange-500 shadow-soft font-bold' : 'text-slate-500 hover:text-slate-800'}`}>
                                    <FileText size={20}/> CV Builder
                                </button>
                                <button onClick={() => setActiveTab('tasks')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'tasks' ? 'bg-white text-orange-500 shadow-soft font-bold' : 'text-slate-500 hover:text-slate-800'}`}>
                                    <CheckSquare size={20}/> Tasks/Exam
                                </button>
                                {!isInstructor && (
                                    <button onClick={() => setActiveTab('payment')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'payment' ? 'bg-white text-orange-500 shadow-soft font-bold' : 'text-slate-500 hover:text-slate-800'}`}>
                                        <CreditCard size={20}/> Payment Info
                                    </button>
                                )}
                            </nav>

                            <div className="pt-10">
                                <button onClick={() => logout()} className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-500 transition-colors">
                                    <LogOut size={20}/> Logout
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Nav (Top) */}
                    <div className="lg:hidden col-span-1 bg-white p-4 rounded-xl shadow-sm overflow-x-auto flex gap-4 mb-4">
                        <button onClick={() => setActiveTab('classes')} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'classes' ? 'bg-orange-50 text-orange-600' : 'text-slate-600'}`}>Classes</button>
                        <button onClick={() => setActiveTab('cv')} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'cv' ? 'bg-orange-50 text-orange-600' : 'text-slate-600'}`}>CV</button>
                        <button onClick={() => setActiveTab('tasks')} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'tasks' ? 'bg-orange-50 text-orange-600' : 'text-slate-600'}`}>Tasks</button>
                        {!isInstructor && <button onClick={() => setActiveTab('payment')} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'payment' ? 'bg-orange-50 text-orange-600' : 'text-slate-600'}`}>Payment</button>}
                    </div>

                    {/* 2. Middle Content Area */}
                    <div className="col-span-1 lg:col-span-7 space-y-8">
                        {/* Header */}
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">My Classes .</h1>
                            {ecosystemData && (
                                <p className="text-slate-500 mt-1">Batch: <span className="font-bold text-blue-600">{ecosystemData.batch || 'Pending...'}</span></p>
                            )}
                        </div>

                        {activeTab === 'classes' && (
                            <>
                                {/* Class Cards */}
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border border-slate-100 flex flex-col items-center text-center group cursor-pointer">
                                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                                            <BookOpen size={32}/>
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-lg mb-1">Sales Mastery</h3>
                                        <p className="text-xs text-slate-400 mb-4">4 Task Remaining</p>
                                        <button className="bg-slate-50 text-slate-700 px-6 py-2 rounded-full text-xs font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-colors">View Tasks</button>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border border-slate-100 flex flex-col items-center text-center group cursor-pointer">
                                        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
                                            <MessageCircle size={32}/>
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-lg mb-1">Communication</h3>
                                        <p className="text-xs text-slate-400 mb-4">3 Task Remaining</p>
                                        <button className="bg-slate-50 text-slate-700 px-6 py-2 rounded-full text-xs font-bold hover:bg-amber-50 hover:text-amber-600 transition-colors">View Tasks</button>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border border-slate-100 flex flex-col items-center text-center group cursor-pointer">
                                        <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 mb-4 group-hover:scale-110 transition-transform">
                                            <Briefcase size={32}/>
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-lg mb-1">Networking</h3>
                                        <p className="text-xs text-slate-400 mb-4">No assignment yet</p>
                                        <button className="bg-slate-50 text-slate-700 px-6 py-2 rounded-full text-xs font-bold hover:bg-violet-50 hover:text-violet-600 transition-colors">View Tasks</button>
                                    </div>
                                </div>

                                {/* Today Tasks List */}
                                <div>
                                    <div className="flex items-center gap-6 mb-6 border-b border-slate-200 pb-2">
                                        <h2 className="text-xl font-bold text-slate-800">Today Tasks .</h2>
                                        <div className="flex gap-4 text-sm font-medium text-slate-400">
                                            <button className="text-orange-500 border-b-2 border-orange-500 pb-2 -mb-2.5">Forum</button>
                                            <button className="hover:text-slate-600">To-do</button>
                                            <button className="hover:text-slate-600">Members</button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {[1, 2, 3].map((item) => (
                                            <div key={item} className="bg-white p-4 rounded-2xl flex items-center justify-between group hover:shadow-md transition-all border border-transparent hover:border-slate-100">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item === 1 ? 'bg-emerald-50 text-emerald-600' : item === 2 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                                        <FileText size={20}/>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-sm">Submit Project Proposal</h4>
                                                        <p className="text-xs text-slate-400">Communication • Mrs. Diana Smith</p>
                                                    </div>
                                                </div>
                                                <button className={`px-4 py-2 rounded-full text-xs font-bold ${item === 1 ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                                    {item === 1 ? '+ Add or Create' : 'Mark as Done'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'cv' && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm text-center border border-slate-200">
                                <FileText size={48} className="text-slate-300 mx-auto mb-4"/>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">CV Builder Coming Soon</h3>
                                <p className="text-slate-500">We are building an awesome tool for you.</p>
                            </div>
                        )}

                        {activeTab === 'tasks' && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                                <h3 className="text-xl font-bold text-slate-800 mb-6">Upcoming Exams & Tests</h3>
                                <div className="space-y-4">
                                    <div className="p-4 border rounded-xl flex justify-between items-center">
                                        <div>
                                            <h4 className="font-bold text-slate-800">Sales Pitch Deck</h4>
                                            <p className="text-xs text-slate-500">Due: 25th May</p>
                                        </div>
                                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Pending</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'payment' && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                                <h3 className="text-xl font-bold text-slate-800 mb-6">Payment Information</h3>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-slate-50 p-4 rounded-xl">
                                        <p className="text-slate-500 text-xs uppercase">Paid</p>
                                        <p className="text-2xl font-bold text-slate-800">৳ {ecosystemData?.paidAmount || '3,500'}</p>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-xl">
                                        <p className="text-red-500 text-xs uppercase">Due</p>
                                        <p className="text-2xl font-bold text-red-600">৳ {ecosystemData?.dueAmount || '0'}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500">Next payment date: <strong>5th June</strong></p>
                            </div>
                        )}
                    </div>

                    {/* 3. Right Sidebar (Calendar & Profile) */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Search & Profile Header */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="relative flex-1">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                                <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-white rounded-full text-sm outline-none border border-transparent focus:border-slate-200 shadow-sm text-slate-600 placeholder-slate-300"/>
                            </div>
                            <div className="relative group cursor-pointer" onClick={() => setIsEditingProfile(true)}>
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
                                    <img src={user.photoURL || 'https://via.placeholder.com/150'} alt="Profile" className="w-full h-full object-cover"/>
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                            </div>
                        </div>

                        {/* Calendar Widget */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-800 text-lg">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                                <div className="flex gap-2">
                                    <button onClick={prevMonth} className="p-1 hover:bg-slate-200 rounded"><ChevronLeft size={16}/></button>
                                    <button onClick={nextMonth} className="p-1 hover:bg-slate-200 rounded"><ChevronRight size={16}/></button>
                                </div>
                            </div>
                            
                            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                                <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
                                    <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
                                </div>
                                <div className="grid grid-cols-7 gap-1 place-items-center">
                                    {renderCalendar()}
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Classes */}
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg mb-4">Upcoming .</h3>
                            <div className="space-y-4">
                                <div className="flex gap-4 items-start group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-orange-500 mb-1"></div>
                                        <div className="w-0.5 h-full bg-slate-100 group-last:hidden"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">Psychology Exam</h4>
                                        <p className="text-xs text-slate-400">19 Jan • 45 Minutes</p>
                                    </div>
                                    <div className="ml-auto bg-blue-50 p-2 rounded-lg text-blue-600"><Clock size={16}/></div>
                                </div>
                                <div className="flex gap-4 items-start group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500 mb-1"></div>
                                        <div className="w-0.5 h-full bg-slate-100 group-last:hidden"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">Mathematics Theory</h4>
                                        <p className="text-xs text-slate-400">20-21 Jan • 3 Hours</p>
                                    </div>
                                    <div className="ml-auto bg-yellow-50 p-2 rounded-lg text-yellow-600"><FileText size={16}/></div>
                                </div>
                            </div>
                            <button className="text-orange-500 text-sm font-bold mt-4 hover:underline">View all upcoming ></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditingProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-2xl my-8 p-6 md:p-8 relative shadow-2xl">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Edit3 size={24}/> প্রোফাইল এডিট</h3>
                        
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <img src={user.photoURL || 'https://via.placeholder.com/150'} className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-md"/>
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white"/>
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*"/>
                            {imageUploading && <p className="text-xs text-blue-600 mt-2">Uploading...</p>}
                        </div>

                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">নাম</label>
                                    <input value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-slate-50"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">প্রফেশন</label>
                                    <input value={profileData.profession} onChange={e => setProfileData({...profileData, profession: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-slate-50" placeholder="Student / Job Holder"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">মোবাইল নম্বর</label>
                                    <input value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-slate-50"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">হোয়াটসঅ্যাপ নম্বর</label>
                                    <input value={profileData.whatsapp} onChange={e => setProfileData({...profileData, whatsapp: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-slate-50"/>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">বর্তমান ঠিকানা</label>
                                    <input value={profileData.currentAddress} onChange={e => setProfileData({...profileData, currentAddress: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-slate-50"/>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">শিক্ষা প্রতিষ্ঠান</label>
                                    <input value={profileData.institution} onChange={e => setProfileData({...profileData, institution: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-slate-50"/>
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                                <button type="button" onClick={() => setIsEditingProfile(false)} className="px-6 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100">বাতিল</button>
                                <button type="submit" disabled={loading} className="px-8 py-2 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
                                    {loading ? 'সংরক্ষণ হচ্ছে...' : <><Save size={18}/> সংরক্ষণ করুন</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
