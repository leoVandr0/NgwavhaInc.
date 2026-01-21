import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Github } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-dark-950 border-t border-dark-800 pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="text-2xl font-bold text-primary-500 mb-4 block">
                            SkillForge
                        </Link>
                        <p className="text-dark-400 text-sm mb-4">
                            Empowering learners worldwide to master new skills and achieve their goals through expert-led courses.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-dark-400 hover:text-white transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="text-dark-400 hover:text-white transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="text-dark-400 hover:text-white transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="text-dark-400 hover:text-white transition-colors"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Learn</h3>
                        <ul className="space-y-2 text-sm text-dark-400">
                            <li><Link to="/courses" className="hover:text-primary-400 transition-colors">Browse Courses</Link></li>
                            <li><Link to="/categories" className="hover:text-primary-400 transition-colors">Categories</Link></li>
                            <li><Link to="/paths" className="hover:text-primary-400 transition-colors">Learning Paths</Link></li>
                            <li><Link to="/certifications" className="hover:text-primary-400 transition-colors">Certifications</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Teach</h3>
                        <ul className="space-y-2 text-sm text-dark-400">
                            <li><Link to="/teach" className="hover:text-primary-400 transition-colors">Become an Instructor</Link></li>
                            <li><Link to="/instructor/resources" className="hover:text-primary-400 transition-colors">Instructor Resources</Link></li>
                            <li><Link to="/instructor/community" className="hover:text-primary-400 transition-colors">Community</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Support</h3>
                        <ul className="space-y-2 text-sm text-dark-400">
                            <li><Link to="/help" className="hover:text-primary-400 transition-colors">Help Center</Link></li>
                            <li><Link to="/terms" className="hover:text-primary-400 transition-colors">Terms of Service</Link></li>
                            <li><Link to="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-dark-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-dark-500 text-sm">
                        © {new Date().getFullYear()} SkillForge. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-dark-500">
                        <Link to="/privacy" className="hover:text-dark-300">Privacy</Link>
                        <Link to="/terms" className="hover:text-dark-300">Terms</Link>
                        <Link to="/sitemap" className="hover:text-dark-300">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
