export interface User {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    isAdmin?: boolean;
}

export interface Job {
    id?: string;
    title: string;
    company: string;
    vacancy?: string; // New
    deadline?: string; // New
    jobContext?: string; // New
    responsibilities?: string; // New
    employmentStatus: 'Full-time' | 'Part-time' | 'Contractual' | 'Internship' | 'Freelance';
    workplace?: 'Work at office' | 'Work from home' | 'Hybrid'; // New
    educationalRequirements?: string; // New
    experienceRequirements?: string; // New
    additionalRequirements?: string; // New
    location: string;
    salary: string;
    compensationAndBenefits?: string; // New
    postedDate?: any; 
    description?: string; // Summary
    applyLink?: string; 
}

export interface BlogPost {
    id?: string;
    title: string;
    excerpt: string;
    author: string;
    date?: any; // Timestamp
    imageUrl: string;
    content?: string; // Full content
}

export interface Course {
    id?: string;
    title: string;
    instructor: string;
    price: string;
    duration: string;
    imageUrl: string;
    category: string;
}

export interface Lead {
    id?: string;
    name: string;
    phone: string;
    email?: string;
    profession: string;
    goal: string;
    details: any; // studentInfo or jobInfo
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
    class_semester: string;
    institution: string;
    type: string;
    imageUrl?: string;
    createdAt: any;
    userId?: string;
    source?: string;
}