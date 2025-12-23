
export interface User {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    isAdmin?: boolean;
    // Extended Profile
    phone?: string;
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
    applyLink?: string;
    userId?: string;     
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
