import React from 'react';
import { BlogPost } from '../types';

const BLOGS: BlogPost[] = [
    {
        id: '1',
        title: 'কেন স্কিল ডেভেলপমেন্ট জরুরি?',
        excerpt: 'বর্তমান যুগে শুধুমাত্র একাডেমিক সার্টিফিকেট দিয়ে ভালো চাকরি পাওয়া কঠিন...',
        author: 'Admin',
        date: '10 Oct, 2023',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&w=800&q=80'
    },
    {
        id: '2',
        title: 'সিভি রাইটিং এর ৫টি গোল্ডেন রুল',
        excerpt: 'আপনার সিভিই আপনার প্রথম পরিচয়। তাই এটি হতে হবে আকর্ষণীয়...',
        author: 'HR Team',
        date: '15 Nov, 2023',
        imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&w=800&q=80'
    }
];

const Blog: React.FC = () => {
    return (
        <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold text-slate-900 mb-10 text-center">ব্লগ ও আর্টিকেল</h1>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {BLOGS.map(blog => (
                        <div key={blog.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                            <img src={blog.imageUrl} alt={blog.title} className="w-full h-48 object-cover" />
                            <div className="p-6">
                                <div className="text-xs text-slate-400 mb-2">{blog.date} | {blog.author}</div>
                                <h2 className="text-xl font-bold text-slate-800 mb-3">{blog.title}</h2>
                                <p className="text-slate-600 text-sm mb-4">{blog.excerpt}</p>
                                <button className="text-blue-600 font-bold text-sm hover:underline">আরও পড়ুন...</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default Blog;
