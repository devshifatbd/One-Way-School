export interface User {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    isAdmin?: boolean;
}

export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    type: 'Full-time' | 'Part-time' | 'Internship' | 'Remote';
    salary: string;
    postedDate: string;
    description: string;
}

export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    author: string;
    date: string;
    imageUrl: string;
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
}
