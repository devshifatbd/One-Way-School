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
    getDoc,
    deleteDoc,
    updateDoc,
    doc, 
    serverTimestamp,
    getDocs,
    query,
    orderBy,
    where,
    writeBatch
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
export const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Safe DB Save (Doesn't block auth if DB write fails)
const saveUserToDB = async (user: FirebaseUser, name?: string) => {
    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        // Only update basic auth info, don't overwrite detailed profile if it exists
        if (!userSnap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                name: name || user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp()
            });
        } else {
            await setDoc(userRef, {
                lastLogin: serverTimestamp()
            }, { merge: true });
        }
    } catch (e) {
        console.warn("Failed to save user to DB, likely permission issue. Auth still successful.", e);
    }
};

// --- USER PROFILE FUNCTIONS ---
export const getUserProfile = async (uid: string) => {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching user profile", error);
        return null;
    }
};

export const updateUserProfile = async (uid: string, data: any) => {
    try {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, data, { merge: true });
        return true;
    } catch (error) {
        console.error("Error updating profile", error);
        throw error;
    }
};

export const uploadProfileImage = async (file: File, uid: string) => {
    try {
        const storageRef = ref(storage, `profile_images/${uid}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        
        // Update Auth Profile
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, { photoURL: downloadURL });
        }
        
        // Update Firestore User Doc
        await updateUserProfile(uid, { photoURL: downloadURL });
        
        return downloadURL;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
};

// Helper function to sort by createdAt descending (Client-side)
const sortByDateDesc = (a: any, b: any) => {
    const timeA = a.createdAt?.seconds || 0;
    const timeB = b.createdAt?.seconds || 0;
    return timeB - timeA;
};

export const getUserApplications = async (uid: string) => {
    try {
        // NOTE: Removed 'orderBy' from queries to prevent "Missing Index" errors.
        // Sorting is done in JavaScript instead.
        
        // Fetch Leads (Job Applications)
        const leadsQ = query(collection(db, 'leads'), where('userId', '==', uid));
        const leadsSnap = await getDocs(leadsQ);
        const leads = leadsSnap.docs.map(doc => ({ id: doc.id, type: 'job/lead', ...doc.data() }));

        // Fetch Affiliate Applications
        const affQ = query(collection(db, 'affiliates'), where('userId', '==', uid));
        const affSnap = await getDocs(affQ);
        const affiliates = affSnap.docs.map(doc => ({ id: doc.id, type: 'affiliate', ...doc.data() }));

        // Fetch Ecosystem Applications
        const ecoQ = query(collection(db, 'ecosystem_applications'), where('userId', '==', uid));
        const ecoSnap = await getDocs(ecoQ);
        const ecosystem = ecoSnap.docs.map(doc => ({ id: doc.id, type: 'Ecosystem Program', ...doc.data() }));

        // Merge and Sort
        const allApps = [...leads, ...affiliates, ...ecosystem];
        return allApps.sort(sortByDateDesc);

    } catch (error) {
        console.error("Error fetching user applications:", error);
        return [];
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

export const updateData = async (collectionName: string, id: string, data: any) => {
    try {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error(`Error updating ${collectionName}`, error);
        throw error;
    }
};

export const getData = async (collectionName: string) => {
    try {
        // Keep orderBy here as simple queries usually work without complex indexes
        const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error(`Error fetching ${collectionName} (trying fallback)`, e);
        // Fallback without sort if index is missing
        try {
            const snapshot = await getDocs(collection(db, collectionName));
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return data.sort(sortByDateDesc);
        } catch(err) {
            return [];
        }
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

// Affiliate
export const saveAffiliate = (data: any) => addData('affiliates', data);
export const getAffiliates = () => getData('affiliates');
export const updateAffiliateStatus = async (id: string, status: string, referralCode?: string) => {
    try {
        const data: any = { status };
        if(referralCode) data.referralCode = referralCode;
        await updateData('affiliates', id, data);
    } catch(e) { throw e; }
};
export const saveWithdrawal = (data: any) => addData('withdrawals', data);
export const getWithdrawals = () => getData('withdrawals');

// Job Interest Tracking
export const saveJobInterest = (data: any) => addData('job_interests', data);
export const getJobInterests = () => getData('job_interests');

// Ecosystem Applications
export const saveEcosystemApplication = (data: any) => addData('ecosystem_applications', data);
export const getEcosystemApplications = () => getData('ecosystem_applications');
export const updateEcosystemAppStatus = (id: string, status: string) => updateData('ecosystem_applications', id, { status });
export const updateEcosystemStudent = (id: string, data: any) => updateData('ecosystem_applications', id, data);

// Community Database
export const saveCommunityMember = (data: any) => addData('community_members', data);
export const getCommunityMembers = () => getData('community_members');

export const getCommunityMemberByPhone = async (phone: string) => {
    let foundMember = null;
    
    // 1. Try 'community_members' collection first (Admin Added)
    try {
        const q = query(collection(db, 'community_members'), where('phone', '==', phone));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            foundMember = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        }
    } catch(e) { 
        console.warn("Community DB read failed (Permission/Network), trying fallback...", e);
    }

    if (foundMember) return foundMember;

    // 2. Fallback: Try 'affiliates' collection (User Registered)
    // Users usually have permission to read 'affiliates' (especially their own)
    try {
        const q2 = query(collection(db, 'affiliates'), where('phone', '==', phone), where('status', '==', 'approved'));
        const snap2 = await getDocs(q2);
        
        if (!snap2.empty) {
            const data = snap2.docs[0].data();
            return {
                id: snap2.docs[0].id,
                name: data.name,
                phone: data.phone,
                email: data.email,
                // Map affiliate types to community roles
                role: data.type === 'Campus Ambassador' ? 'Campus Ambassador' : 'Community Member',
                category: data.type === 'Campus Ambassador' ? 'Campus Ambassador' : 'Affiliate',
                createdAt: data.createdAt
            };
        }
    } catch (e) {
        console.error("Fallback search failed", e);
    }

    return null;
};

export const deleteCommunityMember = (id: string) => deleteData('community_members', id);

export const bulkSaveCommunityMembers = async (members: any[]) => {
    try {
        const batch = writeBatch(db);
        members.forEach(member => {
            const docRef = doc(collection(db, "community_members"));
            batch.set(docRef, { ...member, createdAt: serverTimestamp() });
        });
        await batch.commit();
    } catch(e) { throw e; }
};

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
export const updateJob = (id: string, data: any) => updateData('jobs', id, data);
export const getJobs = () => getData('jobs');
export const deleteJob = (id: string) => deleteData('jobs', id);

// Blogs
export const saveBlogPost = (data: any) => addData('blogs', data);
export const updateBlogPost = (id: string, data: any) => updateData('blogs', id, data);
export const getBlogPosts = () => getData('blogs');
export const deleteBlogPost = (id: string) => deleteData('blogs', id);

// Courses
export const saveCourse = (data: any) => addData('courses', data);
export const updateCourse = (id: string, data: any) => updateData('courses', id, data);
export const getCourses = () => getData('courses');
export const deleteCourse = (id: string) => deleteData('courses', id);