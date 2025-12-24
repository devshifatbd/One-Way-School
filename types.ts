
export interface User {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    role?: 'admin' | 'instructor' | 'student' | 'user'; // Roles
    // Extended Profile
    phone?: string;
    whatsapp?: string; // New
    profession?: string; // New
    currentAddress?: string; // New
    bio?: string;
    institution?: string;
    address?: string;
    linkedin?: string;
    portfolio?: string;
    skills?: string;
}

export interface Job {
    id?: string;
    title: string;
    company: string;
    vacancy?: string; 
    deadline?: string; 
    jobContext?: string; 
    responsibilities?: string; 
    employmentStatus: 'Full-time' | 'Part-time' | 'Contractual' | 'Internship' | 'Freelance';
    workplace?: 'Work at office' | 'Work from home' | 'Hybrid'; 
    educationalRequirements?: string; 
    experienceRequirements?: string; 
    additionalRequirements?: string; 
    location: string;
    salary: string;
    compensationAndBenefits?: string; 
    postedDate?: any; 
    description?: string; 
    applyLink?: string; // Can be URL or Email
    userId?: string;     
    userEmail?: string; 
    category?: string; // New Category
}

export interface JobInterest {
    id?: string;
    jobId: string;
    jobTitle: string;
    userId: string;
    userName: string;
    userEmail: string;
    clickedAt: any;
}

export interface EcosystemNotice {
    id: string;
    title: string;
    message: string;
    date: any;
    type: 'urgent' | 'info' | 'class';
}

export interface ClassSession {
    id?: string;
    batch: string;
    topic: string;
    mentorName: string;
    date: string; // ISO Date string
    time: string;
    link: string;
    module?: number;
    createdAt?: any;
    materials?: { title: string; url: string; type: 'pdf' | 'video' }[];
}

export interface EcosystemApplication {
    id?: string;
    // Auto-filled from User Profile
    name: string;
    phone: string;
    email: string;
    photoURL?: string;
    institution?: string;
    
    transactionId: string;
    paymentMethod: 'Bkash' | 'Nagad';
    paymentDetails?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: any;
    userId: string;
    
    // LMS / Classroom Features
    batch?: string;
    studentId?: string; // Generated OWS-ID
    joinDate?: any;
    currentPhase: 'Learning' | 'Assessment' | 'Internship'; // Journey Phase
    
    classLink?: string; // Upcoming class link
    classDates?: string[]; // Array of ISO date strings for the calendar
    notices?: EcosystemNotice[];
    
    // Granular Payment Tracking
    paymentStatus: {
        admission: boolean; // 1500
        module1: boolean;   // 2000
        module2: boolean;   // 2000
        module3: boolean;   // 2000
        module4: boolean;   // 2000
    };
    totalPaid?: number; // Calculated total
    
    // Performance & Scoring (4 Pillars)
    scores: {
        sales: number;
        communication: number;
        networking: number;
        eq: number; // Emotional Intelligence
        attendance: number;
        assignment: number;
    };
    
    // Logistics
    kitStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
    
    // Internship (Talent Matchmaking)
    assignedInternship?: {
        companyName: string;
        role: string;
        type: 'Online' | 'Offline';
        joiningDate: string;
        stipend?: string;
    };
    
    remarks?: string;
}

export interface CommunityMember {
    id?: string;
    name: string;
    phone: string;
    email: string;
    category?: string; // New Category Field
    role: string; // Position
    createdAt?: any;
    userId?: string; // Admin's ID who added this member (for permissions)
    userEmail?: string;  
}

export interface BlogPost {
    id?: string;
    title: string;
    excerpt: string;
    author: string;
    date?: any; 
    imageUrl: string;
    content?: string;
    userId?: string;     
    userEmail?: string;  
}

export interface Course {
    id?: string;
    title: string;
    instructor: string;
    price: string;
    duration: string;
    imageUrl: string;
    category: string;
    userId?: string;     
    userEmail?: string;  
}

export interface Lead {
    id?: string;
    name: string;
    phone: string;
    email?: string;
    profession: string;
    goal: string;
    details: any; 
    imageUrl?: string;
    createdAt: any;
    userId?: string;
    source?: string;
}

export interface Affiliate {
    id?: string;
    name: string;
    phone: string;
    email: string;
    class_semester?: string;
    institution?: string;
    type: 'Affiliate' | 'Campus Ambassador';
    imageUrl?: string;
    createdAt: any;
    userId?: string;
    source?: string;
    // New Fields for System
    status: 'pending' | 'approved' | 'rejected';
    referralCode?: string;
    balance: number;         // Current withdrawable balance
    totalEarnings: number;   // Lifetime earnings
    bkashNumber?: string;
}

export interface WithdrawalRequest {
    id?: string;
    userId: string;
    userName: string;
    amount: number;
    method: 'Bkash' | 'Nagad' | 'Bank';
    accountNumber: string;
    status: 'pending' | 'completed' | 'rejected';
    createdAt: any;
}

export interface Instructor {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    specialty?: string;
    createdAt: any;
}