import React, { useState, useEffect } from 'react';
import { BlogPost } from '../types';
import { getBlogPosts } from '../services/firebase';

const Blog: React.FC = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            const data = await getBlogPosts();
            setBlogs(data as BlogPost[]);
            setLoading(false);
        };
        fetchBlogs();
    }, []);

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
                            <div key={blog.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all h-full flex flex-col group">
                                <div className="overflow-hidden h-48">
                                    <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="text-xs text-slate-400 mb-2 font-medium">
                                        {blog.date ? new Date(blog.date.seconds * 1000).toLocaleDateString() : 'N/A'} | {blog.author}
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">{blog.title}</h2>
                                    <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-grow leading-relaxed">{blog.excerpt}</p>
                                    <button className="text-blue-600 font-bold text-sm hover:underline mt-auto self-start">আরও পড়ুন...</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
export default Blog;