
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, ArrowRight, ArrowLeft, Target, Zap, Rocket, CheckCircle2, Loader2, UserCheck, ShieldCheck, Quote, Lock } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { User } from '../types';

interface SelfAssessmentProps {
    user: User | null;
}

const ASSESSMENT_QUESTIONS = [
    {
        id: 1,
        question: "আপনার কাজের ধরন কেমন হলে আপনি বেশি স্বাচ্ছন্দ্যবোধ করেন?",
        options: [
            { label: "খুবই সুশৃঙ্খল এবং রুটিন মাফিক কাজ", value: "structured" },
            { label: "যেখানে প্রতিদিন নতুন চ্যালেঞ্জ থাকে", value: "dynamic" },
            { label: "নিজের ইচ্ছেমতো কাজ করার স্বাধীনতা", value: "flexible" }
        ]
    },
    {
        id: 2,
        question: "আপনি সাধারণত কোনো সমস্যা সমাধান করতে কোনটি বেশি পছন্দ করেন?",
        options: [
            { label: "লজিক এবং ডেটা বিশ্লেষণ করা", value: "analytical" },
            { label: "নতুন কোনো সৃজনশীল উপায় বের করা", value: "creative" },
            { label: "মানুষের সাথে কথা বলে সমাধান করা", value: "social" }
        ]
    },
    {
        id: 3,
        question: "নিচের কোন ক্ষেত্রটি আপনাকে বেশি টানে?",
        options: [
            { label: "প্রযুক্তি এবং সফটওয়্যার তৈরি", value: "technical" },
            { label: "ব্যবসা পরিচালনা এবং বিক্রয় বৃদ্ধি", value: "business" },
            { label: "মানুষকে গাইড করা বা শেখানো", value: "leadership" }
        ]
    },
    {
        id: 4,
        question: "আপনি কি একা কাজ করতে পছন্দ করেন নাকি টিমে?",
        options: [
            { label: "একা নিরিবিলিতে কাজ করা", value: "solo" },
            { label: "টিমের সাথে আইডিয়া শেয়ার করা", value: "team" },
            { label: "টিমকে লিড দিয়ে সামনে এগিয়ে নেওয়া", value: "leader" }
        ]
    },
    {
        id: 5,
        question: "ভবিষ্যতে আপনি নিজেকে কোন অবস্থায় দেখতে চান?",
        options: [
            { label: "একজন দক্ষ টেকনিক্যাল এক্সপার্ট হিসেবে", value: "expert" },
            { label: "একজন সফল উদ্যোক্তা বা সিইও হিসেবে", value: "entrepreneur" },
            { label: "একজন প্রভাবশালী পাবলিক স্পিকার বা মেন্টর হিসেবে", value: "influencer" }
        ]
    },
    {
        id: 6,
        question: "টাকা নাকি কাজের প্রভাব (Impact) - আপনার কাছে কোনটি বড়?",
        options: [
            { label: "আর্থিক স্বচ্ছলতা এবং লাইফস্টাইল", value: "money" },
            { label: "সামাজিক পরিবর্তন এবং মানুষের উপকার", value: "impact" },
            { label: "দুটোরই সামঞ্জস্য", value: "balance" }
        ]
    },
    {
        id: 7,
        question: "ডিজাইন বা আর্ট সম্পর্কে আপনার ধারণা কেমন?",
        options: [
            { label: "আমি সৌন্দর্য এবং ভিজ্যুয়াল খুঁজি", value: "artistic" },
            { label: "আমার কাছে কার্যকারিতা (Functionality) আগে", value: "utilitarian" },
            { label: "আমি এ নিয়ে খুব বেশি ভাবি না", value: "neutral" }
        ]
    },
    {
        id: 8,
        question: "আপনি যখন কোনো নতুন প্রযুক্তি দেখেন, আপনি কী করেন?",
        options: [
            { label: "কিভাবে এটা কাজ করে তা জানার চেষ্টা করি", value: "curious" },
            { label: "এটা দিয়ে কিভাবে টাকা আয় করা যায় তা ভাবি", value: "practical" },
            { label: "জাস্ট এটা ব্যবহার করে মজা নিই", value: "user" }
        ]
    },
    {
        id: 9,
        question: "চাপের মুখে আপনি কেমন কাজ করেন?",
        options: [
            { label: "খুবই শান্ত থেকে ধাপে ধাপে কাজ করি", value: "calm" },
            { label: "একটু নার্ভাস হই কিন্তু শেষ করতে পারি", value: "resilient" },
            { label: "আমি চাপের মধ্যে আরও ভালো কাজ করি", value: "pioneer" }
        ]
    },
    {
        id: 10,
        question: "আপনার প্রিয় শখ কোনটি হতে পারে?",
        options: [
            { label: "কোডিং বা নতুন গ্যাজেট চালানো", value: "tech_hobby" },
            { label: "বই পড়া বা লেখালেখি করা", value: "intellectual" },
            { label: "মানুষের সাথে আড্ডা দেওয়া বা নেটওয়ার্কিং", value: "extrovert" }
        ]
    }
];

const SelfAssessment: React.FC<SelfAssessmentProps> = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState(0); 
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [result, setResult] = useState<any>(null);
    const [loadingPhase, setLoadingPhase] = useState(0);

    const phases = [
        "আপনার উত্তরগুলো আমাদের বিশেষজ্ঞ প্যানেলের কাছে পাঠানো হচ্ছে...",
        "ডেটা অ্যানালিটিক্স টিম আপনার বিহেভিয়ারাল প্যাটার্ন যাচাই করছে...",
        "সিনিয়র মেন্টর আপনার জন্য সেরা ক্যারিয়ার রোডম্যাপ তৈরি করছেন...",
        "রিপোর্ট চূড়ান্ত করা হচ্ছে, দয়া করে অপেক্ষা করুন..."
    ];

    useEffect(() => {
        if (step === 2) {
            const interval = setInterval(() => {
                setLoadingPhase((prev) => {
                    if (prev < phases.length - 1) return prev + 1;
                    clearInterval(interval);
                    return prev;
                });
            }, 2500);
            return () => clearInterval(interval);
        }
    }, [step]);

    const handleOptionSelect = (val: string) => {
        const newAnswers = { ...answers, [ASSESSMENT_QUESTIONS[currentQuestion].id]: val };
        setAnswers(newAnswers);
        
        if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            analyzeResults(newAnswers);
        }
    };

    const analyzeResults = async (finalAnswers: Record<number, string>) => {
        setStep(2);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Act as the Senior Career Counseling Expert Team at One Way School. 
                A student named ${user?.displayName || 'Student'} has answered 10 psychometric questions. 
                Analyze these answers and provide a highly professional expert recommendation. 
                IMPORTANT: Do NOT mention you are an AI or a bot. Speak as 'We' (the expert team).
                
                Answers Data: ${JSON.stringify(finalAnswers)}
                
                Return a JSON in Bengali:
                {
                    "recommendedSector": "Career Sector Name",
                    "expertOpinion": "A detailed paragraph explaining why this fits their personality perfectly",
                    "keyTraits": ["Trait 1", "Trait 2", "Trait 3"],
                    "roadmap": ["Action Step 1", "Action Step 2", "Action Step 3"],
                    "mentorsNote": "A closing motivational note from the Senior Mentor"
                }
            `;

            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            recommendedSector: { type: Type.STRING },
                            expertOpinion: { type: Type.STRING },
                            keyTraits: { type: Type.ARRAY, items: { type: Type.STRING } },
                            roadmap: { type: Type.ARRAY, items: { type: Type.STRING } },
                            mentorsNote: { type: Type.STRING }
                        }
                    }
                }
            });

            const parsedResult = JSON.parse(response.text || '{}');
            setTimeout(() => {
                setResult(parsedResult);
                setStep(3);
            }, 10000); 

        } catch (error) {
            console.error("Review Error:", error);
            alert("দুঃখিত, কানেকশন সমস্যার কারণে রিভিউ সম্পন্ন হয়নি। আবার চেষ্টা করুন।");
            setStep(1);
        }
    };

    const resetAssessment = () => {
        setStep(0);
        setCurrentQuestion(0);
        setAnswers({});
        setResult(null);
        setLoadingPhase(0);
    };

    const goToLogin = () => {
        navigate('/login', { state: { from: location } });
    };

    return (
        <div className="bg-slate-50 min-h-screen font-['Hind_Siliguri'] pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                
                {step === 0 && (
                    <div className="bg-white rounded-[40px] p-10 md:p-16 shadow-2xl text-center relative overflow-hidden border border-slate-100">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        
                        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 text-white shadow-xl shadow-blue-200">
                            <Target size={40} />
                        </div>
                        
                        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                            আপনি নিজেকে কোন <span className="text-blue-600">সেক্টরে</span> নিয়ে যেতে চান?
                        </h1>
                        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                            আমাদের <strong>ইকোসিস্টেম এক্সপার্ট টিম</strong> আপনার উত্তরসমূহ বিশ্লেষণপূর্বক জানিয়ে দিবে কোন সেক্টর আপনার জন্য সবচেয়ে পারফেক্ট!
                        </p>
                        
                        {!user ? (
                            <div className="bg-slate-50 p-8 rounded-3xl border border-dashed border-slate-200">
                                <Lock size={32} className="mx-auto text-slate-400 mb-4"/>
                                <p className="text-slate-500 mb-6 font-bold">রিভিউ সিস্টেমে অংশ নিতে আপনার অ্যাকাউন্টে লগইন করুন।</p>
                                <button onClick={goToLogin} className="flex items-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-600 transition shadow-lg mx-auto">
                                    লগইন পেইজে যান <ArrowRight size={20}/>
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setStep(1)}
                                className="bg-slate-900 hover:bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-3 mx-auto"
                            >
                                এসেসমেন্ট শুরু করুন <ArrowRight size={24}/>
                            </button>
                        )}
                        
                        <div className="mt-12 flex justify-center gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1"><UserCheck size={14}/> Verified Members Only</span>
                            <span className="flex items-center gap-1"><ShieldCheck size={14}/> Confidential Review</span>
                        </div>
                    </div>
                )}

                {/* Rest of the assessment component remains same... */}
                {step === 1 && (
                    <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl relative border border-slate-100 animate-fade-in">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 rounded-t-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-600 transition-all duration-500"
                                style={{ width: `${((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100}%` }}
                            ></div>
                        </div>

                        <div className="flex justify-between items-center mb-8">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                Section {currentQuestion + 1} of {ASSESSMENT_QUESTIONS.length}
                            </span>
                            {currentQuestion > 0 && (
                                <button 
                                    onClick={() => setCurrentQuestion(currentQuestion - 1)}
                                    className="text-slate-400 hover:text-slate-900 flex items-center gap-1 font-bold text-sm"
                                >
                                    <ArrowLeft size={16}/> Back
                                </button>
                            )}
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 leading-tight">
                            {ASSESSMENT_QUESTIONS[currentQuestion].question}
                        </h2>

                        <div className="space-y-3">
                            {ASSESSMENT_QUESTIONS[currentQuestion].options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(opt.value)}
                                    className="w-full text-left p-6 rounded-2xl border-2 border-slate-50 bg-slate-50/30 hover:border-blue-500 hover:bg-white transition-all flex justify-between items-center group active:scale-[0.98]"
                                >
                                    <span className="text-lg font-semibold text-slate-700 group-hover:text-blue-600">{opt.label}</span>
                                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 group-hover:border-blue-600 flex items-center justify-center transition-colors">
                                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="bg-white rounded-[40px] p-20 shadow-2xl text-center border border-slate-100 relative">
                        <div className="flex flex-col items-center">
                            <div className="relative mb-10">
                                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25"></div>
                                <div className="relative w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 border border-blue-100">
                                    <Loader2 className="animate-spin" size={32}/>
                                </div>
                            </div>
                            
                            <h2 className="text-2xl font-bold text-slate-900 mb-4 animate-pulse">এক্সপার্ট টিম রিভিউ চলছে...</h2>
                            
                            <div className="max-w-sm mx-auto space-y-4">
                                {phases.map((p, i) => (
                                    <div key={i} className={`flex items-center gap-3 text-sm font-medium transition-all duration-700 ${loadingPhase >= i ? 'text-blue-600 opacity-100' : 'text-slate-300 opacity-40'}`}>
                                        <div className={`w-2 h-2 rounded-full ${loadingPhase >= i ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                                        {p}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && result && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600 text-white flex items-center justify-center rounded-bl-[40px] shadow-lg">
                                <UserCheck size={32}/>
                            </div>

                            <div className="mb-10">
                                <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">Official Guidance Report</span>
                                <h4 className="text-lg font-bold text-slate-400 mt-6 mb-2">আপনার জন্য প্রস্তাবিত সেক্টর:</h4>
                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">
                                    {result.recommendedSector}
                                </h1>
                                
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative">
                                    <Quote size={40} className="absolute -top-4 -left-4 text-blue-200 rotate-12"/>
                                    <h5 className="font-bold text-slate-800 mb-3 flex items-center gap-2 underline decoration-blue-200 underline-offset-4">টিম অপিনিয়ন:</h5>
                                    <p className="text-slate-700 text-lg leading-relaxed">{result.expertOpinion}</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-slate-800 text-xl">ব্যক্তিত্বের বৈশিষ্ট্য:</h3>
                                    <div className="space-y-2">
                                        {result.keyTraits?.map((t: string, i: number) => (
                                            <div key={i} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-200 transition-colors">
                                                <CheckCircle2 size={18} className="text-blue-500 shrink-0"/>
                                                <span className="font-bold text-slate-700">{t}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-slate-800 text-xl">পরবর্তী পদক্ষেপ:</h3>
                                    <div className="space-y-2">
                                        {result.roadmap?.map((step: string, i: number) => (
                                            <div key={i} className="flex items-center gap-3 p-4 bg-slate-900 text-white rounded-2xl shadow-lg transform hover:scale-[1.02] transition-transform">
                                                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-black shrink-0">{i+1}</div>
                                                <span className="font-bold text-sm">{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[32px] border border-blue-100 relative overflow-hidden">
                                <div className="relative z-10">
                                    <h4 className="font-bold text-blue-900 text-lg mb-2 flex items-center gap-2"><Rocket size={20}/> সিনিয়র মেন্টরের বার্তা:</h4>
                                    <p className="text-blue-800/80 leading-relaxed font-medium italic">"{result.mentorsNote}"</p>
                                </div>
                                <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12">
                                    <Brain size={150}/>
                                </div>
                            </div>

                            <div className="mt-12 flex flex-col md:flex-row gap-4 justify-center pt-8 border-t border-slate-50">
                                <button 
                                    onClick={() => navigate('/ecosystem')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
                                >
                                    Ecosystem-এ যাত্রা শুরু করুন <ArrowRight size={20}/>
                                </button>
                                <button 
                                    onClick={resetAssessment}
                                    className="bg-white border border-slate-200 text-slate-500 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                                >
                                    নতুন করে রিভিউ দিন
                                </button>
                            </div>
                        </div>
                        
                        <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                            © 2025 One Way School - Ecosystem Guidance Portal
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default SelfAssessment;
