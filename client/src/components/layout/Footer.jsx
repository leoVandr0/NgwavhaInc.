import React from 'react';
import { Link } from 'react-router-dom';
import {
    Facebook,
    Twitter,
    Linkedin,
    Youtube,
    Instagram,
    Mail,
    Phone,
    MapPin,
    ChevronRight,
    Github
} from 'lucide-react';
import logo from '../../assets/logo.jpg';
import SystemStatus from '../SystemStatus';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-dark-950 border-t border-dark-900 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-3 text-3xl font-bold tracking-tighter text-white group">
                            <img src={logo} alt="Ngwavha Logo" className="h-10 w-10 rounded-full object-cover transition-transform group-hover:scale-110" />
                            <span className="bg-gradient-to-r from-white to-dark-400 bg-clip-text text-transparent">Ngwavha</span>
                        </Link>
                        <p className="text-dark-400 leading-relaxed text-sm">
                            Empowering the next generation of African professionals through world-class online education. Forge your skills, change your future.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { Icon: Facebook, link: '#' },
                                { Icon: Twitter, link: '#' },
                                { Icon: Linkedin, link: '#' },
                                { Icon: Instagram, link: '#' },
                                { Icon: Youtube, link: '#' }
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.link}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-dark-900 border border-dark-800 text-dark-400 hover:text-primary-400 hover:border-primary-500/50 transition-all hover:-translate-y-1"
                                >
                                    <social.Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-black text-sm uppercase tracking-widest mb-8">Learning</h4>
                        <ul className="space-y-4">
                            {[
                                { text: 'All Courses', link: '/courses' },
                                { text: 'Live Sessions', link: '#' },
                                { text: 'Categories', link: '#' },
                                { text: 'Instructors', link: '/instructors' },
                                { text: 'Become a Teacher', link: '/register?role=instructor' }
                            ].map((item) => (
                                <li key={item.text}>
                                    <Link to={item.link} className="text-dark-400 hover:text-white flex items-center gap-2 group transition-colors text-sm">
                                        <ChevronRight size={14} className="text-primary-500 opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0" />
                                        {item.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="text-white font-black text-sm uppercase tracking-widest mb-8">Company</h4>
                        <ul className="space-y-4">
                            {[
                                { text: 'About Us', link: '/about' },
                                { text: 'Contact', link: '/contact' },
                                { text: 'Privacy Policy', link: '/privacy' },
                                { text: 'Terms of Service', link: '/terms' },
                                { text: 'Help Center', link: '/help' }
                            ].map((item) => (
                                <li key={item.text}>
                                    <Link to={item.link} className="text-dark-400 hover:text-white flex items-center gap-2 group transition-colors text-sm">
                                        <ChevronRight size={14} className="text-primary-500 opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0" />
                                        {item.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-black text-sm uppercase tracking-widest mb-8">Contact Us</h4>
                        <ul className="space-y-6">
                            <li className="flex gap-4">
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-dark-900 border border-dark-800 flex items-center justify-center text-primary-500">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-dark-500 uppercase font-black mb-1">Our Studio</p>
                                    <p className="text-dark-300 text-sm">123 Innovation Drive, Harare, Zimbabwe</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-dark-900 border border-dark-800 flex items-center justify-center text-primary-500">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-dark-500 uppercase font-black mb-1">Email Support</p>
                                    <p className="text-dark-300 text-sm lowercase">support@ngwavha.com</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-dark-900 border border-dark-800 flex items-center justify-center text-primary-500">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-dark-500 uppercase font-black mb-1">Call Us</p>
                                    <p className="text-dark-300 text-sm font-bold">+263 777 000 000</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-dark-900 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-dark-500 text-xs">
                        © {currentYear} <span className="text-dark-300 font-bold">Ngwavha Inc</span>. All rights reserved.
                        <span className="ml-2 px-2 py-0.5 rounded bg-dark-900 border border-dark-800">Zimbabwe's Premiere LMS</span>
                    </p>
                    <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-dark-500">
                        <Link to="/privacy" className="hover:text-primary-500 transition-colors">Privacy</Link>
                        <Link to="/terms" className="hover:text-primary-500 transition-colors">Terms</Link>
                        <Link to="/cookies" className="hover:text-primary-500 transition-colors">Cookies</Link>
                        <SystemStatus />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
