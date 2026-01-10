
export interface User {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    role?: 'super_admin' | 'admin' | 'moderator' | 'instructor' | 'student' | 'user'; 
    phone?: string;
    whatsapp?: string; 
    
    // Professional Details
    profession?: 'Student' | 'Job Holder' | 'Unemployed' | 'Business'; 
    currentAddress?: string; 
    bio?: string;
    
    // If Student
    institution?: string;
    department?: string;
    studentClass?: string; // Semester/Year

    // If Job Holder
    companyName?: string;
    designation?: string;

    // If Unemployed
    goal?: string;

    address?: string;
    linkedin?: string;
    portfolio?: string;
    skills?: string;
    createdAt?: any;
    lastLogin?: any;
    deviceInfo?: any;
    emailVerified?: boolean;
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
    category?: string;
    viewCount?: number; 
}

export interface JobInterest {
    id?: string;
    jobId: string;
    jobTitle: string;
    userId: string;
    userName: string;
    userEmail: string;
    phone?: string; 
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
    date: string; 
    time: string;
    link: string;
    module?: number;
    createdAt?: any;
}

// New Type for Workshop/Seminar Management
export interface Workshop {
    id?: string;
    title: string;
    category: 'Workshop' | 'Seminar';
    description: string;
    type: 'Online' | 'Offline';
    imageUrl: string;
    date: string;
    time: string;
    location?: string; // Meeting link or Venue
    feeType: 'Free' | 'Paid';
    fee?: number;
    status: 'Upcoming' | 'Completed';
    createdAt: any;
}

// New Type for Major Events
export interface MajorEvent {
    id?: string;
    title: string;
    description: string;
    type: 'Offline' | 'Online';
    imageUrl: string;
    date: string;
    time: string;
    location: string;
    fee: number; // 0 for free
    
    // Optional Dynamic Fields
    guests?: { name: string; designation: string; imageUrl?: string; type: 'Guest' | 'Speaker' }[];
    sponsors?: { name: string; logoUrl?: string }[];
    rewards?: string[]; // List of rewards
    schedule?: { time: string; activity: string }[];
    
    createdAt: any;
}

// Unified Registration Type for Workshops & Events
export interface EventRegistration {
    id?: string;
    eventId: string; // ID of the Workshop or MajorEvent
    eventType: 'Workshop' | 'Event';
    eventTitle: string;
    eventDate: string;
    
    // User Info
    userId: string;
    name: string;
    phone: string;
    email: string;
    photoURL?: string;
    
    // Profession Logic
    profession: 'Student' | 'Job Holder' | 'Unemployed';
    details: {
        institution?: string;
        semester?: string;
        department?: string;
        company?: string;
        position?: string;
        goal?: string;
    };

    // Payment
    paymentMethod?: 'Bkash' | 'Nagad';
    transactionId?: string;
    amountPaid?: number;

    status: 'pending' | 'approved' | 'declined' | 'completed'; // Completed means attended/certificate eligible
    ticketCode?: string; // Generated on approval
    createdAt: any;
}

export interface EcosystemApplication {
    id?: string;
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
    batch?: string;
    studentId?: string; 
    joinDate?: any;
    currentPhase: 'Learning' | 'Assessment' | 'Internship'; 
    currentModule?: number;
    notices?: EcosystemNotice[];
    totalPaid?: number; 
    dueAmount?: number; 
    scores: {
        sales: number;
        communication: number;
        networking: number;
        eq: number; 
        attendance: number;
        assignment: number;
    };
    attendanceRecord?: Record<string, 'Present' | 'Absent' | 'Late'>;
    kitStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
    assignedInternship?: {
        companyName: string;
        role: string;
        type: 'Online' | 'Offline';
        joiningDate: string;
        stipend?: string;
        status: 'Selected' | 'Ongoing' | 'Completed';
    };
    cvRequestStatus?: 'None' | 'Requested' | 'Processing' | 'Completed';
    cvLink?: string; 
    remarks?: string;
}

export interface CommunityMember {
    id?: string;
    name: string;
    phone: string;
    email: string;
    category?: string; 
    role: string; 
    createdAt?: any;
    userId?: string;
    imageUrl?: string;
    photoURL?: string;
}

export interface BlogPost {
    id?: string;
    title: string;
    excerpt: string;
    author: string;
    date?: any; 
    imageUrl: string;
    content?: string;
    category?: string;
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
    details: any; 
    createdAt: any;
    source?: string;
}

export interface Affiliate {
    id?: string;
    name: string;
    phone: string;
    email: string;
    institution?: string;
    type: 'Affiliate' | 'Campus Ambassador';
    imageUrl?: string;
    userId?: string;
    createdAt: any;
    status: 'pending' | 'approved' | 'rejected' | 'banned' | 'alumni';
    balance: number;         
    totalEarnings: number;
    referralCode?: string;   
    referralCount?: number;
    department?: string;
    currentPoints?: number;
    tasksCompleted?: number;
    assignedTask?: string;
    meetingLink?: string;
    startDate?: any;
    role?: string;
}

export interface WithdrawalRequest {
    id?: string;
    userId: string;
    userName: string;
    amount: number;
    method: 'Bkash' | 'Nagad' | 'Bank';
    accountNumber: string;
    status: 'pending' | 'paid' | 'rejected';
    requestDate: any;
    paidDate?: any;
}

export interface AmbassadorTask {
    id?: string;
    title: string;
    description: string;
    points: number;
    deadline: string;
    type: 'Social Share' | 'Event' | 'Content' | 'Other';
    status: 'Active' | 'Closed';
    createdAt: any;
    assignedTo?: string; 
    link?: string;
}

export interface CommunityMeeting {
    id?: string;
    title: string;
    date: string;
    time: string;
    platform: 'Google Meet' | 'Zoom' | 'Offline';
    link: string;
    assignedTo: string;
    createdAt?: any;
}

export interface Instructor {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    specialty?: string;
    salary?: number; 
    createdAt: any;
}
