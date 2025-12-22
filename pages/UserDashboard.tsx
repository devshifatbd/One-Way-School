import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { updateUserProfile, getUserApplications } from '../services/firebase';
import { User as UserIcon, MapPin, Phone, Briefcase, GraduationCap, Linkedin, Globe, Edit3, Save, BriefcaseBusiness, TrendingUp } from 'lucide-react';

interface UserDashboardProps {
    user: User | null;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'applications'>('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [applications, setApplications] = useState<any[]>([]);
    
    // Profile Form State
    const [formData, setFormData] = useState({
        phone: '',
        institution: '',
        address: '',
        bio: '',
        linkedin: '',
        portfolio: '',
        skills: ''
    });

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setFormData({
                phone: user.phone || '',
                institution: user.institution || '',
                address: user.address || '',
                bio: user.bio || '',
                linkedin: user.linkedin || '',
                portfolio: user.portfolio || '',
                skills: user.skills || ''
            });
            fetchApplications();
        }
    }, [user]);

    const fetchApplications = async () => {
        if (!user) return;
        const apps = await getUserApplications(user.uid);
        setApplications(apps);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        try {
            await updateUserProfile(user.uid, formData);
            setIsEditing(false);
            alert("প্রোফাইল আপডেট হয়েছে!");
            // Note: Ideally, we should update the global user state here, 
            // but for now, the App.tsx onAuthStateChanged logic handles refresh on reload.
        } catch (error) {
            alert("আপডেট ব্যর্থ হয়েছে।");
        }
        setLoading(false);
    };

    if (!user) {
        return (
            <div className="pt-32 pb-20 container mx-auto text-center">
                <h2 className="text-2xl font-bold">অনুগ্রহ করে লগইন করুন</h2>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-20 min-h-screen bg-slate-50">
            <div className="container mx-auto px-4 max-w-5xl">
                
                {/* Header */}
                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-purple-600 opacity-10"></div>
                    
                    <div className="relative">
                        <img src={user.photoURL || 'https://via.placeholder.com/150'} alt="Profile" className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover" />
                        <button onClick={() => setActiveTab('profile')} className="absolute bottom-0 right-0 bg-slate-900 text-white p-2 rounded-full shadow-md hover:bg-slate-800 md:hidden">
                            <Edit3 size={16} />
                        </button>
                    </div>
                    
                    <div className="text-center md:text-left flex-1 relative z-10 pt-2 md:pt-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{user.displayName}</h1>
                        <p className="text-slate-500 mb-4">{user.email}</p>
                        
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            {formData.institution && (
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
                                    <GraduationCap size={14} /> {formData.institution}
                                </span>
                            )}
                            {formData.address && (
                                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium flex items-center gap-2">
                                    <MapPin size={14} /> {formData.address}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-4 gap-8">
                    {/* Sidebar Tabs */}
                    <div className="md:col-span-1 space-y-3">
                        <button 
                            onClick={() => setActiveTab('profile')}
                            className={`w-full text-left px-5 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                        >
                            <UserIcon size={18} /> আমার প্রোফাইল
                        </button>
                        <button 
                            onClick={() => setActiveTab('applications')}
                            className={`w-full text-left px-5 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'applications' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                        >
                            <BriefcaseBusiness size={18} /> আবেদনসমূহ
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="md:col-span-3">
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-slate-800">প্রোফাইল তথ্য</h3>
                                    {!isEditing && (
                                        <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                                            <Edit3 size={18} /> এডিট করুন
                                        </button>
                                    )}
                                </div>

                                <form onSubmit={handleSaveProfile} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">মোবাইল নম্বর</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input 
                                                    disabled={!isEditing}
                                                    type="text" 
                                                    value={formData.phone}
                                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isEditing ? 'bg-white border-slate-300 focus:ring-2 focus:ring-blue-500' : 'bg-slate-50 border-transparent text-slate-600'}`}
                                                    placeholder="01XXXXXXXXX"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">শিক্ষা প্রতিষ্ঠান</label>
                                            <div className="relative">
                                                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input 
                                                    disabled={!isEditing}
                                                    type="text" 
                                                    value={formData.institution}
                                                    onChange={e => setFormData({...formData, institution: e.target.value})}
                                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isEditing ? 'bg-white border-slate-300 focus:ring-2 focus:ring-blue-500' : 'bg-slate-50 border-transparent text-slate-600'}`}
                                                    placeholder="প্রতিষ্ঠানের নাম"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">ঠিকানা</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input 
                                                    disabled={!isEditing}
                                                    type="text" 
                                                    value={formData.address}
                                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isEditing ? 'bg-white border-slate-300 focus:ring-2 focus:ring-blue-500' : 'bg-slate-50 border-transparent text-slate-600'}`}
                                                    placeholder="বর্তমান ঠিকানা"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">দক্ষতা (Skills)</label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input 
                                                    disabled={!isEditing}
                                                    type="text" 
                                                    value={formData.skills}
                                                    onChange={e => setFormData({...formData, skills: e.target.value})}
                                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isEditing ? 'bg-white border-slate-300 focus:ring-2 focus:ring-blue-500' : 'bg-slate-50 border-transparent text-slate-600'}`}
                                                    placeholder="e.g. React, Marketing, Sales"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">বায়ো (Bio)</label>
                                        <textarea 
                                            disabled={!isEditing}
                                            rows={3}
                                            value={formData.bio}
                                            onChange={e => setFormData({...formData, bio: e.target.value})}
                                            className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'bg-white border-slate-300 focus:ring-2 focus:ring-blue-500' : 'bg-slate-50 border-transparent text-slate-600'}`}
                                            placeholder="আপনার সম্পর্কে সংক্ষেপে লিখুন..."
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">LinkedIn URL</label>
                                            <div className="relative">
                                                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input 
                                                    disabled={!isEditing}
                                                    type="text" 
                                                    value={formData.linkedin}
                                                    onChange={e => setFormData({...formData, linkedin: e.target.value})}
                                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isEditing ? 'bg-white border-slate-300 focus:ring-2 focus:ring-blue-500' : 'bg-slate-50 border-transparent text-slate-600'}`}
                                                    placeholder="https://linkedin.com/in/..."
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Portfolio / CV Link</label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input 
                                                    disabled={!isEditing}
                                                    type="text" 
                                                    value={formData.portfolio}
                                                    onChange={e => setFormData({...formData, portfolio: e.target.value})}
                                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isEditing ? 'bg-white border-slate-300 focus:ring-2 focus:ring-blue-500' : 'bg-slate-50 border-transparent text-slate-600'}`}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="flex justify-end pt-4 border-t border-slate-100 gap-3">
                                            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100">
                                                বাতিল
                                            </button>
                                            <button type="submit" disabled={loading} className="px-8 py-2 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
                                                {loading ? 'সংরক্ষণ হচ্ছে...' : <><Save size={18}/> সংরক্ষণ করুন</>}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}

                        {activeTab === 'applications' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                                <h3 className="text-xl font-bold text-slate-800 mb-6">আমার আবেদনসমূহ</h3>
                                
                                {applications.length === 0 ? (
                                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                        <p className="text-slate-500">আপনি এখনো কোনো আবেদন করেননি।</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {applications.map((app, idx) => (
                                            <div key={idx} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${app.type === 'job/lead' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                            {app.type === 'job/lead' ? 'Job Application' : 'Affiliate Program'}
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            {app.createdAt ? new Date(app.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                        </span>
                                                    </div>
                                                    
                                                    {app.type === 'job/lead' ? (
                                                        <>
                                                            <h4 className="font-bold text-slate-800">{app.details?.jobTitle || app.goal}</h4>
                                                            <p className="text-sm text-slate-500">Lead ID: {app.id}</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                                <TrendingUp size={16} /> Affiliate / Ambassador Request
                                                            </h4>
                                                            <p className="text-sm text-slate-500">Institution: {app.institution}</p>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Pending</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;