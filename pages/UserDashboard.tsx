import React, { useState, useEffect, useRef } from 'react';
import { User, EcosystemApplication } from '../types';
import { updateUserProfile, getUserApplications, uploadProfileImage } from '../services/firebase';
import { 
    LayoutDashboard, BookOpen, FileText, CheckSquare, CreditCard, 
    Bell, Search, Calendar as CalendarIcon, LogOut, Edit3, 
    Save, Camera, MapPin, Phone, Briefcase, MessageCircle, GraduationCap,
    Clock, ChevronLeft, ChevronRight, User as UserIcon
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
                displayName: profileData.name,
                ...profileData
            });
            setIsEditingProfile(false);
            alert("প্রোফাইল আপডেট হয়েছে!");
            window.location.reload(); // Quick refresh to update state fully
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

    const renderCalendar = () => {
        const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];
        
        for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);

        const today = new Date();
        const classDates = ecosystemData?.classDates || ['2025-05-10', '2025-05-15', '2025-05-20']; 

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
    const isInstructor = user.role === 'instructor';

    return (
        <div className="bg-[#F8FAFC] min-h-screen font-['Hind_Siliguri'] pt-24 pb-10">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left Sidebar */}
                    <div className="lg:col-span-2 hidden lg:block">
                        <div className="sticky top-28 space-y-6">
                            <div className="flex items-center gap-2 mb-8 px-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">L</div>
                                <span className="font-bold text-xl text-slate-800">Lecture.</span>
                            </div>
                            <nav className="space-y-2">
                                <button onClick={() => setActiveTab('classes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'classes' ? 'bg-white text-orange-500 shadow-soft font-bold' : 'text-slate-500 hover:text-slate-800'}`}><BookOpen size={20}/> Classes</button>
                                <button onClick={() => setActiveTab('cv')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'cv' ? 'bg-white text-orange-500 shadow-soft font-bold' : 'text-slate-500 hover:text-slate-800'}`}><FileText size={20}/> CV Builder</button>
                                <button onClick={() => setActiveTab('tasks')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'tasks' ? 'bg-white text-orange-500 shadow-soft font-bold' : 'text-slate-500 hover:text-slate-800'}`}><CheckSquare size={20}/> Tasks/Exam</button>
                                {!isInstructor && <button onClick={() => setActiveTab('payment')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'payment' ? 'bg-white text-orange-500 shadow-soft font-bold' : 'text-slate-500 hover:text-slate-800'}`}><CreditCard size={20}/> Payment</button>}
                            </nav>
                            <div className="pt-10"><button onClick={() => logout()} className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-500 transition-colors"><LogOut size={20}/> Logout</button></div>
                        </div>
                    </div>

                    {/* Middle Content */}
                    <div className="col-span-1 lg:col-span-7 space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">My Dashboard .</h1>
                            <p className="text-slate-500 mt-1">Welcome back, <span className="font-bold text-blue-600">{user.displayName}</span></p>
                        </div>

                        {activeTab === 'classes' && (
                             <div className="space-y-8">
                                <div className="grid md:grid-cols-3 gap-6">
                                    {['Sales Mastery', 'Business Comm', 'Networking'].map((title, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center group cursor-pointer hover:shadow-md transition-all">
                                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4"><BookOpen size={28}/></div>
                                            <h3 className="font-bold text-slate-800 text-lg mb-1">{title}</h3>
                                            <p className="text-xs text-slate-400 mb-4">Module {idx+1}</p>
                                            <button className="bg-slate-50 text-slate-700 px-6 py-2 rounded-full text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors">View Details</button>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 mb-4">Today's Tasks</h2>
                                    <div className="space-y-3">
                                        {[1, 2].map(i => (
                                            <div key={i} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-transparent hover:border-slate-100 shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><FileText size={20}/></div>
                                                    <div><h4 className="font-bold text-slate-800 text-sm">Submit Assignment {i}</h4><p className="text-xs text-slate-400">Due Today</p></div>
                                                </div>
                                                <button className="px-4 py-2 rounded-full text-xs font-bold bg-slate-50 text-slate-500">Mark Done</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             </div>
                        )}
                        {activeTab === 'cv' && <div className="bg-white p-10 rounded-3xl text-center"><FileText size={48} className="mx-auto text-slate-300 mb-4"/><h3 className="text-xl font-bold">CV Builder Coming Soon</h3></div>}
                        {activeTab === 'payment' && (
                            <div className="bg-white p-8 rounded-3xl border border-slate-200">
                                <h3 className="text-xl font-bold mb-6">Payment Status</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-green-50 p-4 rounded-xl"><p className="text-xs text-green-600 font-bold uppercase">Paid</p><p className="text-2xl font-bold text-slate-800">৳ {ecosystemData?.paidAmount || '3,500'}</p></div>
                                    <div className="bg-red-50 p-4 rounded-xl"><p className="text-xs text-red-600 font-bold uppercase">Due</p><p className="text-2xl font-bold text-slate-800">৳ {ecosystemData?.dueAmount || '0'}</p></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar (Profile & Calendar) */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Profile Card */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center relative group">
                            <div className="relative inline-block mb-3">
                                <img src={user.photoURL || 'https://via.placeholder.com/150'} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-md"/>
                                <button onClick={() => setIsEditingProfile(true)} className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition-colors shadow-sm"><Edit3 size={14}/></button>
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">{user.displayName}</h3>
                            <p className="text-sm text-slate-500 mb-4">{user.profession || 'Student/Professional'}</p>
                            
                            <div className="text-left space-y-2 text-sm bg-slate-50 p-4 rounded-xl">
                                <div className="flex items-center gap-2 text-slate-600"><Phone size={14} className="text-blue-500"/> {user.phone || 'N/A'}</div>
                                <div className="flex items-center gap-2 text-slate-600"><MessageCircle size={14} className="text-green-500"/> {user.whatsapp || 'N/A'}</div>
                                <div className="flex items-center gap-2 text-slate-600"><GraduationCap size={14} className="text-purple-500"/> {user.institution || 'N/A'}</div>
                                <div className="flex items-center gap-2 text-slate-600"><MapPin size={14} className="text-red-500"/> {user.currentAddress || 'N/A'}</div>
                            </div>
                        </div>

                        {/* Calendar */}
                        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-4 px-2">
                                <h3 className="font-bold text-slate-800">{currentDate.toLocaleString('default', { month: 'long' })}</h3>
                                <div className="flex gap-1">
                                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-1 hover:bg-slate-100 rounded"><ChevronLeft size={16}/></button>
                                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-1 hover:bg-slate-100 rounded"><ChevronRight size={16}/></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-1 place-items-center text-sm">{renderCalendar()}</div>
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
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="text-white"/></div>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*"/>
                            {imageUploading && <p className="text-xs text-blue-600 mt-2">Uploading...</p>}
                        </div>
                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div><label className="block text-sm font-bold text-slate-700 mb-1">নাম</label><input value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-slate-50"/></div>
                                <div><label className="block text-sm font-bold text-slate-700 mb-1">প্রফেশন</label><input value={profileData.profession} onChange={e => setProfileData({...profileData, profession: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-slate-50"/></div>
                                <div><label className="block text-sm font-bold text-slate-700 mb-1">মোবাইল</label><input value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-slate-50"/></div>
                                <div><label className="block text-sm font-bold text-slate-700 mb-1">হোয়াটসঅ্যাপ</label><input value={profileData.whatsapp} onChange={e => setProfileData({...profileData, whatsapp: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-slate-50"/></div>
                                <div className="col-span-2"><label className="block text-sm font-bold text-slate-700 mb-1">ঠিকানা</label><input value={profileData.currentAddress} onChange={e => setProfileData({...profileData, currentAddress: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-slate-50"/></div>
                                <div className="col-span-2"><label className="block text-sm font-bold text-slate-700 mb-1">প্রতিষ্ঠান</label><input value={profileData.institution} onChange={e => setProfileData({...profileData, institution: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-slate-50"/></div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                                <button type="button" onClick={() => setIsEditingProfile(false)} className="px-6 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100">বাতিল</button>
                                <button type="submit" disabled={loading} className="px-8 py-2 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">{loading ? 'সংরক্ষণ...' : 'সংরক্ষণ করুন'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default UserDashboard;
