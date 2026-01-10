
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup, 
    signOut, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInAnonymously,
    updateProfile,
    sendPasswordResetEmail, 
    sendEmailVerification,
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
import { uploadFileToDrive } from './googleDriveService';

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

// Standard Google Provider (No special Drive scopes needed for Apps Script method)
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

const ADMIN_EMAILS = ['onewayschool.bd@gmail.com', 'onewayschool.bd@gamil.com', 'admin@ows.com'];

// Helper to sort by createdAt descending (Client-side)
const sortByDateDesc = (a: any, b: any) => {
    // Handle Firestore Timestamp or JS Date
    const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt instanceof Date ? a.createdAt.getTime() : 0);
    const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt instanceof Date ? b.createdAt.getTime() : 0);
    return timeB - timeA;
};

// Safe DB Save (Doesn't block auth if DB write fails)
const saveUserToDB = async (user: FirebaseUser, name?: string, role: string = 'user') => {
    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        const deviceInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform || 'Unknown',
            lastUpdated: new Date().toISOString()
        };

        // FORCE ADMIN ROLE if email is in list
        let finalRole = role;
        if (user.email && ADMIN_EMAILS.includes(user.email)) {
            finalRole = 'admin';
        }

        const updateData = {
            lastLogin: serverTimestamp(),
            email: user.email,
            deviceInfo: deviceInfo,
            role: finalRole // Ensure role is updated/enforced
        };
        
        if (!userSnap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                name: name || user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                role: finalRole,
                createdAt: serverTimestamp(),
                ...updateData
            });
        } else {
            await setDoc(userRef, updateData, { merge: true });
        }
    } catch (e) {
        console.warn("Failed to save user to DB, likely permission issue. Auth still successful.", e);
    }
};

// --- GLOBAL SEARCH ---
export const globalSearchSystem = async (term: string) => {
    if (!term) return [];
    const lowerTerm = term.toLowerCase();
    const results: any[] = [];

    // Search Helper
    const searchInCol = async (col: string, type: string) => {
        const snap = await getDocs(collection(db, col));
        snap.forEach(doc => {
            const data = doc.data();
            const searchable = `${data.name} ${data.phone} ${data.email} ${data.studentId || ''} ${data.id || ''}`.toLowerCase();
            if (searchable.includes(lowerTerm)) {
                results.push({ id: doc.id, type, ...data });
            }
        });
    };

    await Promise.all([
        searchInCol('ecosystem_applications', 'Student'),
        searchInCol('users', 'User'),
        searchInCol('affiliates', 'Affiliate'),
    ]);

    return results;
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

// MODIFIED: Upload Image to Google Drive using Apps Script Service
export const uploadProfileImage = async (file: File, uid: string) => {
    try {
        // Upload using Apps Script Web App
        const driveUrl = await uploadFileToDrive(file);
        
        // Update Profiles in Firebase Auth and Firestore
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, { photoURL: driveUrl });
        }
        await updateUserProfile(uid, { photoURL: driveUrl });
        
        return driveUrl;

    } catch (error) {
        console.error("Error uploading image to Drive:", error);
        throw error;
    }
};

export const getUserApplications = async (uid: string) => {
    const fetchCollection = async (colName: string, type: string) => {
        try {
            const q = query(collection(db, colName), where('userId', '==', uid));
            const snap = await getDocs(q);
            return snap.docs.map(doc => ({ id: doc.id, type, ...doc.data() }));
        } catch (error) {
            console.warn(`Failed to fetch ${colName}:`, error);
            return [];
        }
    };

    const [leads, affiliates, ecosystem] = await Promise.all([
        fetchCollection('leads', 'job/lead'),
        fetchCollection('affiliates', 'affiliate'),
        fetchCollection('ecosystem_applications', 'Ecosystem Program')
    ]);

    const allApps = [...leads, ...affiliates, ...ecosystem];
    return allApps.sort(sortByDateDesc);
};

export const getUserJobInterests = async (uid: string) => {
    try {
        const q = query(collection(db, 'job_interests'), where('userId', '==', uid));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return data.sort(sortByDateDesc);
    } catch (error) {
        console.warn("Failed to fetch job interests", error);
        return [];
    }
}

// Auth Functions (Simplified - No Drive Scopes)
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

export const signInWithFacebook = async () => {
    try {
        const result = await signInWithPopup(auth, facebookProvider);
        const user = result.user;
        await saveUserToDB(user);
        return user;
    } catch (error) {
        console.error("Error signing in with Facebook", error);
        throw error;
    }
};

export const registerWithEmail = async (name: string, email: string, pass: string) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(result.user, { displayName: name });
        await saveUserToDB(result.user, name);
        await sendVerificationEmail(result.user);
        return result.user;
    } catch (error) {
        console.error("Registration Error", error);
        throw error;
    }
};

export const sendVerificationEmail = async (user: FirebaseUser) => {
    try {
        await sendEmailVerification(user);
    } catch (e) {
        console.error("Verification email failed", e);
    }
}

export const loginWithEmail = async (email: string, pass: string) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, pass);
        await saveUserToDB(result.user); // Capture Login Info
        return result.user;
    } catch (error) {
        console.error("Login Error", error);
        throw error;
    }
};

export const resetPassword = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error("Reset Password Error", error);
        throw error;
    }
};

export const loginAnonymously = async () => {
    try {
        const result = await signInAnonymously(auth);
        return result.user;
    } catch (error) {
        console.warn("Anonymous Login Error:", error);
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
        if (!id) throw new Error("Invalid ID for update");
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
        // CLIENT SIDE SORTING FIX:
        // Instead of orderBy which requires index, fetch all and sort in JS
        const snapshot = await getDocs(collection(db, collectionName));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return data.sort(sortByDateDesc);
    } catch (err) {
        console.error(`Error fetching ${collectionName}`, err);
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

// --- WORKSHOP & EVENT FUNCTIONS ---
export const saveWorkshop = (data: any) => addData('workshops', data);
export const getWorkshops = () => getData('workshops');
export const updateWorkshop = (id: string, data: any) => updateData('workshops', id, data);
export const deleteWorkshop = (id: string) => deleteData('workshops', id);

export const saveMajorEvent = (data: any) => addData('major_events', data);
export const getMajorEvents = () => getData('major_events');
export const updateMajorEvent = (id: string, data: any) => updateData('major_events', id, data);
export const deleteMajorEvent = (id: string) => deleteData('major_events', id);

// --- REGISTRATION FUNCTIONS ---
export const saveEventRegistration = (data: any) => addData('event_registrations', data);
export const getEventRegistrations = async (eventId: string) => {
    try {
        const q = query(collection(db, 'event_registrations'), where('eventId', '==', eventId));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return data.sort(sortByDateDesc);
    } catch (e) {
        console.error(e);
        return [];
    }
};
export const getUserRegistrations = async (userId: string) => {
    try {
        const q = query(collection(db, 'event_registrations'), where('userId', '==', userId));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort(sortByDateDesc);
    } catch(e) { return []; }
};
export const updateRegistrationStatus = async (id: string, status: string, code?: string) => {
    const update: any = { status };
    if(code) update.ticketCode = code;
    return updateData('event_registrations', id, update);
};


// --- SPECIFIC EXPORTS ---
export const saveLead = (data: any) => addData('leads', data);
export const getLeads = () => getData('leads');
export const deleteLead = (id: string) => deleteData('leads', id);

export const saveAffiliate = (data: any) => addData('affiliates', data);
export const getAffiliates = () => getData('affiliates');
export const updateAffiliateStatus = async (id: string, status: string, referralCode?: string) => {
    try {
        const data: any = { status };
        if(referralCode) data.referralCode = referralCode;
        if(status === 'approved') data.startDate = serverTimestamp();
        await updateData('affiliates', id, data);
    } catch(e) { throw e; }
};

export const saveWithdrawalRequest = (data: any) => addData('withdrawals', data);
export const getWithdrawalRequests = () => getData('withdrawals');
export const updateWithdrawalStatus = async (id: string, status: string) => {
    try {
        const data: any = { status };
        if(status === 'paid') data.paidDate = serverTimestamp();
        await updateData('withdrawals', id, data);
    } catch(e) { throw e; }
};

// Ambassador Tasks
export const saveAmbassadorTask = (data: any) => addData('ambassador_tasks', data);
export const getAmbassadorTasks = () => getData('ambassador_tasks');
export const deleteAmbassadorTask = (id: string) => deleteData('ambassador_tasks', id);

// Community Meetings
export const saveCommunityMeeting = (data: any) => addData('community_meetings', data);
export const getCommunityMeetings = () => getData('community_meetings');
export const updateCommunityMeeting = (id: string, data: any) => updateData('community_meetings', id, data);
export const deleteCommunityMeeting = (id: string) => deleteData('community_meetings', id);

// New Feature: Complete Tenure
export const completeAmbassadorTenure = async (id: string) => {
    try {
        // Change status to alumni and type to Campus Ambassador
        await updateData('affiliates', id, { 
            status: 'alumni', 
            type: 'Campus Ambassador',
            role: 'Campus Ambassador (Alumni)', // Ensure role reflects alumni status
            endDate: serverTimestamp()
        });
    } catch(e) { throw e; }
};

export const saveJobInterest = (data: any) => addData('job_interests', data);
export const getJobInterests = () => getData('job_interests');
export const deleteJobInterest = (id: string) => deleteData('job_interests', id);

export const saveEcosystemApplication = (data: any) => addData('ecosystem_applications', data);
export const getEcosystemApplications = () => getData('ecosystem_applications');
export const updateEcosystemAppStatus = (id: string, status: string) => updateData('ecosystem_applications', id, { status });
export const updateEcosystemStudent = (id: string, data: any) => updateData('ecosystem_applications', id, data);

export const updateBatchClassDetails = async (batchName: string, data: any) => {
    try {
        const q = query(collection(db, 'ecosystem_applications'), where('batch', '==', batchName));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            console.log("No students found in batch:", batchName);
            return 0;
        }

        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
            batch.update(doc.ref, {
                ...data,
                updatedAt: serverTimestamp()
            });
        });
        await batch.commit();
        return snapshot.size;
    } catch (e) {
        console.error("Batch update failed", e);
        throw e;
    }
};

export const saveClassSession = (data: any) => addData('class_sessions', data);
export const updateClassSession = (id: string, data: any) => updateData('class_sessions', id, data);
export const getClassSessions = () => getData('class_sessions');
export const deleteClassSession = (id: string) => deleteData('class_sessions', id);

// Resources
export const saveResource = (data: any) => addData('resources', data);
export const updateResource = (id: string, data: any) => updateData('resources', id, data);
export const getResources = () => getData('resources');
export const deleteResource = (id: string) => deleteData('resources', id);

// Notices History
export const saveNoticeToHistory = (data: any) => addData('notice_history', data);
export const updateNoticeHistory = (id: string, data: any) => updateData('notice_history', id, data);
export const getNoticesHistory = () => getData('notice_history');

export const sendBatchNotice = async (targetBatch: string, notice: any) => {
    try {
        // 1. Save to Notice History Collection
        await saveNoticeToHistory({
            ...notice,
            targetBatch,
            createdAt: serverTimestamp()
        });

        // 2. Distribute to Students
        let q;
        if (targetBatch === 'All') {
            q = query(collection(db, 'ecosystem_applications'), where('status', '==', 'approved'));
        } else {
            q = query(collection(db, 'ecosystem_applications'), where('batch', '==', targetBatch));
        }
        const snapshot = await getDocs(q);
        if (snapshot.empty) return 0;
        const batch = writeBatch(db);
        snapshot.docs.forEach((docSnap) => {
            const currentData = docSnap.data();
            const existingNotices = currentData.notices || [];
            batch.update(docSnap.ref, {
                notices: [notice, ...existingNotices]
            });
        });
        await batch.commit();
        return snapshot.size;
    } catch (e) {
        console.error("Batch notice failed", e);
        throw e;
    }
};

export const createInstructor = async (instructorData: any, pass: string) => {
    try {
        await addDoc(collection(db, 'instructors'), {
            ...instructorData,
            createdAt: serverTimestamp()
        });
    } catch (e) { throw e; }
};

export const getInstructors = () => getData('instructors');

export const saveCommunityMember = (data: any) => addData('community_members', data);
export const getCommunityMembers = () => getData('community_members');

export const getCommunityMemberByPhone = async (phone: string) => {
    const variations = [phone, `+88${phone}`, `88${phone}`, phone.startsWith('0') ? phone.substring(1) : phone];
    const uniquePhones = [...new Set(variations)];
    const searchCollection = async (colName: string, extraConstraints: any[] = []) => {
        for (const p of uniquePhones) {
            try {
                const q = query(collection(db, colName), where('phone', '==', p), ...extraConstraints);
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    const docData = snapshot.docs[0].data();
                    return { id: snapshot.docs[0].id, ...docData };
                }
            } catch (e) {}
        }
        return null;
    };
    let foundMember = await searchCollection('community_members');
    if (foundMember) return foundMember;
    
    // Search active affiliates/ambassadors
    const affiliateMember = await searchCollection('affiliates', [where('status', '==', 'approved')]);
    if (affiliateMember) {
        return {
            id: affiliateMember.id,
            name: affiliateMember.name,
            phone: affiliateMember.phone,
            email: affiliateMember.email,
            role: affiliateMember.type === 'Campus Ambassador' ? 'Campus Ambassador' : 'Community Member',
            category: affiliateMember.type === 'Campus Ambassador' ? 'Campus Ambassador' : 'Affiliate',
            createdAt: affiliateMember.createdAt
        };
    }
    // Search alumni
    const alumniMember = await searchCollection('affiliates', [where('status', '==', 'alumni')]);
    if (alumniMember) {
        return {
            id: alumniMember.id,
            name: alumniMember.name,
            phone: alumniMember.phone,
            email: alumniMember.email,
            role: 'Campus Ambassador (Alumni)',
            category: 'Campus Ambassador',
            createdAt: alumniMember.createdAt
        };
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
        // Client Sort
        const snapshot = await getDocs(collection(db, 'users'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return data.sort((a: any, b: any) => (b.lastLogin?.seconds || 0) - (a.lastLogin?.seconds || 0));
    } catch (err) { return []; }
};

export const deleteUserDoc = (id: string) => deleteData('users', id);

export const saveJob = (data: any) => addData('jobs', data);
export const updateJob = (id: string, data: any) => updateData('jobs', id, data);
export const getJobs = () => getData('jobs');
export const deleteJob = (id: string) => deleteData('jobs', id);
export const bulkSaveJobs = async (jobs: any[]) => {
    try {
        const batch = writeBatch(db);
        jobs.forEach(job => {
            const docRef = doc(collection(db, "jobs"));
            batch.set(docRef, { ...job, createdAt: serverTimestamp(), postedDate: serverTimestamp() });
        });
        await batch.commit();
    } catch(e) { throw e; }
};

export const saveBlogPost = (data: any) => addData('blogs', data);
export const updateBlogPost = (id: string, data: any) => updateData('blogs', id, data);
export const getBlogPosts = () => getData('blogs');
export const deleteBlogPost = (id: string) => deleteData('blogs', id);

export const saveCourse = (data: any) => addData('courses', data);
export const updateCourse = (id: string, data: any) => updateData('courses', id, data);
export const getCourses = () => getData('courses');
export const deleteCourse = (id: string) => deleteData('courses', id);
