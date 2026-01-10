
import React, { useEffect, useState } from 'react';
import { User, Workshop, MajorEvent, EventRegistration } from '../types';
import { 
    saveWorkshop, updateWorkshop, getWorkshops, deleteWorkshop,
    saveMajorEvent, updateMajorEvent, getMajorEvents, deleteMajorEvent,
    getEventRegistrations, updateRegistrationStatus
} from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Edit, Trash2, Home, LogOut, Search, Clock, MapPin, Video, Users, CheckCircle, MonitorPlay, Ticket, DollarSign, List, ShieldCheck, X } from 'lucide-react';
import { logout } from '../services/firebase';

interface EventDashboardProps {
    user: User | null;
}

const EventDashboard: React.FC<EventDashboardProps> = ({ user }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'workshops' | 'events'>('workshops');
    const [loading, setLoading] = useState(false);
    
    // Data Lists
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [events, setEvents] = useState<MajorEvent[]>([]);
    const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
    
    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'create_workshop' | 'create_event' | 'manage_registrations' | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null); // Selected Workshop/Event for edit/manage
    const [searchQuery, setSearchQuery] = useState('');

    // Forms
    const [workshopForm, setWorkshopForm] = useState<Partial<Workshop>>({
        category: 'Workshop', type: 'Online', feeType: 'Free', status: 'Upcoming'
    });
    
    const [eventForm, setEventForm] = useState<Partial<MajorEvent>>({
        type: 'Offline', fee: 0, guests: [], sponsors: [], schedule: []
    });

    // Helper to add guests/sponsors dynamically
    const addGuest = () => setEventForm({...eventForm, guests: [...(eventForm.guests || []), { name: '', designation: '', type: 'Guest' }]});
    const updateGuest = (idx: number, field: string, val: string) => {
        const newGuests = [...(eventForm.guests || [])];
        newGuests[idx] = { ...newGuests[idx], [field]: val };
        setEventForm({...eventForm, guests: newGuests});
    };
    const removeGuest = (idx: number) => setEventForm({...eventForm, guests: eventForm.guests?.filter((_, i) => i !== idx)});

    useEffect(() => {
        if (!user || user.email !== 'onewayschool.bd@gmail.com') {
            alert("Unauthorized Access.");
            navigate('/');
            return;
        }
        fetchData();
    }, [user, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        if (activeTab === 'workshops') {
            const data = await getWorkshops();
            setWorkshops(data as Workshop[]);
        } else {
            const data = await getMajorEvents();
            setEvents(data as MajorEvent[]);
        }
        setLoading(false);
    };

    const handleSaveWorkshop = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (selectedItem?.id) {
                await updateWorkshop(selectedItem.id, workshopForm);
                alert("Workshop Updated!");
            } else {
                await saveWorkshop({ ...workshopForm, createdAt: new Date() });
                alert("Workshop Created!");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (e) { alert("Failed to save."); }
        setFormLoading(false);
    };

    const handleSaveEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (selectedItem?.id) {
                await updateMajorEvent(selectedItem.id, eventForm);
                alert("Event Updated!");
            } else {
                await saveMajorEvent({ ...eventForm, createdAt: new Date() });
                alert("Event Created!");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (e) { alert("Failed to save."); }
        setFormLoading(false);
    };

    const openManageRegistrations = async (item: any, type: 'Workshop' | 'Event') => {
        setLoading(true);
        setSelectedItem(item);
        const regs = await getEventRegistrations(item.id);
        setRegistrations(regs as EventRegistration[]);
        setModalType('manage_registrations');
        setIsModalOpen(true);
        setLoading(false);
    };

    const handleRegistrationAction = async (reg: EventRegistration, action: 'approve' | 'decline' | 'complete') => {
        if(!window.confirm(`Are you sure you want to ${action} this registration?`)) return;
        
        let status = 'pending';
        let ticketCode = '';
        
        if (action === 'approve') {
            status = 'approved';
            ticketCode = 'OWS-' + Math.floor(100000 + Math.random() * 900000);
        } else if (action === 'decline') {
            status = 'declined';
        } else if (action === 'complete') {
            status = 'completed'; // Trigger certificate
        }

        await updateRegistrationStatus(reg.id!, status, ticketCode);
        
        // Update local state
        setRegistrations(prev => prev.map(r => r.id === reg.id ? { ...r, status: status as any, ticketCode } : r));
    };

    const handleDelete = async (id: string, type: 'workshop' | 'event') => {
        if(confirm("Delete this item?")) {
            if (type === 'workshop') await deleteWorkshop(id);
            else await deleteMajorEvent(id);
            fetchData();
        }
    }

    // New Light Theme Styles for Forms
    const inputStyle = "w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:ring-2 focus:ring-purple-200";
    const selectStyle = "w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:ring-2 focus:ring-purple-200";

    return (
        <div className="bg-[#1E1E2F] min-h-screen flex font-['Hind_Siliguri'] text-slate-200">
            {/* Sidebar */}
            <div className="w-64 bg-[#27293D] flex flex-col h-screen fixed border-r border-white/5">
                <div className="p-6 flex items-center gap-2">
                    <Calendar className="text-purple-500" size={28}/>
                    <h1 className="text-xl font-bold text-white tracking-wider">Event<span className="text-purple-500">Dash</span></h1>
                </div>
                
                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <button onClick={() => setActiveTab('workshops')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'workshops' ? 'bg-purple-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}>
                        <MonitorPlay size={20}/> Workshops
                    </button>
                    <button onClick={() => setActiveTab('events')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'events' ? 'bg-purple-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}>
                        <Ticket size={20}/> Major Events
                    </button>
                </nav>

                <div className="p-4 border-t border-white/5 space-y-2">
                    <button onClick={() => navigate('/')} className="w-full flex items-center gap-2 text-slate-400 hover:text-white p-2">
                        <Home size={18}/> Back to Home
                    </button>
                    <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 p-2">
                        <LogOut size={18}/> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-white capitalize">{activeTab} Management</h2>
                    <div className="flex items-center gap-4">
                        {activeTab === 'workshops' ? (
                            <button onClick={() => { setWorkshopForm({ category: 'Workshop', type: 'Online', feeType: 'Free', status: 'Upcoming' }); setSelectedItem(null); setModalType('create_workshop'); setIsModalOpen(true); }} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 transition">
                                <Plus size={18}/> Add Workshop
                            </button>
                        ) : (
                            <button onClick={() => { setEventForm({ type: 'Offline', fee: 0, guests: [] }); setSelectedItem(null); setModalType('create_event'); setIsModalOpen(true); }} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 transition">
                                <Plus size={18}/> Add Event
                            </button>
                        )}
                    </div>
                </div>

                {loading ? <div className="text-center py-20">Loading...</div> : (
                    <div className="grid grid-cols-1 gap-6">
                        {activeTab === 'workshops' && workshops.map(item => (
                            <div key={item.id} className="bg-[#27293D] p-5 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-purple-500/30 transition-all">
                                <div>
                                    <div className="flex gap-2 mb-2">
                                        <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-xs font-bold uppercase">{item.category}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${item.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{item.status}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                                    <p className="text-sm text-slate-400 mt-1">{item.date} at {item.time} ({item.type})</p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => openManageRegistrations(item, 'Workshop')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                                        <Users size={16}/> Registrations
                                    </button>
                                    <button onClick={() => { setWorkshopForm(item); setSelectedItem(item); setModalType('create_workshop'); setIsModalOpen(true); }} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-slate-300"><Edit size={18}/></button>
                                    <button onClick={() => handleDelete(item.id!, 'workshop')} className="p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 text-red-400"><Trash2 size={18}/></button>
                                </div>
                            </div>
                        ))}

                        {activeTab === 'events' && events.map(item => (
                            <div key={item.id} className="bg-[#27293D] p-5 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-purple-500/30 transition-all">
                                <div className="flex gap-4 items-center">
                                    <img src={item.imageUrl} className="w-16 h-16 rounded-lg object-cover bg-slate-800"/>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{item.title}</h3>
                                        <p className="text-sm text-slate-400 mt-1">{item.date} | {item.location}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => openManageRegistrations(item, 'Event')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                                        <Users size={16}/> Registrations
                                    </button>
                                    <button onClick={() => { setEventForm(item); setSelectedItem(item); setModalType('create_event'); setIsModalOpen(true); }} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-slate-300"><Edit size={18}/></button>
                                    <button onClick={() => handleDelete(item.id!, 'event')} className="p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 text-red-400"><Trash2 size={18}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#27293D] w-full max-w-4xl rounded-2xl shadow-2xl relative my-auto">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24}/></button>
                        
                        <div className="p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
                            {modalType === 'create_workshop' && (
                                <form onSubmit={handleSaveWorkshop} className="space-y-6">
                                    <h3 className="text-2xl font-bold text-white mb-6">{selectedItem ? 'Edit Workshop' : 'Create Workshop'}</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <input required placeholder="Workshop Title" className={inputStyle} value={workshopForm.title || ''} onChange={e=>setWorkshopForm({...workshopForm, title: e.target.value})}/>
                                        <select className={selectStyle} value={workshopForm.category} onChange={e=>setWorkshopForm({...workshopForm, category: e.target.value as any})}><option>Workshop</option><option>Seminar</option></select>
                                        <div className="col-span-2"><textarea required placeholder="Description" className={`${inputStyle} h-24`} value={workshopForm.description || ''} onChange={e=>setWorkshopForm({...workshopForm, description: e.target.value})}/></div>
                                        <input required placeholder="Image URL" className={inputStyle} value={workshopForm.imageUrl || ''} onChange={e=>setWorkshopForm({...workshopForm, imageUrl: e.target.value})}/>
                                        <select className={selectStyle} value={workshopForm.type} onChange={e=>setWorkshopForm({...workshopForm, type: e.target.value as any})}><option>Online</option><option>Offline</option></select>
                                        <input required type="date" className={inputStyle} value={workshopForm.date || ''} onChange={e=>setWorkshopForm({...workshopForm, date: e.target.value})}/>
                                        <input required type="time" className={inputStyle} value={workshopForm.time || ''} onChange={e=>setWorkshopForm({...workshopForm, time: e.target.value})}/>
                                        <input placeholder="Location / Link" className={inputStyle} value={workshopForm.location || ''} onChange={e=>setWorkshopForm({...workshopForm, location: e.target.value})}/>
                                        <select className={selectStyle} value={workshopForm.feeType} onChange={e=>setWorkshopForm({...workshopForm, feeType: e.target.value as any})}><option>Free</option><option>Paid</option></select>
                                        {workshopForm.feeType === 'Paid' && <input type="number" placeholder="Fee Amount" className={inputStyle} value={workshopForm.fee || ''} onChange={e=>setWorkshopForm({...workshopForm, fee: Number(e.target.value)})}/>}
                                        <select className={selectStyle} value={workshopForm.status} onChange={e=>setWorkshopForm({...workshopForm, status: e.target.value as any})}><option>Upcoming</option><option>Completed</option></select>
                                    </div>
                                    <button className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700">{selectedItem ? 'Update' : 'Create'}</button>
                                </form>
                            )}

                            {modalType === 'create_event' && (
                                <form onSubmit={handleSaveEvent} className="space-y-6">
                                    <h3 className="text-2xl font-bold text-white mb-6">{selectedItem ? 'Edit Event' : 'Create Major Event'}</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <input required placeholder="Event Name" className={`${inputStyle} col-span-2`} value={eventForm.title || ''} onChange={e=>setEventForm({...eventForm, title: e.target.value})}/>
                                        <textarea required placeholder="Description" className={`${inputStyle} col-span-2 h-24`} value={eventForm.description || ''} onChange={e=>setEventForm({...eventForm, description: e.target.value})}/>
                                        <input required placeholder="Image URL" className={inputStyle} value={eventForm.imageUrl || ''} onChange={e=>setEventForm({...eventForm, imageUrl: e.target.value})}/>
                                        <input required placeholder="Location" className={inputStyle} value={eventForm.location || ''} onChange={e=>setEventForm({...eventForm, location: e.target.value})}/>
                                        <input required type="date" className={inputStyle} value={eventForm.date || ''} onChange={e=>setEventForm({...eventForm, date: e.target.value})}/>
                                        <input required type="time" className={inputStyle} value={eventForm.time || ''} onChange={e=>setEventForm({...eventForm, time: e.target.value})}/>
                                        <input type="number" placeholder="Fee (0 for Free)" className={inputStyle} value={eventForm.fee || 0} onChange={e=>setEventForm({...eventForm, fee: Number(e.target.value)})}/>
                                    </div>
                                    
                                    {/* Guests Section */}
                                    <div className="border-t border-white/10 pt-4">
                                        <div className="flex justify-between items-center mb-2"><label className="text-sm font-bold text-slate-400">Guests / Speakers</label><button type="button" onClick={addGuest} className="text-xs bg-blue-600 px-2 py-1 rounded text-white">+ Add</button></div>
                                        {eventForm.guests?.map((g, i) => (
                                            <div key={i} className="flex gap-2 mb-2">
                                                <input placeholder="Name" className="w-1/3 bg-white border border-slate-200 p-2 rounded text-slate-800 text-sm" value={g.name} onChange={e=>updateGuest(i, 'name', e.target.value)}/>
                                                <input placeholder="Designation" className="w-1/3 bg-white border border-slate-200 p-2 rounded text-slate-800 text-sm" value={g.designation} onChange={e=>updateGuest(i, 'designation', e.target.value)}/>
                                                <select className="bg-white border border-slate-200 p-2 rounded text-slate-800 text-sm" value={g.type} onChange={e=>updateGuest(i, 'type', e.target.value)}><option>Guest</option><option>Speaker</option></select>
                                                <button type="button" onClick={()=>removeGuest(i)} className="text-red-400"><Trash2 size={16}/></button>
                                            </div>
                                        ))}
                                    </div>

                                    <button className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700">{selectedItem ? 'Update Event' : 'Create Event'}</button>
                                </form>
                            )}

                            {modalType === 'manage_registrations' && (
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-6">Registrations for: {selectedItem?.title}</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-slate-300">
                                            <thead className="bg-white/5 text-slate-400 uppercase text-xs">
                                                <tr><th className="p-3">User</th><th className="p-3">Profession</th><th className="p-3">Payment</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {registrations.map(reg => (
                                                    <tr key={reg.id}>
                                                        <td className="p-3">
                                                            <div className="font-bold text-white">{reg.name}</div>
                                                            <div className="text-xs">{reg.phone}</div>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="font-bold">{reg.profession}</div>
                                                            <div className="text-xs">{reg.details.institution || reg.details.company || reg.details.goal}</div>
                                                        </td>
                                                        <td className="p-3">
                                                            {reg.paymentMethod ? (
                                                                <div className="text-xs">
                                                                    <span className="text-yellow-400 font-bold">{reg.paymentMethod}</span><br/>
                                                                    <span className="font-mono">{reg.transactionId}</span>
                                                                </div>
                                                            ) : <span className="text-green-400 text-xs">Free</span>}
                                                        </td>
                                                        <td className="p-3">
                                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${reg.status === 'approved' ? 'bg-green-500/20 text-green-400' : reg.status === 'completed' ? 'bg-blue-500/20 text-blue-400' : reg.status === 'declined' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                                                {reg.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-right space-x-2">
                                                            {reg.status === 'pending' && (
                                                                <>
                                                                    <button onClick={()=>handleRegistrationAction(reg, 'approve')} className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-green-700">Approve</button>
                                                                    <button onClick={()=>handleRegistrationAction(reg, 'decline')} className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-red-700">Decline</button>
                                                                </>
                                                            )}
                                                            {reg.status === 'approved' && (
                                                                <button onClick={()=>handleRegistrationAction(reg, 'complete')} className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-blue-700" title="Grant Certificate">Mark Complete</button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {registrations.length === 0 && <tr><td colSpan={5} className="p-4 text-center">No registrations found.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventDashboard;
