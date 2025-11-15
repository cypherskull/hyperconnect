import React from 'react';

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
    return (
        <div>
            <h2 className="text-xl font-bold mb-4 text-brand-accent">Discover</h2>
            <div className="relative w-full overflow-hidden group">
                <div className="flex animate-scroll group-hover:[animation-play-state:paused]">
                    {duplicatedItems.map((item, index) => (
                        <InfoCard key={index} title={item.title} description={item.description} gradient={item.gradient} />
                    ))}
                </div>
                <div className="absolute top-0 left-0 bottom-0 w-24 bg-gradient-to-r from-brand-light dark:from-brand-dark to-transparent pointer-events-none"></div>
                <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-brand-light dark:from-brand-dark to-transparent pointer-events-none"></div>
            </div>
        </div>
    );
};