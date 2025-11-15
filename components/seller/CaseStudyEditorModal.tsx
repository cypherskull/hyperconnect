import React, { useState, useEffect } from 'react';
import { CaseStudy, RichTextCustomField } from '../../types';
import { CloseIcon, PlusIcon, TrashIcon } from '../common/Icons';
import { RichTextInput } from '../common/RichTextInput';
import { Input, Select, Label, Button } from '../common/Forms';

interface CaseStudyEditorModalProps {
  caseStudy: CaseStudy | null;
  onClose: () => void;
  onSave: (caseStudy: CaseStudy) => void;
}

export const CaseStudyEditorModal: React.FC<CaseStudyEditorModalProps> = ({ caseStudy, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<CaseStudy, 'implementationTime'>>({
        id: caseStudy?.id || `cs-${Date.now()}`,
        clientName: caseStudy?.clientName || '',
        clientNeed: caseStudy?.clientNeed || '',
        solutionApproach: caseStudy?.solutionApproach || '',
        solutionDescription: caseStudy?.solutionDescription || '',
        referenceAvailable: caseStudy?.referenceAvailable || false,
        isClientApproved: caseStudy?.isClientApproved || false,
        customFields: caseStudy?.customFields || [],
    });
    const [timeValue, setTimeValue] = useState<number>(3);
    const [timeUnit, setTimeUnit] = useState<string>('Months');

    useEffect(() => {
        if (caseStudy?.implementationTime) {
            const parts = caseStudy.implementationTime.split(' ');
            if (parts.length === 2 && !isNaN(parseInt(parts[0]))) {
                setTimeValue(parseInt(parts[0]));
                setTimeUnit(parts[1]);
            }
        }
    }, [caseStudy]);

    const handleCustomFieldChange = (index: number, field: 'label' | 'content', value: string) => {
        const updatedFields = [...formData.customFields];
        updatedFields[index][field] = value;
        setFormData(prev => ({ ...prev, customFields: updatedFields }));
    };

    const addCustomField = () => {
        if (formData.customFields.length < 5) {
            setFormData(prev => ({...prev, customFields: [...prev.customFields, { id: `cscf-${Date.now()}`, label: '', content: '' }]}));
        }
    };
    
    const removeCustomField = (id: string) => {
        setFormData(prev => ({ ...prev, customFields: prev.customFields.filter(f => f.id !== id) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            implementationTime: `${timeValue} ${timeUnit}`
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-brand-card rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-brand-border">
                    <h2 className="text-xl font-bold">{caseStudy ? 'Edit Case Study' : 'Add New Case Study'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20"><CloseIcon className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
                    <div>
                        <Label>Client Name</Label>
                        <Input name="clientName" value={formData.clientName} onChange={e => setFormData(p => ({...p, clientName: e.target.value}))} required />
                    </div>
                    
                    <RichTextInput label="Client Need" value={formData.clientNeed} onChange={val => setFormData(p => ({...p, clientNeed: val}))} />
                    <RichTextInput label="Solution Approach" value={formData.solutionApproach} onChange={val => setFormData(p => ({...p, solutionApproach: val}))} />
                    <RichTextInput label="Short Description of Solution" value={formData.solutionDescription} onChange={val => setFormData(p => ({...p, solutionDescription: val}))} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Time to Implement</Label>
                            <div className="flex gap-2">
                                <Input type="number" value={timeValue} onChange={e => setTimeValue(Number(e.target.value))} min="1" className="w-1/3"/>
                                <Select value={timeUnit} onChange={e => setTimeUnit(e.target.value)}>
                                    <option>Days</option>
                                    <option>Weeks</option>
                                    <option>Months</option>
                                    <option>Years</option>
                                </Select>
                            </div>
                        </div>
                        <div>
                             <Label>Reference Check Available</Label>
                             <Select value={String(formData.referenceAvailable)} onChange={e => setFormData(p => ({...p, referenceAvailable: e.target.value === 'true'}))}>
                                 <option value="true">Yes</option>
                                 <option value="false">No</option>
                             </Select>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-brand-border">
                        <h3 className="font-semibold mb-2">Custom Rich Text Fields ({formData.customFields.length}/5)</h3>
                        <div className="space-y-4">
                            {formData.customFields.map((field, index) => (
                                <div key={field.id} className="p-3 border border-brand-border/50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Input placeholder="Custom Field Label" value={field.label} onChange={e => handleCustomFieldChange(index, 'label', e.target.value)} />
                                        <button type="button" onClick={() => removeCustomField(field.id)}><TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500" /></button>
                                    </div>
                                    <RichTextInput label="" value={field.content} onChange={val => handleCustomFieldChange(index, 'content', val)} />
                                </div>
                            ))}
                        </div>
                        {formData.customFields.length < 5 && <button type="button" onClick={addCustomField} className="mt-2 text-sm text-brand-primary hover:underline flex items-center space-x-1"><PlusIcon className="w-4 h-4" /><span>Add Custom Field</span></button>}
                    </div>

                    <div className="pt-4 border-t border-brand-border">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isClientApproved}
                                onChange={e => setFormData(p => ({...p, isClientApproved: e.target.checked}))}
                                className="h-5 w-5 rounded border-gray-400 text-brand-primary focus:ring-brand-primary"
                            />
                            <span className="font-semibold text-gray-700 dark:text-gray-200">This case study is approved by the client for public sharing.</span>
                        </label>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit">
                            Save Case Study
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};