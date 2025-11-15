import React, { useState, useMemo, useRef, useEffect } from 'react';
import { InboxItem, User, Seller, SharedContent, CaseStudy, Collateral, CollateralType, MeetingDetails } from '../../types';
import { CloseIcon, PaperClipIcon, TrashIcon, FileTextIcon, PresentationIcon, CalendarIcon, UploadIcon } from '../common/Icons';
import { MeetingInviteModal } from '../common/MeetingLinkModal';

interface ResponseModalProps {
  item: InboxItem;
  currentUser: User;
  currentUserSellerProfile: Seller | null;
  onClose: () => void;
  onSend: (originalItem: InboxItem, responseText: string, attachments: SharedContent[], meetingDetails?: MeetingDetails) => void;
}

const AttachmentPicker: React.FC<{
    items: SharedContent[];
    selected: SharedContent[];
    onToggle: (item: SharedContent) => void;
}> = ({ items, selected, onToggle }) => {
    
    const isSelected = (item: SharedContent) => {
        return selected.some(sel => sel.item.id === item.item.id && sel.type === item.type);
    }
    
    return (
        <div className="absolute bottom-full mb-2 w-full max-w-sm bg-brand-card border border-brand-border rounded-lg shadow-lg z-20">
            <div className="p-2 text-sm font-semibold border-b border-brand-border">Attach Platform Content</div>
            <div className="max-h-60 overflow-y-auto">
                {items.length > 0 ? items.map((content, index) => (
                    <label key={`${content.item.id}-${index}`} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isSelected(content)}
                            onChange={() => onToggle(content)}
                            className="h-4 w-4 rounded border-gray-400 text-brand-primary focus:ring-brand-primary"
                        />
                        <div className="ml-3 text-sm">
                            <p className="font-medium">{(content.item as Collateral).name || (content.item as CaseStudy).clientName}</p>
                            <p className="text-xs text-gray-500 capitalize">{content.type.replace('caseStudy', 'Case Study')}</p>
                        </div>
                    </label>
                )) : <p className="p-4 text-sm text-gray-500">No attachable content found.</p>}
            </div>
        </div>
    )
}

export const ResponseModal: React.FC<ResponseModalProps> = ({ item, currentUser, currentUserSellerProfile, onClose, onSend }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<SharedContent[]>([]);
  const [isPickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [isMeetingModalOpen, setMeetingModalOpen] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState<MeetingDetails | null>(null);
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const attachableItems = useMemo(() => {
    if (!currentUserSellerProfile) return [];
    const items: SharedContent[] = [];
    currentUserSellerProfile.solutions.forEach(solution => {
        (solution.collaterals || []).forEach(collateral => items.push({ type: 'collateral', item: collateral }));
        (solution.caseStudies || []).filter(cs => cs.isClientApproved).forEach(cs => items.push({ type: 'caseStudy', item: cs }));
    });
    return items;
  }, [currentUserSellerProfile]);

  const handleToggleAttachment = (itemToToggle: SharedContent) => {
      setAttachments(prev => 
        prev.some(att => att.item.id === itemToToggle.item.id && att.type === itemToToggle.type)
            ? prev.filter(att => !(att.item.id === itemToToggle.item.id && att.type === itemToToggle.type))
            : [...prev, itemToToggle]
      );
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setLocalFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setLocalFiles(prev => prev.filter(f => f.name !== fileName));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === '') return;
    onSend(item, message, attachments, meetingDetails || undefined);
    if(localFiles.length > 0) {
        alert(`${localFiles.length} local file(s) would be uploaded.`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-brand-card rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-brand-border">
            <h2 className="text-xl font-bold">Replying to {item.fromUser.name}</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20"><CloseIcon className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSubmit}>
            <div className="p-6">
                <div className="p-3 bg-brand-card-light rounded-md border border-brand-border/50 mb-4">
                    <p className="text-xs text-gray-500">In response to:</p>
                    <p className="text-sm italic text-gray-600 dark:text-gray-300 line-clamp-2">"{item.content}"</p>
                </div>
                <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your response..."
                rows={8}
                className="w-full p-2 border border-brand-border rounded-md bg-brand-card-light focus:ring-2 focus:ring-brand-primary outline-none"
                required
                />
                {(attachments.length > 0 || localFiles.length > 0 || meetingDetails) && (
                    <div className="mt-4 space-y-2">
                        {attachments.map((att, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm">
                                <div className="flex items-center gap-2">
                                    {att.type === 'collateral' ? <FileTextIcon className="w-4 h-4 text-blue-500" /> : <PresentationIcon className="w-4 h-4 text-purple-500" />}
                                    <span>{(att.item as Collateral).name || (att.item as CaseStudy).clientName}</span>
                                </div>
                                <button type="button" onClick={() => handleToggleAttachment(att)}><TrashIcon className="w-4 h-4 text-gray-500 hover:text-red-500"/></button>
                            </div>
                        ))}
                        {localFiles.map((file, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded-md text-sm">
                                <div className="flex items-center gap-2">
                                    <FileTextIcon className="w-4 h-4 text-green-500" />
                                    <span>{file.name}</span>
                                </div>
                                <button type="button" onClick={() => handleRemoveFile(file.name)}><TrashIcon className="w-4 h-4 text-gray-500 hover:text-red-500"/></button>
                            </div>
                        ))}
                        {meetingDetails && (
                            <div className="flex justify-between items-start p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md text-sm">
                                <div className="flex items-start gap-3">
                                    <CalendarIcon className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold">Meeting Invite Attached</p>
                                        <p><strong>Time:</strong> {new Date(meetingDetails.proposedTime).toLocaleString()}</p>
                                        <p><strong>Link:</strong> <a href={meetingDetails.meetingLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-primary">{meetingDetails.platform}</a></p>
                                        {meetingDetails.additionalParticipants && meetingDetails.additionalParticipants.length > 0 && (
                                            <p><strong>Guests:</strong> {meetingDetails.additionalParticipants.join(', ')}</p>
                                        )}
                                    </div>
                                </div>
                                <button type="button" onClick={() => setMeetingDetails(null)}><TrashIcon className="w-4 h-4 text-gray-500 hover:text-red-500"/></button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="flex justify-between items-center p-4 bg-brand-card-light rounded-b-lg border-t border-brand-border">
                <div ref={pickerRef} className="relative flex items-center gap-1 sm:gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />
                    {currentUserSellerProfile && (
                        <button type="button" onClick={() => setPickerOpen(p => !p)} className="flex flex-col items-center justify-center p-2 w-16 h-16 text-xs font-semibold rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600" title="Attach from Platform">
                            <PaperClipIcon className="w-5 h-5"/>
                            <span className="mt-1">Platform</span>
                        </button>
                    )}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-2 w-16 h-16 text-xs font-semibold rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600" title="Attach from Device">
                        <UploadIcon className="w-5 h-5"/>
                        <span className="mt-1">Device</span>
                    </button>
                    <button type="button" onClick={() => setMeetingModalOpen(true)} className="flex flex-col items-center justify-center p-2 w-16 h-16 text-xs font-semibold rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600" title="Add Meeting Invite">
                        <CalendarIcon className="w-5 h-5"/>
                        <span className="mt-1">Meeting</span>
                    </button>
                    {isPickerOpen && <AttachmentPicker items={attachableItems} selected={attachments} onToggle={handleToggleAttachment} />}
                </div>
                <button type="submit" className="px-6 py-2 rounded-[10px] bg-brand-primary text-white font-semibold hover:bg-brand-primary/70 transition-colors">
                Send Response
                </button>
            </div>
            </form>
        </div>
        </div>
         {isMeetingModalOpen && (
            <MeetingInviteModal
                mode="propose"
                onClose={() => setMeetingModalOpen(false)}
                onSave={(details) => {
                    setMeetingDetails({
                        ...details,
                        message: details.message || `Meeting proposed by ${currentUser.name}`,
                        status: 'pending',
                    } as MeetingDetails);
                    setMeetingModalOpen(false);
                }}
            />
        )}
    </>
  );
};