import React, { useState } from 'react';
import { Solution, Testimonial, Collateral, Podcast, Event, CollateralType, SharedContent, CaseStudy } from '../../types';
import { PlusIcon, TrashIcon, UploadIcon, FileTextIcon, PresentationIcon, ImageIcon, PencilIcon } from '../common/Icons';
import { CaseStudyEditorModal } from './CaseStudyEditorModal';
import { StarRating } from '../common/StarRating';
import { Input, Textarea, Button } from '../common/Forms';
import { TabButton } from '../common/TabButton';

// --- COMMON STYLED COMPONENTS --- //

const ManagerCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-brand-card rounded-lg shadow-md border border-brand-border">
        <h2 className="text-xl font-bold text-brand-accent p-4 border-b border-brand-border">{title}</h2>
        <div className="p-4 md:p-6">{children}</div>
    </div>
);

// --- TESTIMONIALS TAB --- //

const TestimonialsManager: React.FC<{ solution: Solution; onUpdate: (data: Solution) => void, onShare: (item: SharedContent) => void }> = ({ solution, onUpdate, onShare }) => {
    const [customerName, setCustomerName] = useState('');
    const [quote, setQuote] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [scores, setScores] = useState({ quality: 0, time: 0, cost: 0, experience: 0, solutionImpact: 0 });

    const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!customerName || !quote) return;
        const newTestimonial: Testimonial = {
            id: `test-${Date.now()}`,
            customerName,
            quote,
            videoUrl: videoUrl || undefined,
            scores
        };
        const updatedSolution = {
            ...solution,
            testimonials: [...solution.testimonials, newTestimonial]
        };
        onUpdate(updatedSolution);
        // Reset form
        setCustomerName('');
        setQuote('');
        setVideoUrl('');
        setScores({ quality: 0, time: 0, cost: 0, experience: 0, solutionImpact: 0 });
    };

    const handleDelete = (id: string) => {
        const updatedSolution = {
            ...solution,
            testimonials: solution.testimonials.filter(t => t.id !== id)
        };
        onUpdate(updatedSolution);
    }

    return (
        <div className="space-y-6">
            <form className="p-4 border border-brand-border rounded-lg space-y-4">
                <h3 className="font-semibold">Add New Testimonial</h3>
                <Input placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                <Textarea placeholder="Customer Quote" value={quote} onChange={e => setQuote(e.target.value)} rows={3} required />
                <Input placeholder="Video Citation URL (optional)" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.keys(scores).map((key) => (
                        <div key={key} className="space-y-1">
                            <label className="text-sm font-medium capitalize">{key.replace('Impact', ' Impact')}</label>
                            <StarRating rating={scores[key as keyof typeof scores]} setRating={(rating) => setScores(s => ({...s, [key]: rating}))} />
                        </div>
                    ))}
                </div>
                <Button onClick={handleAdd} type="submit"><PlusIcon className="w-4 h-4" /><span>Add Testimonial</span></Button>
            </form>
            <div className="space-y-2">
                 {solution.testimonials.map(t => (
                    <div key={t.id} className="p-3 bg-brand-card-light rounded-md flex justify-between items-start gap-2">
                        <div className="flex-grow">
                            <p className="font-bold">{t.customerName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic line-clamp-2">"{t.quote}"</p>
                            {t.videoUrl && <a href={t.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-secondary hover:underline mt-1 inline-block">Has Video</a>}
                        </div>
                        <div className="flex flex-shrink-0 space-x-1">
                             <button onClick={() => onShare({ type: 'testimonial', item: t })} className="p-1 text-gray-400 hover:text-brand-primary" title="Share as post"><UploadIcon className="w-4 h-4 transform -rotate-90"/></button>
                             <button onClick={() => handleDelete(t.id)} className="p-1 text-gray-400 hover:text-red-500" title="Delete"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- COLLATERALS TAB --- //
const CollateralManager: React.FC<{ solution: Solution; onUpdate: (data: Solution) => void, onShare: (item: SharedContent) => void }> = ({ solution, onUpdate, onShare }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        let type = CollateralType.PDF;
        if (['image/jpeg', 'image/png'].includes(file.type)) type = CollateralType.Image;
        if (['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(file.type)) type = CollateralType.Presentation;

        const newCollateral: Collateral = {
            id: `coll-${Date.now()}`,
            name: file.name.split('.').slice(0, -1).join('.'),
            fileName: file.name,
            type,
        };
        onUpdate({ ...solution, collaterals: [...solution.collaterals, newCollateral] });
    };
    
    const handleDelete = (id: string) => {
        onUpdate({ ...solution, collaterals: solution.collaterals.filter(c => c.id !== id) });
    }

    const getFileIcon = (type: CollateralType) => {
        switch(type) {
            case CollateralType.Presentation: return <PresentationIcon className="w-6 h-6 text-red-500" />;
            case CollateralType.Image: return <ImageIcon className="w-6 h-6 text-blue-500" />;
            case CollateralType.PDF:
            default: return <FileTextIcon className="w-6 h-6 text-purple-500" />;
        }
    }

    return (
        <div className="space-y-6">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".ppt,.pptx,.pdf,.jpeg,.png"
                onChange={handleFileChange} 
            />
            <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                <UploadIcon className="w-5 h-5" />
                <span>Upload Collateral</span>
            </Button>
             <div className="space-y-2">
                {solution.collaterals.map(c => (
                    <div key={c.id} className="p-3 bg-brand-card-light rounded-md flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            {getFileIcon(c.type)}
                            <div>
                                <p className="font-semibold">{c.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{c.fileName}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1">
                             <button onClick={() => onShare({ type: 'collateral', item: c })} className="p-1 text-gray-400 hover:text-brand-primary" title="Share as post"><UploadIcon className="w-4 h-4 transform -rotate-90"/></button>
                            <button onClick={() => handleDelete(c.id)} className="p-1 text-gray-400 hover:text-red-500" title="Delete"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- CASE STUDIES TAB --- //
const CaseStudiesManager: React.FC<{ solution: Solution; onUpdate: (data: Solution) => void; onShare: (item: SharedContent) => void }> = ({ solution, onUpdate, onShare }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCaseStudy, setEditingCaseStudy] = useState<CaseStudy | null>(null);

    const handleOpenModal = (caseStudy: CaseStudy | null) => {
        setEditingCaseStudy(caseStudy);
        setIsModalOpen(true);
    };

    const handleSave = (caseStudyData: CaseStudy) => {
        const caseStudies = [...solution.caseStudies];
        const existingIndex = caseStudies.findIndex(cs => cs.id === caseStudyData.id);

        if (existingIndex > -1) {
            caseStudies[existingIndex] = caseStudyData;
        } else {
            caseStudies.push(caseStudyData);
        }
        onUpdate({ ...solution, caseStudies });
        setIsModalOpen(false);
    };
    
    const handleDelete = (id: string) => {
        if(confirm('Are you sure you want to delete this case study?')) {
            onUpdate({ ...solution, caseStudies: solution.caseStudies.filter(cs => cs.id !== id) });
        }
    };

    return (
        <div className="space-y-6">
            <Button onClick={() => handleOpenModal(null)} className="w-full">
                <PlusIcon className="w-4 h-4" />
                <span>Add Case Study</span>
            </Button>
             <div className="space-y-2">
                {solution.caseStudies.map(cs => (
                     <div key={cs.id} className="p-3 bg-brand-card-light rounded-md flex justify-between items-center">
                        <p className="font-bold">{cs.clientName}</p>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => onShare({ type: 'caseStudy', item: cs })}
                                disabled={!cs.isClientApproved}
                                className="p-1 text-gray-400 hover:text-brand-primary disabled:opacity-30 disabled:cursor-not-allowed"
                                title={cs.isClientApproved ? "Share as post" : "Case study not approved for sharing"}
                            >
                                <UploadIcon className="w-4 h-4 transform -rotate-90"/>
                            </button>
                            <button onClick={() => handleOpenModal(cs)} className="p-1 text-gray-400 hover:text-brand-primary" title="Edit"><PencilIcon className="w-4 h-4"/></button>
                            <button onClick={() => handleDelete(cs.id)} className="p-1 text-gray-400 hover:text-red-500" title="Delete"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                    </div>
                ))}
             </div>
            {isModalOpen && (
                <CaseStudyEditorModal
                    caseStudy={editingCaseStudy}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

// --- PODCASTS TAB --- //
const PodcastsManager: React.FC<{ podcasts: Podcast[]; onUpdate: (data: Partial<Solution>) => void }> = ({ podcasts, onUpdate }) => {
    return (
        <div>
            <Button onClick={() => {}} className="w-full">
                 <UploadIcon className="w-5 h-5" />
                <span>Upload Podcast Audio</span>
            </Button>
            <p className="text-center text-sm text-gray-500 mt-4">Podcast management coming soon.</p>
        </div>
    );
};

// --- EVENTS TAB --- //
const EventsManager: React.FC<{ events: Event[]; onUpdate: (data: Partial<Solution>) => void }> = ({ events, onUpdate }) => {
     return (
        <div>
             <Button onClick={() => {}} className="w-full">
                 <PlusIcon className="w-4 h-4" />
                <span>Host New Event</span>
            </Button>
            <p className="text-center text-sm text-gray-500 mt-4">Event management coming soon.</p>
        </div>
    );
};


// --- MAIN COMPONENT --- //
type ManagerTab = 'testimonials' | 'collateral' | 'caseStudies' | 'podcasts' | 'events';

interface SellerContentManagerProps {
  solution: Solution;
  onUpdate: (updatedSolution: Solution) => void;
  onShare: (item: SharedContent) => void;
}

export const SellerContentManager: React.FC<SellerContentManagerProps> = ({ solution, onUpdate, onShare }) => {
    const [activeTab, setActiveTab] = useState<ManagerTab>('testimonials');

    const renderContent = () => {
        switch(activeTab) {
            case 'testimonials':
                return <TestimonialsManager solution={solution} onUpdate={onUpdate} onShare={onShare} />;
            case 'collateral':
                return <CollateralManager solution={solution} onUpdate={onUpdate} onShare={onShare} />;
            case 'caseStudies':
                return <CaseStudiesManager solution={solution} onUpdate={onUpdate} onShare={onShare} />;
            case 'podcasts':
                return <PodcastsManager podcasts={solution.podcasts} onUpdate={onUpdate} />;
            case 'events':
                return <EventsManager events={solution.events} onUpdate={onUpdate} />;
        }
    }

    return (
        <ManagerCard title="Manage Solution Content">
            <div className="mb-4 border-b border-brand-border flex space-x-2 overflow-x-auto pb-1">
                <TabButton active={activeTab === 'testimonials'} onClick={() => setActiveTab('testimonials')} variant="solid" className="text-sm !px-4 !py-2">Testimonials</TabButton>
                <TabButton active={activeTab === 'collateral'} onClick={() => setActiveTab('collateral')} variant="solid" className="text-sm !px-4 !py-2">Collateral</TabButton>
                <TabButton active={activeTab === 'caseStudies'} onClick={() => setActiveTab('caseStudies')} variant="solid" className="text-sm !px-4 !py-2">Case Studies</TabButton>
                <TabButton active={activeTab === 'podcasts'} onClick={() => setActiveTab('podcasts')} variant="solid" className="text-sm !px-4 !py-2">Podcasts</TabButton>
                <TabButton active={activeTab === 'events'} onClick={() => setActiveTab('events')} variant="solid" className="text-sm !px-4 !py-2">Events</TabButton>
            </div>
            <div>
                {renderContent()}
            </div>
        </ManagerCard>
    );
};