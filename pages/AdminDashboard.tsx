import React, { useEffect, useState } from 'react';
import { getLeads, getAffiliates, getUsers } from '../services/firebase';
import { User, Lead, Affiliate } from '../types';
import { Navigate } from 'react-router-dom';
import { Users, FileText, LayoutDashboard, Share2, Lock, LogIn } from 'lucide-react';

interface AdminDashboardProps {
    user: User | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
    // Admin Login State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const [activeTab, setActiveTab] = useState<'users' | 'leads' | 'affiliates'>('leads');
    const [leads, setLeads] = useState<Lead[]>([]);
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [usersList, setUsersList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'ows2025' && password === '123456') {
            setIsAuthenticated(true);
            setLoginError('');
            fetchData();
        } else {
            setLoginError('ভুল ইউজারনেম বা পাসওয়ার্ড');
        }
    };

    const fetchData = async () => {
        setLoading(true);
        if (user) {
            const l = await getLeads();
            const a = await getAffiliates();
            const u = await getUsers();
            setLeads(l as Lead[]);
            setAffiliates(a as Affiliate[]);
            setUsersList(u);
        }
        setLoading(false);
    };

    if (!user) {
        return <Navigate to="/" />;
    }

    if (!isAuthenticated) {
        return (
            <div className="pt-32 pb-20 min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <Lock className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">এডমিন লগইন</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">ইউজারনেম</label>
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">পাসওয়ার্ড</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2">
                            <LogIn size={18} /> লগইন করুন
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (loading) return <div className="pt-32 text-center">Loading Admin Data...</div>;

    return (
        <div className="pt-24 pb-12 bg-slate-100 min-h-screen">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-4 mb-8">
                    <LayoutDashboard className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-slate-800">এডমিন ড্যাশবোর্ড</h1>
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                    <button 
                        onClick={() => setActiveTab('leads')}
                        className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 ${activeTab === 'leads' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}
                    >
                        <FileText size={18} /> লিড / আবেদন ({leads.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('affiliates')}
                        className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 ${activeTab === 'affiliates' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}
                    >
                        <Share2 size={18} /> এফিলিয়েট ({affiliates.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}
                    >
                        <Users size={18} /> ইউজার লগ ({usersList.length})
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                    <div className="overflow-x-auto">
                        {activeTab === 'leads' && (
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="p-4 font-semibold text-slate-600">ছবি</th>
                                        <th className="p-4 font-semibold text-slate-600">নাম</th>
                                        <th className="p-4 font-semibold text-slate-600">ফোন</th>
                                        <th className="p-4 font-semibold text-slate-600">পেশা</th>
                                        <th className="p-4 font-semibold text-slate-600">লক্ষ্য / বিস্তারিত</th>
                                        <th className="p-4 font-semibold text-slate-600">তারিখ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leads.map((lead, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="p-4">
                                                {lead.imageUrl ? (
                                                    <img src={lead.imageUrl} alt="User" className="w-10 h-10 rounded-full object-cover border" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs">N/A</div>
                                                )}
                                            </td>
                                            <td className="p-4 font-medium">{lead.name}</td>
                                            <td className="p-4 text-slate-500">{lead.phone}</td>
                                            <td className="p-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">{lead.profession}</span></td>
                                            <td className="p-4 text-slate-500 text-sm max-w-xs truncate">{lead.goal}</td>
                                            <td className="p-4 text-slate-400 text-sm">{lead.createdAt ? new Date(lead.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'affiliates' && (
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="p-4 font-semibold text-slate-600">ছবি</th>
                                        <th className="p-4 font-semibold text-slate-600">নাম</th>
                                        <th className="p-4 font-semibold text-slate-600">ফোন</th>
                                        <th className="p-4 font-semibold text-slate-600">প্রতিষ্ঠান</th>
                                        <th className="p-4 font-semibold text-slate-600">ধরণ</th>
                                        <th className="p-4 font-semibold text-slate-600">তারিখ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {affiliates.map((aff, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="p-4">
                                                {aff.imageUrl ? (
                                                    <img src={aff.imageUrl} alt="User" className="w-10 h-10 rounded-full object-cover border" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs">N/A</div>
                                                )}
                                            </td>
                                            <td className="p-4 font-medium">{aff.name}</td>
                                            <td className="p-4 text-slate-500">{aff.phone}</td>
                                            <td className="p-4 text-sm text-slate-600">
                                                {aff.institution}<br/>
                                                <span className="text-xs text-slate-400">{aff.class_semester}</span>
                                            </td>
                                            <td className="p-4"><span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-bold">{aff.type}</span></td>
                                            <td className="p-4 text-slate-400 text-sm">{aff.createdAt ? new Date(aff.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'users' && (
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="p-4 font-semibold text-slate-600">ইউজার</th>
                                        <th className="p-4 font-semibold text-slate-600">ইমেইল</th>
                                        <th className="p-4 font-semibold text-slate-600">শেষ লগইন</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usersList.map((u, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="p-4 flex items-center gap-3">
                                                <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full" />
                                                <span className="font-medium">{u.name}</span>
                                            </td>
                                            <td className="p-4 text-slate-500">{u.email}</td>
                                            <td className="p-4 text-slate-400 text-sm">{u.lastLogin ? new Date(u.lastLogin.seconds * 1000).toLocaleString() : 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
