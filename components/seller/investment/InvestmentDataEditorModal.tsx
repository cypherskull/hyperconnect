import React, { useState } from 'react';
import { DueDiligenceData } from '../../../types';
import { CloseIcon, PlusIcon, TrashIcon } from '../../common/Icons';
import { Button, Input, Select, Textarea } from '../../common/Forms';
import { RichTextInput } from '../../common/RichTextInput';
import { TabButton } from '../../common/TabButton';

interface InvestmentDataEditorModalProps {
    initialData: DueDiligenceData;
    onClose: () => void;
    onSave: (data: DueDiligenceData) => void;
}

type EditorTab = 'summary' | 'financials' | 'commercials' | 'funding' | 'risk';

export const InvestmentDataEditorModal: React.FC<InvestmentDataEditorModalProps> = ({ initialData, onClose, onSave }) => {
    const [data, setData] = useState<DueDiligenceData>(JSON.parse(JSON.stringify(initialData))); // Deep copy
    const [activeTab, setActiveTab] = useState<EditorTab>('summary');

    const handleSave = () => {
        onSave(data);
    };

    const renderContent = () => {
        // A simple generic handler for nested objects
        const handleSectionChange = <K extends keyof DueDiligenceData>(section: K, value: DueDiligenceData[K]) => {
            setData(prev => ({ ...prev, [section]: value }));
        };

        switch (activeTab) {
            case 'summary':
                return (
                    <RichTextInput 
                        label="Executive Summary & AI Recommendation"
                        value={data.executiveSummary}
                        onChange={value => setData(prev => ({...prev, executiveSummary: value}))}
                        rows={10}
                    />
                );
            case 'financials':
                return <div><p>Financials editor coming soon.</p></div>
            case 'commercials':
                 return <div><p>Commercials editor coming soon.</p></div>
            case 'funding':
                 return <div><p>Funding editor coming soon.</p></div>
            case 'risk':
                 return <div><p>Risk & Legal editor coming soon.</p></div>
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-brand-card rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-brand-border">
                    <h2 className="text-xl font-bold">Edit Investment Data</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20"><CloseIcon className="w-5 h-5"/></button>
                </div>
                <div className="p-4 border-b border-brand-border flex-shrink-0">
                     <div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
                        <TabButton active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} variant="solid">Summary</TabButton>
                        <TabButton active={activeTab === 'financials'} onClick={() => setActiveTab('financials')} variant="solid">Financials</TabButton>
                        <TabButton active={activeTab === 'commercials'} onClick={() => setActiveTab('commercials')} variant="solid">Commercial</TabButton>
                        <TabButton active={activeTab === 'funding'} onClick={() => setActiveTab('funding')} variant="solid">Funding</TabButton>
                        <TabButton active={activeTab === 'risk'} onClick={() => setActiveTab('risk')} variant="solid">Risk/Legal</TabButton>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {renderContent()}
                </div>
                <div className="flex justify-end p-4 bg-brand-card-light rounded-b-lg border-t border-brand-border flex-shrink-0">
                    <Button onClick={handleSave} className="px-8">Save Changes</Button>
                </div>
            </div>
        </div>
    );
};