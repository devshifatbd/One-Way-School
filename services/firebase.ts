import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    User as FirebaseUser
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    setDoc, 
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
    appId: "1:864192786854:web:f07a1e8450ed6dce579f67"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

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

const saveUserToDB = async (user: FirebaseUser, name?: string) => {
    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name || user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        lastLogin: serverTimestamp()
    }, { merge: true });
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
        throw error;
    }
};

export const saveLead = async (data: any) => {
    try {
        await addDoc(collection(db, 'leads'), {
            ...data,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error saving lead", error);
        throw error;
    }
};

export const saveAffiliate = async (data: any) => {
    try {
        await addDoc(collection(db, 'affiliates'), {
            ...data,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error saving affiliate", error);
        throw error;
    }
};

export const getLeads = async () => {
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAffiliates = async () => {
    const q = query(collection(db, 'affiliates'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUsers = async () => {
    const q = query(collection(db, 'users'), orderBy('lastLogin', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
