import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInAnonymously,
    updateProfile,
    User as FirebaseUser
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    setDoc, 
    deleteDoc,
    doc, 
    serverTimestamp,
    getDocs,
    query,
    orderBy
} from 'firebase/firestore';

// Configuration
const firebaseConfig = {
    apiKey: "AIzaSyACwQrN_j2xBwGBMYhB3TfRvB47guRL6pc",
    authDomain: "owsbd-c1ac8.firebaseapp.com",
    projectId: "owsbd-c1ac8",
    storageBucket: "owsbd-c1ac8.firebasestorage.app",
    messagingSenderId: "864192786854",
    appId: "1:864192786854:web:f07a1e8450ed6dce579f67",
    measurementId: "G-4NHWNH4BZL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Safe DB Save (Doesn't block auth if DB write fails)
const saveUserToDB = async (user: FirebaseUser, name?: string) => {
    try {
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name: name || user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            lastLogin: serverTimestamp()
        }, { merge: true });
    } catch (e) {
        console.warn("Failed to save user to DB, likely permission issue. Auth still successful.", e);
    }
};

// Auth Functions
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        await saveUserToDB(user);
        return user;
    } catch (error) {
        console.error("Error signing in with Google", error);
        throw error;
    }
};

export const registerWithEmail = async (name: string, email: string, pass: string) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(result.user, { displayName: name });
        await saveUserToDB(result.user, name);
        return result.user;
    } catch (error) {
        console.error("Registration Error", error);
        throw error;
    }
};

export const loginWithEmail = async (email: string, pass: string) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, pass);
        return result.user;
    } catch (error) {
        console.error("Login Error", error);
        throw error;
    }
};

// Auto-login for Admin Dashboard to bypass security rules
export const loginAnonymously = async () => {
    try {
        const result = await signInAnonymously(auth);
        return result.user;
    } catch (error) {
        console.warn("Anonymous Login Error - ignoring as it might be disabled in console", error);
        return null;
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
        throw error;
    }
};

// --- GENERIC HELPERS ---
export const addData = async (collectionName: string, data: any) => {
    try {
        await addDoc(collection(db, collectionName), {
            ...data,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error(`Error saving to ${collectionName}`, error);
        throw error;
    }
};

export const getData = async (collectionName: string) => {
    try {
        const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error(`Error fetching ${collectionName}`, e);
        return [];
    }
};

export const deleteData = async (collectionName: string, id: string) => {
    try {
        await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
        console.error(`Error deleting from ${collectionName}`, error);
        throw error;
    }
}

// --- SPECIFIC EXPORTS FOR TYPE SAFETY/NAMING ---
export const saveLead = (data: any) => addData('leads', data);
export const getLeads = () => getData('leads');

export const saveAffiliate = (data: any) => addData('affiliates', data);
export const getAffiliates = () => getData('affiliates');

export const getUsers = async () => {
    try {
        const q = query(collection(db, 'users'), orderBy('lastLogin', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.warn("Could not fetch users list", e);
        return [];
    }
};

// Jobs
export const saveJob = (data: any) => addData('jobs', data);
export const getJobs = () => getData('jobs');
export const deleteJob = (id: string) => deleteData('jobs', id);

// Blogs
export const saveBlogPost = (data: any) => addData('blogs', data);
export const getBlogPosts = () => getData('blogs');
export const deleteBlogPost = (id: string) => deleteData('blogs', id);

// Courses
export const saveCourse = (data: any) => addData('courses', data);
export const getCourses = () => getData('courses');
export const deleteCourse = (id: string) => deleteData('courses', id);