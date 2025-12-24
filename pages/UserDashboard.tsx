import React, { useState, useEffect, useRef } from 'react';
import { User, EcosystemApplication } from '../types';
import { updateUserProfile, getUserApplications, uploadProfileImage } from '../services/firebase';
import { 
    LayoutDashboard, BookOpen, FileText, CheckSquare, CreditCard, 
    LogOut, Edit3, Camera, MapPin, Phone, MessageCircle, GraduationCap,
    ChevronLeft, ChevronRight, Globe, TrendingUp, Award, Box, Clock, Video, Download, User as UserIcon
} from 'lucide-react';
import { logout } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

interface UserDashboardProps {
    user: User | null;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'home' | 'classroom' | 'idcard' | 'career'>('home');
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
            await updateUserProfile(user.uid, { displayName: profileData.name, ...profileData });
            setIsEditingProfile(false);
            alert("Profile Updated!");
            window.location.reload(); 
        } catch (error) { alert("Update Failed"); }
        setLoading(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!user || !e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setImageUploading(true);
        try {
            await uploadProfileImage(file, user.uid);
            alert("Image Updated!");
            window.location.reload();
        } catch (error) { alert("Upload Failed"); }
        setImageUploading(false);
    };

    if (!user) return null;

    // Helper for Progress Bar
    const ScoreBar = ({ label, score, color }: { label: string, score: number, color: string }) => (
        <div className="mb-4">
            <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>{label}</span>
                <span>{score}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
                <div className={`h-2 rounded-full ${color}`} style={{ width: `${score}%` }}></div>
            </div>
        </div>
    );

    return (
        <div className="bg-[#F8FAFC] min-h-screen font-['Hind_Siliguri'] flex h-screen overflow-hidden">
                
                {/* Sidebar */}
                <div className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 h-full">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <img src="https://iili.io/f3k62rG.md.png" alt="OWS" className="h-8 object-contain" />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        <button onClick={() => setActiveTab('home')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'home' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><LayoutDashboard size={20}/> Journey Map</button>
                        <button onClick={() => setActiveTab('classroom')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'classroom' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><BookOpen size={20}/> LMS / Classroom</button>
                        <button onClick={() => setActiveTab('idcard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'idcard' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><CreditCard size={20}/> Digital ID Card</button>
                        <button onClick={() => setActiveTab('career')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'career' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><TrendingUp size={20}/> Career & Profile</button>
                    </div>

                    <div className="p-4 border-t border-slate-100 space-y-2">
                        <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-medium"><LogOut size={20}/> Logout</button>
                    </div>
                </div>

                {/* Mobile Header */}
                <div className="lg:hidden absolute top-0 left-0 w-full bg-white border-b border-slate-200 p-4 flex justify-between items-center z-50">
                     <span className="font-bold text-xl text-slate-800">Student Panel</span>
                     <button onClick={() => navigate('/')} className="text-blue-600 text-sm font-bold">Exit</button>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 lg:pt-8">
                     <div className="max-w-6xl mx-auto">
                        
                        {/* Header Section */}
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800">Hello, {user.displayName} 👋</h1>
                                <p className="text-slate-500 mt-1">Student ID: <span className="font-mono font-bold text-blue-600">{ecosystemData?.studentId || 'PENDING'}</span></p>
                            </div>
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-bold text-slate-600">Current Phase</p>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${ecosystemData?.currentPhase === 'Internship' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {ecosystemData?.currentPhase || 'Onboarding'}
                                </span>
                            </div>
                        </div>

                        {/* --- TAB: JOURNEY MAP (HOME) --- */}
                        {activeTab === 'home' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left: Timeline & Status */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Progress Timeline */}
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><MapPin size={20} className="text-blue-600"/> My Journey</h3>
                                        <div className="relative pl-4 border-l-2 border-slate-200 space-y-8">
                                            <div className="relative">
                                                <div className="absolute -left-[21px] w-4 h-4 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100"></div>
                                                <h4 className="font-bold text-slate-800">Month 1-3: Learning & Skill Building</h4>
                                                <p className="text-sm text-slate-500 mt-1">Complete 4 modules and submit assignments.</p>
                                                <div className="mt-2 text-xs font-bold text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">IN PROGRESS</div>
                                            </div>
                                            <div className="relative opacity-50">
                                                <div className="absolute -left-[21px] w-4 h-4 rounded-full bg-slate-300 border-2 border-white"></div>
                                                <h4 className="font-bold text-slate-800">Month 4: Assessment & Grading</h4>
                                                <p className="text-sm text-slate-500 mt-1">Final evaluation of Sales, Comms, and EQ.</p>
                                            </div>
                                            <div className="relative opacity-50">
                                                <div className="absolute -left-[21px] w-4 h-4 rounded-full bg-slate-300 border-2 border-white"></div>
                                                <h4 className="font-bold text-slate-800">Placement: Internship</h4>
                                                <p className="text-sm text-slate-500 mt-1">Get matched with partner companies.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Kit Tracker */}
                                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-3xl border border-orange-100 flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-orange-800 flex items-center gap-2"><Box size={20}/> Welcome Kit Status</h3>
                                            <p className="text-sm text-orange-600 mt-1">Your branded T-shirt and Notebook</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-orange-700">{ecosystemData?.kitStatus || 'Processing'}</div>
                                            <p className="text-xs text-orange-500 uppercase tracking-wider">Current Status</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Notices & Quick Actions */}
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Clock size={20} className="text-purple-600"/> Notice Board</h3>
                                        <div className="space-y-4">
                                            {ecosystemData?.notices?.map((notice, idx) => (
                                                <div key={idx} className="p-3 bg-slate-50 rounded-xl border-l-4 border-purple-500">
                                                    <h5 className="font-bold text-sm text-slate-800">{notice.title}</h5>
                                                    <p className="text-xs text-slate-500 mt-1">{notice.message}</p>
                                                </div>
                                            )) || <p className="text-slate-400 text-sm italic">No notices yet.</p>}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg shadow-blue-200">
                                        <h3 className="font-bold text-lg mb-2">Next Live Class</h3>
                                        <p className="text-blue-100 text-sm mb-4">Topic: Advanced Sales Psychology</p>
                                        <button className="w-full bg-white text-blue-600 font-bold py-2 rounded-lg flex items-center justify-center gap-2"><Video size={18}/> Join Class</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: LMS / CLASSROOM --- */}
                        {activeTab === 'classroom' && (
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-4 gap-4">
                                    {['Sales Mastery', 'Communication', 'Networking', 'Emotional Intelligence'].map((mod, i) => (
                                        <button key={i} className={`p-4 rounded-xl text-left font-bold text-sm border transition-all ${i === 0 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
                                            Module {i+1}: <br/> {mod}
                                        </button>
                                    ))}
                                </div>

                                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                                    <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-6">
                                        <div className="text-center">
                                            <Video size={48} className="mx-auto mb-2 opacity-50"/>
                                            <p>Select a video to play</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-slate-100 pt-6">
                                        <div>
                                            <h3 className="font-bold text-xl text-slate-800">Class 1: Introduction to Sales</h3>
                                            <p className="text-slate-500 text-sm">Instructor: Sifatur Rahman</p>
                                        </div>
                                        <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-200"><Download size={16}/> Lecture Note (PDF)</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: DIGITAL ID CARD --- */}
                        {activeTab === 'idcard' && (
                            <div className="flex justify-center py-10">
                                <div className="w-full max-w-sm bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-white border border-slate-700">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
                                    
                                    <div className="flex justify-between items-start mb-8 relative z-10">
                                        <img src="https://iili.io/f3k62rG.md.png" alt="Logo" className="h-8 object-contain brightness-0 invert" />
                                        <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded border border-white/20">STUDENT</span>
                                    </div>

                                    <div className="text-center mb-8 relative z-10">
                                        <div className="w-24 h-24 mx-auto rounded-full p-1 bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
                                            <img src={user.photoURL || 'https://via.placeholder.com/150'} className="w-full h-full rounded-full object-cover border-2 border-slate-900"/>
                                        </div>
                                        <h2 className="text-2xl font-bold">{user.displayName}</h2>
                                        <p className="text-slate-400 text-sm">{ecosystemData?.batch || 'Batch N/A'}</p>
                                    </div>

                                    <div className="bg-white/10 rounded-xl p-4 mb-6 backdrop-blur-sm border border-white/5 relative z-10">
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div><p className="text-slate-400">ID Number</p><p className="font-mono font-bold tracking-wide">{ecosystemData?.studentId || 'PENDING'}</p></div>
                                            <div className="text-right"><p className="text-slate-400">Valid Till</p><p className="font-bold">Dec 2025</p></div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center relative z-10">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${user.uid}`} alt="QR" className="w-16 h-16 rounded bg-white p-1"/>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: CAREER & PROFILE --- */}
                        {activeTab === 'career' && (
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Score Card */}
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Award size={20} className="text-yellow-500"/> Skill Assessment Score</h3>
                                    {ecosystemData?.scores ? (
                                        <div>
                                            <ScoreBar label="Sales Mastery" score={ecosystemData.scores.sales} color="bg-rose-500"/>
                                            <ScoreBar label="Communication" score={ecosystemData.scores.communication} color="bg-purple-500"/>
                                            <ScoreBar label="Networking" score={ecosystemData.scores.networking} color="bg-blue-500"/>
                                            <ScoreBar label="Emotional Intelligence" score={ecosystemData.scores.eq} color="bg-green-500"/>
                                            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                                                <p className="text-xs text-slate-400 uppercase tracking-wider">Overall Attendance</p>
                                                <p className="text-3xl font-bold text-slate-800">{ecosystemData.scores.attendance}%</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 text-center py-10 italic">Scores will appear after Month 3 assessment.</p>
                                    )}
                                </div>

                                {/* Profile Edit */}
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-lg">My Profile</h3>
                                        <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200"><Edit3 size={16}/></button>
                                    </div>
                                    
                                    {isEditingProfile ? (
                                        <form onSubmit={handleSaveProfile} className="space-y-4">
                                            <div><label className="text-xs font-bold text-slate-500">Name</label><input className="w-full border rounded p-2 text-sm" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})}/></div>
                                            <div><label className="text-xs font-bold text-slate-500">Phone</label><input className="w-full border rounded p-2 text-sm" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})}/></div>
                                            <div><label className="text-xs font-bold text-slate-500">Institution</label><input className="w-full border rounded p-2 text-sm" value={profileData.institution} onChange={e => setProfileData({...profileData, institution: e.target.value})}/></div>
                                            <button className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-sm">Save Changes</button>
                                        </form>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3"><div className="bg-blue-50 p-2 rounded-lg text-blue-600"><UserIcon size={18}/></div><div><p className="text-xs text-slate-400">Full Name</p><p className="font-bold text-slate-800">{user.displayName}</p></div></div>
                                            <div className="flex items-center gap-3"><div className="bg-purple-50 p-2 rounded-lg text-purple-600"><Phone size={18}/></div><div><p className="text-xs text-slate-400">Phone</p><p className="font-bold text-slate-800">{user.phone || 'N/A'}</p></div></div>
                                            <div className="flex items-center gap-3"><div className="bg-orange-50 p-2 rounded-lg text-orange-600"><GraduationCap size={18}/></div><div><p className="text-xs text-slate-400">Institution</p><p className="font-bold text-slate-800">{user.institution || 'N/A'}</p></div></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
        </div>
    );
};
export default UserDashboard;