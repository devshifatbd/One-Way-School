import React from 'react';
import { Facebook, Linkedin, Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-950 py-10 md:py-12 border-t border-slate-900 text-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
                    {/* Logo & Text */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <img src="https://iili.io/f3evPnf.md.png" alt="OWS Footer Logo" className="h-12 md:h-16 object-contain mb-3 md:mb-4" />
                        <p className="text-slate-400 text-xs md:text-sm max-w-xs">
                            দক্ষতা ও দিকনির্দেশনার মাধ্যমে আমরা গড়ে তুলছি আগামীর নেতৃত্ব। আপনার সফলতার যাত্রায় আমরাই আপনার বিশ্বস্ত সঙ্গী।
                        </p>
                    </div>

                    {/* Social & Copyright */}
                    <div className="flex flex-col items-center md:items-end gap-4">
                        <div className="flex gap-4">
                            <a href="#" className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors group">
                                <Facebook className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-white" />
                            </a>
                            <a href="#" className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-400 transition-colors group">
                                <Linkedin className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-white" />
                            </a>
                            <a href="#" className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 transition-colors group">
                                <Instagram className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-white" />
                            </a>
                            <a href="#" className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 transition-colors group">
                                <Youtube className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-white" />
                            </a>
                        </div>
                        
                        <div className="text-center md:text-right">
                            <p className="text-slate-500 text-xs md:text-sm">© 2025 One Way School. All rights reserved.</p>
                            <p className="text-slate-600 text-[10px] md:text-xs mt-1">
                                Developed by <span className="font-bold text-blue-500">groweasy</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
