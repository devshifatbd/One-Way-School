import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
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

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName,
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL,
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
            <div className="flex flex-col min-h-screen">
                <Navbar user={user} />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Home user={user} />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/ecosystem" element={<Ecosystem />} />
                        <Route path="/community" element={<Community user={user} />} />
                        <Route path="/jobs" element={<JobPortal user={user} />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/admin" element={<AdminDashboard user={user} />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </HashRouter>
    );
};

export default App;
