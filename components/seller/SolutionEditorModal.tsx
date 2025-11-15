import React, { useState, useEffect } from 'react';
import { Solution, SolutionCustomField } from '../../types';
import { CloseIcon, PlusIcon, TrashIcon } from '../common/Icons';
import { MultiSelectDropdown } from '../common/MultiSelectDropdown';
import { RichTextInput } from '../common/RichTextInput';
import { mockFilterOptions } from '../../services/api';
import { Input, Label } from '../common/Forms';

interface SolutionEditorModalProps {
  solution: Solution | null;
  onClose: () => void;
  onSave: (solutionData: Solution) => void;
}

export const SolutionEditorModal: React.FC<SolutionEditorModalProps> = ({ solution, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    offering: '',
    industry: [] as string[],
    valueChain: [] as string[],
    geography: [] as string[],
    customFields: [] as SolutionCustomField[],
    revenueFromPlatform: 0,
    imageUrl: '', // Added to satisfy Solution type
  });

  useEffect(() => {
    if (solution) {
      setFormData({
        name: solution.name,
        shortDescription: solution.shortDescription || '',
        offering: solution.offering,
        industry: solution.industry,
        valueChain: solution.valueChain,
        geography: solution.geography,
        customFields: solution.customFields,
        revenueFromPlatform: solution.revenueFromPlatform || 0,
        imageUrl: solution.imageUrl,
      });
    }
  }, [solution]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleCustomFieldChange = (index: number, field: 'label' | 'value', value: string) => {
      const updatedFields = [...formData.customFields];
      const fieldData = updatedFields[index];
      
      // Validation
      if(field === 'label' && value.length > 10) return;
      if(field === 'value' && value.length > 20) return;
      
      fieldData[field] = value;
      setFormData(prev => ({ ...prev, customFields: updatedFields }));
  };
  
  const addCustomField = () => {
      if (formData.customFields.length < 10) {
          setFormData(prev => ({ ...prev, customFields: [...prev.customFields, { id: `scf-${Date.now()}`, label: '', value: '' }] }));
      }
  };
  
  const removeCustomField = (id: string) => {
      setFormData(prev => ({ ...prev, customFields: prev.customFields.filter(f => f.id !== id) }));
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSolutionData: Solution = {
        // Defaults for a new solution
        id: `sol-${Date.now()}`,
        isActive: true,
        status: 'inactive',
        isSetupFeePaid: false,
        caseStudies: [],
        testimonials: [],
        collaterals: [],
        podcasts: [],
        events: [],
        
        // If editing, spread original solution to keep un-edited fields (like id, status, content arrays, etc.)
        ...(solution || {}),

        // Overwrite with form data from the editor
        ...formData,
    };
    onSave(finalSolutionData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-brand-border">
          <h2 className="text-xl font-bold">{solution ? 'Edit Solution' : 'Add New Solution'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20"><CloseIcon className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          <div>
            <Label>Solution Name</Label>
            <Input name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <RichTextInput 
            label="Short Description"
            value={formData.shortDescription}
            onChange={val => setFormData(p => ({...p, shortDescription: val}))}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label>Offering</Label>
                <Input name="offering" value={formData.offering} onChange={handleChange} required />
            </div>
            <div>
                <Label>Revenue from Platform (₹)</Label>
                <Input name="revenueFromPlatform" type="number" value={formData.revenueFromPlatform} onChange={handleChange} />
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MultiSelectDropdown
                label="Industry"
                options={mockFilterOptions.industries}
                selectedItems={formData.industry}
                onChange={items => setFormData(p => ({...p, industry: items}))}
                maxSelection={3}
              />
              <MultiSelectDropdown
                label="Value Chain"
                options={mockFilterOptions.valueChains}
                selectedItems={formData.valueChain}
                onChange={items => setFormData(p => ({...p, valueChain: items}))}
                maxSelection={3}
              />
               <MultiSelectDropdown
                label="Geography"
                options={mockFilterOptions.geographies}
                selectedItems={formData.geography}
                onChange={items => setFormData(p => ({...p, geography: items}))}
                maxSelection={3}
              />
          </div>
          
           <div className="pt-4 border-t border-brand-border">
              <h3 className="font-semibold mb-2">Custom Solution Fields ({formData.customFields.length}/10)</h3>
              <div className="space-y-2">
                {formData.customFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                        <Input name="label" placeholder="Label (max 10 chars)" value={field.label} onChange={e => handleCustomFieldChange(index, 'label', e.target.value)} />
                        <div className="flex items-center gap-2">
                           <Input name="value" placeholder="Value (max 20 chars)" value={field.value} onChange={e => handleCustomFieldChange(index, 'value', e.target.value)} />
                           <button type="button" onClick={() => removeCustomField(field.id)}><TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500"/></button>
                        </div>
                    </div>
                ))}
              </div>
              {formData.customFields.length < 10 && <button type="button" onClick={addCustomField} className="mt-2 text-sm text-brand-primary hover:underline flex items-center space-x-1"><PlusIcon className="w-4 h-4"/><span>Add Custom Field</span></button>}
          </div>
          
          <div className="p-4 border-t border-brand-border flex justify-end">
            <button type="submit" className="px-6 py-2 rounded-md text-center bg-brand-primary text-white font-semibold hover:bg-brand-secondary transition-colors">
              Save Solution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};