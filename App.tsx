
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, getUserProfile } from './services/firebase';
import { User } from './types';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';

// Pages
import Home from './pages/Home';
import Login from './pages/Login'; 
import JobPortal from './pages/JobPortal';
import AdminDashboard from './pages/AdminDashboard';
import EventDashboard from './pages/EventDashboard';
import About from './pages/About';
import Ecosystem from './pages/Ecosystem';
import Blog from './pages/Blog';
import Community from './pages/Community';
import UserDashboard from './pages/UserDashboard';
import Workshop from './pages/Workshop';
import EventPage from './pages/EventPage';
import CampusAmbassador from './pages/CampusAmbassador';
import AffiliateProgram from './pages/AffiliateProgram';
import CertificatePortal from './pages/CertificatePortal';
import SelfAssessment from './pages/SelfAssessment';

// Layout for Public Pages (Includes Navbar & Footer)
const PublicLayout = ({ user, openLoginModal }: { user: User | null, openLoginModal: () => void }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar user={user} openLoginModal={openLoginModal} />
            <main className="flex-grow">
                {/* Pass openLoginModal via Context to all Outlet children */}
                <Outlet context={{ openLoginModal }} />
            </main>
            <Footer />
        </div>
    );
};

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const openLoginModal = () => setIsLoginModalOpen(true);
    const closeLoginModal = () => setIsLoginModalOpen(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const profile = await getUserProfile(firebaseUser.uid);
                setUser({
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName,
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL,
                    ...profile
                });
                // Close modal on successful login
                closeLoginModal();
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-slate-50 font-['Hind_Siliguri']">লোডিং...</div>;
    }

    return (
        <HashRouter>
            <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
            <Routes>
                {/* Independent Login Route (Legacy/Direct Access) */}
                <Route path="/login" element={<Login user={user} />} />

                {/* Public Routes with Navbar & Footer */}
                <Route element={<PublicLayout user={user} openLoginModal={openLoginModal} />}>
                    <Route path="/" element={<Home user={user} />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/ecosystem" element={<Ecosystem user={user} />} />
                    <Route path="/self-assessment" element={<SelfAssessment user={user} />} />
                    
                    {/* Community Routes */}
                    <Route path="/community" element={<Community user={user} />} />
                    <Route path="/community/ambassador" element={<CampusAmbassador user={user} />} />
                    <Route path="/community/affiliate" element={<AffiliateProgram user={user} />} />
                    <Route path="/community/certificate" element={<CertificatePortal user={user} />} />

                    <Route path="/jobs" element={<JobPortal user={user} />} />
                    <Route path="/blog" element={<Blog />} />
                    
                    <Route path="/workshop" element={<Workshop />} />
                    <Route path="/event/:eventId" element={<EventPage />} />
                </Route>

                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<UserDashboard user={user} />} />
                <Route path="/admin" element={<AdminDashboard user={user} />} />
                <Route path="/event-dashboard" element={<EventDashboard user={user} />} />
                
                {/* Catch all route for HashRouter */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </HashRouter>
    );
};

export default App;
