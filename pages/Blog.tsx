import React, { useState, useEffect } from 'react';
import { BlogPost } from '../types';
import { getBlogPosts } from '../services/firebase';
import { X, Calendar, User, Clock, ArrowUpRight } from 'lucide-react';

const Blog: React.FC = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            const data = await getBlogPosts();
            setBlogs(data as BlogPost[]);
            setLoading(false);
        };
        fetchBlogs();
    }, []);

    // Disable background scroll when modal is open
    useEffect(() => {
        if (selectedBlog) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [selectedBlog]);

    if(loading) return <div className="h-screen flex items-center justify-center">লোডিং...</div>;

    return (
        <div className="bg-slate-50 min-h-screen">
             {/* Hero Section */}
             <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-900">
                <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] animate-float"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px] animate-float-delayed"></div>
                
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        ব্লগ ও <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">আর্টিকেল</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
                        ক্যারিয়ার, দক্ষতা উন্নয়ন এবং প্রযুক্তির সবশেষ আপডেট নিয়ে আমাদের নিয়মিত আয়োজন।
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 py-16">
                
                {blogs.length === 0 ? (
                     <div className="text-center text-slate-500 py-10">এখনো কোনো ব্লগ পোস্ট করা হয়নি।</div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map(blog => (
                            <div key={blog.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all h-full flex flex-col group border border-slate-100">
                                <div className="overflow-hidden h-52 relative">
                                    <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>
                                    <img 
                                        src={blog.imageUrl} 
                                        alt={blog.title} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 relative z-10" 
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1499750310159-525446b095b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'; // Fallback
                                        }}
                                    />
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                                            <Calendar size={12} className="text-blue-600"/> 
                                            {blog.date ? new Date(blog.date.seconds * 1000).toLocaleDateString() : 'Recent'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                            {blog.author.charAt(0)}
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{blog.author}</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight cursor-pointer" onClick={() => setSelectedBlog(blog)}>{blog.title}</h2>
                                    <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-grow leading-relaxed">{blog.excerpt}</p>
                                    
                                    <button 
                                        onClick={() => setSelectedBlog(blog)}
                                        className="inline-flex items-center gap-2 text-slate-900 font-bold group-hover:text-blue-600 transition-colors mt-auto self-start relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 group-hover:after:w-full"
                                    >
                                        আরও পড়ুন <ArrowUpRight size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Full Blog Reading Modal */}
            {selectedBlog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-4xl h-[90vh] md:h-auto md:max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
                        
                        {/* Header Actions */}
                        <div className="absolute top-4 right-4 z-20">
                            <button 
                                onClick={() => setSelectedBlog(null)} 
                                className="bg-white/80 backdrop-blur text-slate-800 p-2 rounded-full hover:bg-red-50 hover:text-red-600 transition-all shadow-lg border border-white/20"
                            >
                                <X size={24}/>
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto custom-scrollbar flex-1 bg-white">
                            {/* Cover Image */}
                            <div className="relative h-64 md:h-96 w-full">
                                <img 
                                    src={selectedBlog.imageUrl} 
                                    alt={selectedBlog.title} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1499750310159-525446b095b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                <div className="absolute bottom-0 left-0 w-full p-6 md:p-10">
                                    <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm mb-3">
                                        <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full"><User size={14}/> {selectedBlog.author}</span>
                                        <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full"><Calendar size={14}/> {selectedBlog.date ? new Date(selectedBlog.date.seconds * 1000).toLocaleDateString() : 'Just Now'}</span>
                                        <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full"><Clock size={14}/> 5 min read</span>
                                    </div>
                                    <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight">{selectedBlog.title}</h2>
                                </div>
                            </div>

                            {/* Blog Body */}
                            <div className="p-6 md:p-10 max-w-3xl mx-auto">
                                <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-medium mb-8 border-l-4 border-blue-500 pl-4 italic bg-slate-50 p-4 rounded-r-lg">
                                    {selectedBlog.excerpt}
                                </p>
                                
                                <div className="prose prose-lg prose-slate max-w-none text-slate-600 leading-loose whitespace-pre-line">
                                    {selectedBlog.content || "বিস্তারিত কিছু লেখা হয়নি..."}
                                </div>

                                <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                                    <p className="text-slate-400 text-sm mb-4">এই ব্লগটি শেয়ার করুন</p>
                                    <div className="flex justify-center gap-4">
                                        <button className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-blue-700 transition">Facebook</button>
                                        <button className="bg-sky-500 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-sky-600 transition">LinkedIn</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Blog;