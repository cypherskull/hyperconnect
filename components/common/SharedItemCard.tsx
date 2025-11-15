import React from 'react';
import { SharedContent, Testimonial, Collateral, Podcast, Event, CollateralType, CaseStudy } from '../../types';
import { StarIcon, FileTextIcon, PresentationIcon, ImageIcon, MicrophoneIcon, CalendarIcon } from './Icons';

const TestimonialCard: React.FC<{ item: Testimonial }> = ({ item }) => (
    <div className="bg-brand-card-light/50 dark:bg-brand-card-light/10 rounded-lg p-4 border border-brand-border/50">
        <p className="font-bold text-brand-primary text-sm">{item.customerName}</p>
        <blockquote className="mt-1 text-gray-600 dark:text-gray-300 italic text-sm border-l-4 border-brand-primary/50 pl-3 py-1">
            "{item.quote}"
        </blockquote>
        <div className="mt-3 flex items-center justify-end space-x-1 text-yellow-400">
            <span className="text-xs text-gray-500 dark:text-gray-400">Solution Impact:</span>
            {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className={`w-3 h-3 ${i < item.scores.solutionImpact ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
            ))}
        </div>
    </div>
);

const CollateralCard: React.FC<{ item: Collateral }> = ({ item }) => {
    const getFileIcon = (type: CollateralType) => {
        const props = {className: "w-6 h-6 mr-3 flex-shrink-0"};
        switch(type) {
            case CollateralType.Presentation: return <PresentationIcon {...props} className={`${props.className} text-red-500`} />;
            case CollateralType.Image: return <ImageIcon {...props} className={`${props.className} text-blue-500`}/>;
            case CollateralType.PDF: default: return <FileTextIcon {...props} className={`${props.className} text-purple-500`} />;
        }
    };
    return (
        <div className="bg-brand-card-light/50 dark:bg-brand-card-light/10 rounded-lg p-3 border border-brand-border/50 flex justify-between items-center">
            <div className="flex items-center">
                {getFileIcon(item.type)}
                <div>
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.fileName}</p>
                </div>
            </div>
            <button className="px-3 py-1 text-xs font-semibold bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors">
                View
            </button>
        </div>
    );
};

const CaseStudyCard: React.FC<{ item: CaseStudy }> = ({ item }) => (
    <div className="bg-brand-card-light/50 dark:bg-brand-card-light/10 rounded-lg p-4 border border-brand-border/50">
        <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Case Study</p>
        <p className="font-bold text-brand-primary mt-1">{item.clientName}</p>
        <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm line-clamp-2"
           dangerouslySetInnerHTML={{ __html: item.clientNeed }}>
        </p>
    </div>
);

// Add PodcastCard and EventCard if needed in the future

export const SharedItemCard: React.FC<{ content: SharedContent }> = ({ content }) => {
    switch (content.type) {
        case 'testimonial':
            return <TestimonialCard item={content.item as Testimonial} />;
        case 'collateral':
            return <CollateralCard item={content.item as Collateral} />;
        case 'caseStudy':
            return <CaseStudyCard item={content.item as CaseStudy} />;
        // case 'podcast':
        //     return <PodcastCard item={content.item as Podcast} />;
        // case 'event':
        //     return <EventCard item={content.item as Event} />;
        default:
            return null;
    }
};
