
export interface User {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    role?: 'super_admin' | 'admin' | 'moderator' | 'instructor' | 'student' | 'user'; 
    phone?: string;
    whatsapp?: string; 
    profession?: string; 
    currentAddress?: string; 
    bio?: string;
    institution?: string;
    address?: string;
    linkedin?: string;
    portfolio?: string;
    skills?: string;
    createdAt?: any;
    lastLogin?: any;
    deviceInfo?: any;
}

export interface AuditLog {
    id?: string;
    action: string; // e.g., "Deleted Invoice", "Approved Student"
    performedBy: string; // Admin Name
    performedByEmail: string;
    targetId?: string; // ID of the item affected
    details: string;
    timestamp: any;
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
    
    // LMS Features
    batch?: string;
    studentId?: string; 
    joinDate?: any;
    currentPhase: 'Learning' | 'Assessment' | 'Internship'; 
    currentModule?: number;
    
    notices?: EcosystemNotice[];
    
    // Payment Tracking
    totalPaid?: number; 
    dueAmount?: number; 
    
    // Performance
    scores: {
        sales: number;
        communication: number;
        networking: number;
        eq: number; 
        attendance: number;
        assignment: number;
    };
    
    // Attendance: Key = Date (YYYY-MM-DD), Value = Status
    attendanceRecord?: Record<string, 'Present' | 'Absent' | 'Late'>;

    // Logistics
    kitStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
    
    // Internship
    assignedInternship?: {
        companyName: string;
        role: string;
        type: 'Online' | 'Offline';
        joiningDate: string;
        stipend?: string;
        status: 'Selected' | 'Ongoing' | 'Completed';
    };
    
    // CV & Resources
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
    
    // Ambassador Specifics
    department?: string;
    currentPoints?: number;
    tasksCompleted?: number;
    assignedTask?: string;
    meetingLink?: string;
    startDate?: any;
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

// Detailed Employer Interface (HR) - Flexible
export interface Employer {
    id?: string;
    name: string;        
    mobile?: string;
    email?: string;
    dob?: string;
    permanentAddress?: string;
    currentAddress?: string;
    nid?: string;
    imageUrl?: string;
    designation?: string;
    salary?: number;
    joiningDate?: string;
    status?: 'Active' | 'Inactive';
    createdAt?: any;
    lastPaidMonth?: string;
    documents?: string[]; // Links to docs
}

// Financial Record Interface
export interface FinancialRecord {
    id?: string;
    type: 'Income' | 'Expense';
    category: 'Course Fee' | 'Affiliate Payout' | 'Salary' | 'Marketing' | 'Office Rent' | 'Utility' | 'Software' | 'Misc';
    amount: number;
    date: any;
    description: string;
    paymentMethod: 'Cash' | 'Bank Transfer' | 'Bkash' | 'Nagad' | 'Cheque';
    accountName?: string; 
    authorizedBy?: string; // Who created the record
    designation?: string;  // Their position
    relatedUserId?: string; 
    invoiceId?: string;
}