import React from 'react';

const Logo = () => {
    return (
        <div className="flex items-center">
            <svg 
                className="h-8 w-8 mr-2" 
                viewBox="0 0 40 40" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
                <path 
                    d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0zm0 36c-8.837 0-16-7.163-16-16S11.163 4 20 4s16 7.163 16 16-7.163 16-16 16z" 
                    fill="#FFA500"
                />
                <path 
                    d="M28 15c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8z" 
                    fill="#FFA500"
                />
                <path 
                    d="M20 12c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" 
                    fill="#000"
                />
            </svg>
            <span className="text-2xl font-bold text-white">Ngwavha</span>
        </div>
    );
};

export default Logo;
