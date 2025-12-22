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
        <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold text-slate-900 mb-10 text-center">ব্লগ ও আর্টিকেল</h1>
                
                {blogs.length === 0 ? (
                     <div className="text-center text-slate-500">এখনো কোনো ব্লগ পোস্ট করা হয়নি।</div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map(blog => (
                            <div key={blog.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all h-full flex flex-col">
                                <img src={blog.imageUrl} alt={blog.title} className="w-full h-48 object-cover" />
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="text-xs text-slate-400 mb-2">
                                        {blog.date ? new Date(blog.date.seconds * 1000).toLocaleDateString() : 'N/A'} | {blog.author}
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2">{blog.title}</h2>
                                    <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-grow">{blog.excerpt}</p>
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