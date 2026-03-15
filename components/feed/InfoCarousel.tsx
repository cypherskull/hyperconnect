import React, { useState } from 'react';
import { ChevronDownIcon, GlobeAltIcon } from '../common/Icons';

const InfoCard: React.FC<{title: string, description: string, gradient: string}> = ({title, description, gradient}) => (
    <div className={`flex-shrink-0 w-64 h-32 bg-gradient-to-br ${gradient} text-white rounded-xl shadow-lg p-5 flex flex-col justify-between mx-3`}>
        <h3 className="font-bold text-base">{title}</h3>
        <p className="text-xs opacity-90">{description}</p>
    </div>
);

const infoItems = [
    { title: "Explore New Markets", description: "Connect with businesses from around the globe.", gradient: "from-[#FF6B6B] to-[#FFD93D]" },
    { title: "Find Investment Opportunities", description: "Discover promising startups and established companies.", gradient: "from-[#FFD93D] to-[#6BCB77]" },
    { title: "Streamline Procurement", description: "Source products and services efficiently from trusted suppliers.", gradient: "from-[#6BCB77] to-[#4D96FF]" },
    { title: "Grow Your Network", description: "Build valuable connections with industry leaders.", gradient: "from-[#4D96FF] to-[#FF6B6B]" },
    { title: "Unlock Business Potential", description: "Leverage data-driven insights for strategic decisions.", gradient: "from-[#FF6B6B] to-[#6BCB77]" },
];

const duplicatedItems = [...infoItems, ...infoItems];

export const InfoCarousel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-brand-card rounded-xl shadow-sm border border-brand-border overflow-hidden transition-all duration-300">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors focus:outline-none"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full transition-colors ${isOpen ? 'bg-brand-primary text-white' : 'bg-brand-primary/10 text-brand-primary'}`}>
                         <GlobeAltIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <h2 className="text-lg font-bold text-brand-accent">Discover Opportunities</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">Explore new markets, investments, and connections</p>
                    </div>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="relative w-full overflow-hidden group pb-6 pt-2">
                    <div className="flex animate-scroll group-hover:[animation-play-state:paused] px-4">
                        {duplicatedItems.map((item, index) => (
                            <InfoCard key={index} title={item.title} description={item.description} gradient={item.gradient} />
                        ))}
                    </div>
                    <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-brand-card to-transparent pointer-events-none"></div>
                    <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-brand-card to-transparent pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
};