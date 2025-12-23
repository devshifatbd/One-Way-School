import React from 'react';
import { Facebook, Linkedin, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-950 py-12 md:py-16 border-t border-slate-900 text-white relative overflow-hidden">
             {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
                    {/* Column 1: Brand & Social */}
                    <div className="space-y-6">
                        <img src="https://iili.io/f3evPnf.md.png" alt="OWS Footer Logo" className="h-14 object-contain" />
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            দক্ষতা ও দিকনির্দেশনার মাধ্যমে আমরা গড়ে তুলছি আগামীর নেতৃত্ব। আপনার সফলতার যাত্রায় আমরাই আপনার বিশ্বস্ত সঙ্গী।
                        </p>
                        <div className="flex gap-3 pt-2">
                             <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors group">
                                <Facebook className="w-5 h-5 text-slate-400 group-hover:text-white" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-400 transition-colors group">
                                <Linkedin className="w-5 h-5 text-slate-400 group-hover:text-white" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 transition-colors group">
                                <Instagram className="w-5 h-5 text-slate-400 group-hover:text-white" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 transition-colors group">
                                <Youtube className="w-5 h-5 text-slate-400 group-hover:text-white" />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="lg:pl-10">
                        <h4 className="text-xl font-bold mb-6 text-white border-b border-slate-800 pb-2 inline-block">গুরুত্বপূর্ণ লিংক</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span>•</span> আমাদের সম্পর্কে</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span>•</span> ইকোসিস্টেম</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span>•</span> সাকসেস স্টোরি</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span>•</span> ক্যারিয়ার ব্লগ</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span>•</span> যোগাযোগ</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact Info */}
                    <div>
                        <h4 className="text-xl font-bold mb-6 text-white border-b border-slate-800 pb-2 inline-block">যোগাযোগ করুন</h4>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">হটলাইন নম্বর</p>
                                    <p className="font-bold text-white text-lg">+880 1626-777076</p>
                                    <p className="text-xs text-slate-500">সকাল ১০টা - রাত ৮টা</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">ইমেইল করুন</p>
                                    <p className="font-bold text-white">info@onewayschool.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">অফিস ঠিকানা</p>
                                    <p className="font-bold text-white">ঢাকা, বাংলাদেশ</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">© 2025 One Way School. All rights reserved.</p>
                    <p className="text-slate-600 text-xs flex items-center gap-1">
                        Developed by <span className="font-bold text-blue-500">groweasy</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;