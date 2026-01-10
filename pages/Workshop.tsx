
import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Clock, Tag, ChevronRight, Filter, X, ShieldCheck } from 'lucide-react';
import { Workshop, User } from '../types';
import { getWorkshops, saveEventRegistration } from '../services/firebase';
import { useNavigate, useOutletContext } from 'react-router-dom';

interface WorkshopPageProps {
    user?: User | null; 
}

const Workshop: React.FC<WorkshopPageProps> = ({ }) => { 
    
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    
    // Registration Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
    const [regForm, setRegForm] = useState({
        name: '', phone: '', email: '',
        profession: 'Student', // Student, Job Holder, Unemployed
        institution: '', semester: '', department: '', // Student fields
        company: '', position: '', // Job fields
        goal: '', // Unemployed field
        paymentMethod: 'Bkash', transactionId: '' // Payment
    });
    
    // For simple user checking (if props are missing)
    const [currentUser, setCurrentUser] = useState<any>(null);
    const navigate = useNavigate();

    // Login Modal Context
    const { openLoginModal } = useOutletContext<{ openLoginModal: () => void }>() || { openLoginModal: () => {} };

    useEffect(() => {
        // Fetch Workshops
        const fetch = async () => {
            setLoading(true);
            const data = await getWorkshops();
            setWorkshops(data as Workshop[]);
            setLoading(false);
        };
        fetch();

        // Check Local User
        import('../services/firebase').then(({ auth }) => {
            const unsub = auth.onAuthStateChanged((u) => setCurrentUser(u));
            return () => unsub();
        });
    }, []);

    const openRegistration = (ws: Workshop) => {
        // Allow guest registration - removed the login check alert
        setSelectedWorkshop(ws);
        
        // Pre-fill if user exists, otherwise leave blank
        setRegForm(prev => ({
            ...prev,
            name: currentUser?.displayName || '',
            email: currentUser?.email || '',
            phone: currentUser?.phoneNumber || ''
        }));
        setIsModalOpen(true);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedWorkshop) return;

        // Validation for payment
        if (selectedWorkshop.feeType === 'Paid' && !regForm.transactionId) {
            alert("Please enter Transaction ID");
            return;
        }

        try {
            await saveEventRegistration({
                eventId: selectedWorkshop.id!,
                eventType: 'Workshop',
                eventTitle: selectedWorkshop.title,
                eventDate: selectedWorkshop.date,
                userId: currentUser ? currentUser.uid : 'guest_' + Date.now(), // Generate guest ID
                name: regForm.name,
                phone: regForm.phone,
                email: regForm.email,
                photoURL: currentUser?.photoURL || '',
                profession: regForm.profession,
                details: {
                    institution: regForm.institution,
                    semester: regForm.semester,
                    department: regForm.department,
                    company: regForm.company,
                    position: regForm.position,
                    goal: regForm.goal
                },
                paymentMethod: selectedWorkshop.feeType === 'Paid' ? regForm.paymentMethod : null,
                transactionId: selectedWorkshop.feeType === 'Paid' ? regForm.transactionId : null,
                amountPaid: selectedWorkshop.feeType === 'Paid' ? selectedWorkshop.fee : 0,
                status: 'pending',
                createdAt: new Date()
            });
            
            if (currentUser) {
                alert("Registration Successful! Please check your dashboard.");
                navigate('/dashboard');
            } else {
                // For guests who don't have a dashboard
                alert("Registration Successful! We will contact you soon.");
                setIsModalOpen(false);
                setRegForm({
                    name: '', phone: '', email: '',
                    profession: 'Student',
                    institution: '', semester: '', department: '',
                    company: '', position: '',
                    goal: '',
                    paymentMethod: 'Bkash', transactionId: ''
                });
            }
            
        } catch (e) {
            console.error(e);
            alert("Registration failed. Please try again.");
        }
    };

    const filteredWorkshops = filter === 'All' ? workshops : workshops.filter(w => w.category === filter);

    // Common Input Class - Explicit Light Mode Styles
    const inputClass = "p-3 border border-slate-300 rounded-lg w-full bg-white text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";
    const selectClass = "p-3 border border-slate-300 rounded-lg w-full bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none";

    return (
        <div className="bg-slate-50 min-h-screen font-['Hind_Siliguri']">
            {/* Header Section */}
            <div className="bg-[#1e293b] pt-32 pb-20 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">ওয়ার্কশপ ও সেমিনার</h1>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                        আপনার দক্ষতা বৃদ্ধি এবং ক্যারিয়ার গঠনের জন্য আমাদের নিয়মিত আয়োজন।
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2 border-l-4 border-blue-600 pl-3">
                        আসন্ন ইভেন্টসমূহ
                    </h3>
                    <div className="flex gap-2 p-1 bg-white rounded-full shadow-sm border border-slate-200">
                        {['All', 'Workshop', 'Seminar'].map(f => (
                            <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${filter === f ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? <div className="text-center">Loading...</div> : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredWorkshops.map(item => (
                            <div key={item.id} className="bg-white rounded-xl border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden group">
                                <div className="relative h-56 overflow-hidden">
                                    <div className="absolute top-4 left-4 z-10 bg-blue-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded">
                                        {item.category}
                                    </div>
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar size={14}/> {item.date}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 border rounded ${item.status === 'Upcoming' ? 'text-green-600 border-green-200 bg-green-50' : 'text-slate-500 bg-slate-100'}`}>{item.status}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2 leading-snug">{item.title}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">{item.description}</p>
                                    <div className="space-y-2 text-sm text-slate-600 mb-6 flex-grow">
                                        <div className="flex items-center gap-2"><Clock size={16} className="text-blue-500"/> {item.time}</div>
                                        <div className="flex items-center gap-2"><MapPin size={16} className="text-blue-500"/> {item.type} ({item.location || 'Link provided upon registration'})</div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                                        <div>
                                            <p className="text-xs text-slate-400">Fees</p>
                                            <span className="text-lg font-bold text-slate-800">{item.feeType === 'Free' ? 'Free' : `৳${item.fee}`}</span>
                                        </div>
                                        <button onClick={() => openRegistration(item)} disabled={item.status === 'Completed'} className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50">
                                            {item.status === 'Completed' ? 'Closed' : 'Register'} <ChevronRight size={16}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Registration Modal */}
            {isModalOpen && selectedWorkshop && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-lg relative my-auto shadow-2xl">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><X size={24}/></button>
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-slate-800 mb-1">Registration</h3>
                            <p className="text-sm text-slate-500 mb-6">{selectedWorkshop.title}</p>
                            
                            {!currentUser && (
                                <div className="bg-blue-50 p-3 rounded-lg mb-4 text-xs text-blue-700 flex justify-between items-center">
                                    <span>অ্যাকাউন্ট থাকলে লগইন করুন</span>
                                    <button onClick={() => { setIsModalOpen(false); openLoginModal(); }} className="font-bold underline">Login</button>
                                </div>
                            )}

                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input required placeholder="Name" className={inputClass} value={regForm.name} onChange={e=>setRegForm({...regForm, name: e.target.value})}/>
                                    <input required placeholder="Phone" className={inputClass} value={regForm.phone} onChange={e=>setRegForm({...regForm, phone: e.target.value})}/>
                                </div>
                                <input required placeholder="Email" className={inputClass} value={regForm.email} onChange={e=>setRegForm({...regForm, email: e.target.value})}/>
                                
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Profession</label>
                                    <select className={selectClass} value={regForm.profession} onChange={e=>setRegForm({...regForm, profession: e.target.value})}>
                                        <option value="Student">Student</option>
                                        <option value="Job Holder">Job Holder</option>
                                        <option value="Unemployed">Unemployed / Job Seeker</option>
                                    </select>
                                </div>

                                {/* Dynamic Fields */}
                                {regForm.profession === 'Student' && (
                                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <input required placeholder="Institute Name" className={`${inputClass} text-sm`} value={regForm.institution} onChange={e=>setRegForm({...regForm, institution: e.target.value})}/>
                                        <div className="flex gap-3">
                                            <input required placeholder="Department" className={`${inputClass} text-sm`} value={regForm.department} onChange={e=>setRegForm({...regForm, department: e.target.value})}/>
                                            <input required placeholder="Semester/Class" className={`${inputClass} text-sm`} value={regForm.semester} onChange={e=>setRegForm({...regForm, semester: e.target.value})}/>
                                        </div>
                                    </div>
                                )}
                                {regForm.profession === 'Job Holder' && (
                                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <input required placeholder="Company Name" className={`${inputClass} text-sm`} value={regForm.company} onChange={e=>setRegForm({...regForm, company: e.target.value})}/>
                                        <input required placeholder="Designation" className={`${inputClass} text-sm`} value={regForm.position} onChange={e=>setRegForm({...regForm, position: e.target.value})}/>
                                    </div>
                                )}
                                {regForm.profession === 'Unemployed' && (
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <input required placeholder="Your Goal / Target Job" className={`${inputClass} text-sm`} value={regForm.goal} onChange={e=>setRegForm({...regForm, goal: e.target.value})}/>
                                    </div>
                                )}

                                {/* Payment Section */}
                                {selectedWorkshop.feeType === 'Paid' && (
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-bold text-slate-700">Fee: ৳{selectedWorkshop.fee}</span>
                                            <span className="text-xs bg-white px-2 py-1 rounded border border-blue-100 font-medium">Send Money: 01954666016</span>
                                        </div>
                                        <div className="flex gap-3 mb-2">
                                            <select className={`${selectClass} text-sm w-1/3`} value={regForm.paymentMethod} onChange={e=>setRegForm({...regForm, paymentMethod: e.target.value})}>
                                                <option>Bkash</option><option>Nagad</option>
                                            </select>
                                            <input required placeholder="Transaction ID" className={`${inputClass} text-sm w-2/3 uppercase font-mono`} value={regForm.transactionId} onChange={e=>setRegForm({...regForm, transactionId: e.target.value})}/>
                                        </div>
                                        <p className="text-xs text-slate-500">*Send money first then enter TrxID</p>
                                    </div>
                                )}

                                <button className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition shadow-lg">Confirm Registration</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Workshop;
