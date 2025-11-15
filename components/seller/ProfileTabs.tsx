import React, { useState, useMemo, useEffect } from 'react';
import { Seller, Post as PostType, KeyContact, Testimonial, Collateral, Podcast, Event, CollateralType, Solution, CaseStudy } from '../../types';
import { Post } from '../feed/Post';
import { CalendarIcon, ChevronDownIcon, FileTextIcon, ImageIcon, MicrophoneIcon, PresentationIcon, StarIcon, ExternalLinkIcon } from '../common/Icons';
import { TabButton } from '../common/TabButton';

// --- STYLED COMPONENTS & HELPERS --- //

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="font-bold text-lg mb-4 text-brand-accent border-b border-brand-border pb-2">{children}</h3>
);

const RichTextViewer: React.FC<{ content: string }> = ({ content }) => (
    <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: content }} />
);

// --- TAB CONTENT COMPONENTS --- //

const AboutTab: React.FC<{ seller: Seller; solution: Solution; isOwner: boolean }> = ({ seller, solution, isOwner }) => (
  <div className="space-y-6">
     {solution.shortDescription && (
        <div>
            <SectionTitle>Description</SectionTitle>
            <RichTextViewer content={solution.shortDescription} />
        </div>
    )}
    <div>
      <SectionTitle>Solution Details</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div><span className="font-semibold">Offering:</span> {solution.offering}</div>
        <div><span className="font-semibold">Industry:</span> {solution.industry.join(', ')}</div>
        <div><span className="font-semibold">Value Chain:</span> {solution.valueChain.join(', ')}</div>
        <div><span className="font-semibold">Geography:</span> {solution.geography.join(', ')}</div>
        {isOwner && solution.revenueFromPlatform !== undefined && (
            <div><span className="font-semibold">Revenue from Platform:</span> ₹{solution.revenueFromPlatform.toLocaleString('en-IN')}</div>
        )}
        {solution.customFields.map(field => (
            <div key={field.id}><span className="font-semibold">{field.label}:</span> {field.value}</div>
        ))}
      </div>
    </div>
     <div>
      <SectionTitle>Company Key Impacts</SectionTitle>
      <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
        {seller.keyImpacts.map(impact => (
          <li key={impact.area}><span className="font-semibold">{impact.area}:</span> {impact.value}</li>
        ))}
      </ul>
    </div>
  </div>
);

const CaseStudiesTab: React.FC<{ caseStudies: CaseStudy[] }> = ({ caseStudies }) => {
    const [openId, setOpenId] = useState<string | null>(caseStudies[0]?.id || null);

    const CaseStudyField: React.FC<{label: string, children: React.ReactNode}> = ({label, children}) => (
        <div>
            <h4 className="font-semibold text-gray-700 dark:text-gray-200">{label}</h4>
            {children}
        </div>
    );
    
    return (
        <div className="space-y-3">
            {caseStudies.map(cs => (
                <div key={cs.id} className="border border-brand-border rounded-lg">
                    <button onClick={() => setOpenId(openId === cs.id ? null : cs.id)} className="w-full flex justify-between items-center p-4 bg-brand-card-light/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50">
                        <h3 className="font-bold text-brand-primary">{cs.clientName}</h3>
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${openId === cs.id ? 'rotate-180' : ''}`} />
                    </button>
                    {openId === cs.id && (
                        <div className="p-4 space-y-4 border-t border-brand-border">
                           <CaseStudyField label="Client Need"><RichTextViewer content={cs.clientNeed} /></CaseStudyField>
                           <CaseStudyField label="Solution Approach"><RichTextViewer content={cs.solutionApproach} /></CaseStudyField>
                           <CaseStudyField label="Solution Description"><RichTextViewer content={cs.solutionDescription} /></CaseStudyField>
                           <CaseStudyField label="Time to Implement"><p className="text-gray-600 dark:text-gray-300">{cs.implementationTime}</p></CaseStudyField>
                           <CaseStudyField label="Reference Check"><p className="text-gray-600 dark:text-gray-300">{cs.referenceAvailable ? 'Yes' : 'No'}</p></CaseStudyField>
                           {cs.customFields.map(field => (
                               <CaseStudyField key={field.id} label={field.label}><RichTextViewer content={field.content} /></CaseStudyField>
                           ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

const TestimonialsTab: React.FC<{ testimonials: Testimonial[] }> = ({ testimonials }) => {
    const RatingDisplay: React.FC<{ label: string; score: number }> = ({ label, score }) => (
        <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{label}</span>
            <div className="flex">
                {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className={`w-4 h-4 ${i < score ? 'text-brand-yellow' : 'text-gray-300 dark:text-gray-600'}`} />
                ))}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map(t => (
                <div key={t.id} className="bg-brand-card-light rounded-lg p-5 border border-brand-border/50 shadow-sm">
                    <p className="font-bold text-brand-primary">{t.customerName}</p>
                    <blockquote className="font-quote mt-2 text-gray-600 dark:text-gray-300 italic border-l-4 border-brand-primary pl-4">
                        "{t.quote}"
                    </blockquote>
                    {t.videoUrl && <a href={t.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-secondary hover:underline mt-2 inline-block">Watch Video Testimonial</a>}
                    <div className="mt-4 space-y-2 border-t border-brand-border pt-4">
                        {Object.entries(t.scores).map(([key, value]) => (
                             <RatingDisplay key={key} label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} score={value as number} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const CollateralTab: React.FC<{ collaterals: Collateral[] }> = ({ collaterals }) => {
    const getFileIcon = (type: CollateralType) => {
        const props = {className: "w-8 h-8 flex-shrink-0"};
        switch(type) {
            case CollateralType.Presentation: return <PresentationIcon {...props} />;
            case CollateralType.Image: return <ImageIcon {...props} />;
            case CollateralType.PDF: default: return <FileTextIcon {...props} />;
        }
    };
    return (
        <div className="space-y-3">
            {collaterals.map(c => (
                 <div key={c.id} className="flex items-center justify-between p-3 bg-brand-card-light rounded-md border border-brand-border/50">
                    <div className="flex items-center space-x-4 text-brand-accent">
                        {getFileIcon(c.type)}
                        <div>
                            <p className="font-semibold">{c.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{c.fileName}</p>
                        </div>
                    </div>
                    <button className="px-3 py-1 text-sm font-semibold bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors">
                        Download
                    </button>
                </div>
            ))}
        </div>
    );
};

const PodcastsTab: React.FC<{ podcasts: Podcast[] }> = ({ podcasts }) => (
    <div className="space-y-4">
        {podcasts.map(p => (
            <div key={p.id} className="p-4 bg-brand-card-light rounded-lg border border-brand-border/50">
                <div className="flex items-center mb-2">
                    <MicrophoneIcon className="w-5 h-5 mr-3 text-brand-primary"/>
                    <h4 className="font-bold text-lg text-brand-accent">{p.title}</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 pl-8">{p.narrative}</p>
            </div>
        ))}
    </div>
);

const EventsTab: React.FC<{ events: Event[] }> = ({ events }) => (
    <div className="space-y-4">
        {events.map(e => (
            <div key={e.id} className="p-4 bg-brand-card-light rounded-lg border border-brand-border/50 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center">
                     <CalendarIcon className="w-8 h-8 mr-4 text-brand-primary"/>
                     <div>
                        <h4 className="font-bold text-lg text-brand-accent">{e.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(e.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {e.time}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{e.venue}</p>
                     </div>
                </div>
                <div className="flex items-center space-x-2">
                     {e.virtualLink && <a href={e.virtualLink} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 px-3 py-1 text-sm font-semibold bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"><span>Virtual Link</span> <ExternalLinkIcon className="w-4 h-4"/></a>}
                    <button className="px-3 py-1 text-sm font-semibold bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors">
                        Subscribe
                    </button>
                </div>
            </div>
        ))}
    </div>
);


const ContactTab: React.FC<{ contacts: KeyContact[] }> = ({ contacts }) => (
  <div>
    <SectionTitle>Key Contacts</SectionTitle>
    <div className="space-y-4">
      {contacts.map(contact => (
        <div key={contact.name} className="flex items-center justify-between p-3 bg-brand-card-light rounded-md">
          <p className="font-semibold">{contact.name}</p>
          <a href={contact.profileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-primary hover:underline">
            View Profile
          </a>
        </div>
      ))}
    </div>
  </div>
);

// --- MAIN COMPONENT --- //

interface ProfileTabsProps {
  seller: Seller;
  solution: Solution;
  posts: PostType[];
  isOwner: boolean;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ seller, solution, posts, isOwner }) => {
    const availableSolutions = seller.solutions.filter(s => s.status === 'active');
    const [activeSolution, setActiveSolution] = useState<Solution>(availableSolutions.find(s => s.id === solution.id) || availableSolutions[0]);

    const availableTabs = useMemo(() => {
        if (!activeSolution) return [];
        const tabs: {key: string, label: string, count?: number}[] = [
            {key: 'about', label: 'Solution Info'},
        ];
        if (activeSolution.caseStudies && activeSolution.caseStudies.length > 0) tabs.push({key: 'caseStudies', label: 'Case Studies', count: activeSolution.caseStudies.length});
        if (activeSolution.testimonials && activeSolution.testimonials.length > 0) tabs.push({key: 'testimonials', label: 'Testimonials', count: activeSolution.testimonials.length});
        if (activeSolution.collaterals && activeSolution.collaterals.length > 0) tabs.push({key: 'collateral', label: 'Collateral', count: activeSolution.collaterals.length});
        if (activeSolution.podcasts && activeSolution.podcasts.length > 0) tabs.push({key: 'podcasts', label: 'Podcasts', count: activeSolution.podcasts.length});
        if (activeSolution.events && activeSolution.events.length > 0) tabs.push({key: 'events', label: 'Events', count: activeSolution.events.length});
        tabs.push({key: 'contact', label: 'Contact'});
        return tabs;
    }, [activeSolution]);

  const [activeTab, setActiveTab] = useState(availableTabs[0]?.key || 'about');

  useEffect(() => {
    if (activeSolution) {
      setActiveTab('about');
    }
  }, [activeSolution]);

  const renderContent = () => {
    if (!activeSolution) return <div className="p-8 text-center text-gray-500">This seller has no active solutions.</div>
    switch (activeTab) {
      case 'caseStudies': return <CaseStudiesTab caseStudies={activeSolution.caseStudies} />;
      case 'testimonials': return <TestimonialsTab testimonials={activeSolution.testimonials} />;
      case 'collateral': return <CollateralTab collaterals={activeSolution.collaterals} />;
      case 'podcasts': return <PodcastsTab podcasts={activeSolution.podcasts} />;
      case 'events': return <EventsTab events={activeSolution.events} />;
      case 'contact': return <ContactTab contacts={seller.keyContacts} />;
      case 'about': default: return <AboutTab seller={seller} solution={activeSolution} isOwner={isOwner} />;
    }
  };

  return (
    <div className="bg-brand-card rounded-lg shadow-md border border-brand-border">
      <div className="p-2 sm:p-4 border-b border-brand-border">
        {availableSolutions.length > 1 && (
             <div className="mb-4">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 mr-2">Viewing Solution:</label>
                <select value={activeSolution.id} onChange={(e) => setActiveSolution(availableSolutions.find(s => s.id === e.target.value)!)} className="p-1 border border-brand-border rounded-md bg-brand-card-light">
                    {availableSolutions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
        )}
        <div className="flex space-x-2 overflow-x-auto pb-2 -mb-2">
            {availableTabs.map(tab => (
                <TabButton key={tab.key} active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)} variant="solid">
                    {tab.label} {tab.count !== undefined && `(${tab.count})`}
                </TabButton>
            ))}
        </div>
      </div>
      <div className="p-4 sm:p-6">
        {renderContent()}
      </div>
    </div>
  );
};
