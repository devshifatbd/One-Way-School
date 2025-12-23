import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, getUserProfile } from './services/firebase';
import { User } from './types';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import JobPortal from './pages/JobPortal';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Ecosystem from './pages/Ecosystem';
import Blog from './pages/Blog';
import Community from './pages/Community';
import UserDashboard from './pages/UserDashboard';

// Layout for Public Pages (Includes Navbar & Footer)
const PublicLayout = ({ user }: { user: User | null }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar user={user} />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch extended profile data
                const profile = await getUserProfile(firebaseUser.uid);
                setUser({
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName,
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL,
                    ...profile // Merge extended profile fields
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
    }

    return (
        <HashRouter>
            <Routes>
                {/* Public Routes with Navbar & Footer */}
                <Route element={<PublicLayout user={user} />}>
                    {/* Explicitly setting Home as the main page at root "/" */}
                    <Route path="/" element={<Home user={user} />} />
                    
                    <Route path="/about" element={<About />} />
                    <Route path="/ecosystem" element={<Ecosystem user={user} />} />
                    <Route path="/community" element={<Community user={user} />} />
                    <Route path="/jobs" element={<JobPortal user={user} />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/dashboard" element={<UserDashboard user={user} />} />
                </Route>

                {/* Admin Route without Public Navbar/Footer */}
                <Route path="/admin" element={<AdminDashboard user={user} />} />
            </Routes>
        </HashRouter>
    );
};

export default App;