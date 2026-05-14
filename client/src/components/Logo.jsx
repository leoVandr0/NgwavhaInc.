import React from 'react';
import logo from '../assets/logo.jpg';

const Logo = () => {
    return (
        <div className="flex items-center">
            <img
                src={logo}
                alt="Ngwavha Logo"
                className="h-10 w-10 rounded-full object-cover mr-2"
            />
            <span className="text-2xl font-bold text-white">Ngwavha</span>
        </div>
    );
};

export default Logo;
