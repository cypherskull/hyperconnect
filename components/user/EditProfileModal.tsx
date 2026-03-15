import React, { useState, useRef } from 'react';
import { User } from '../../types';
import { CloseIcon, UploadIcon } from '../common/Icons';
import { Input, Button, Label } from '../common/Forms';

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedFields: Partial<User>) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    company: user.company,
    designation: user.designation,
    avatarUrl: user.avatarUrl,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would be an upload to a server returning a URL.
      // Here we simulate it by creating a fake local URL or using a placeholder service logic
      // For demonstration, we'll just alert and mock a change if it's an image.
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-card rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-brand-border">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20"><CloseIcon className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img 
                    src={formData.avatarUrl} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-brand-card-light shadow-md" 
                />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <UploadIcon className="w-8 h-8 text-white" />
                </div>
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
            />
            <p className="text-xs text-gray-500">Click image to upload new photo</p>
            
            {/* Fallback URL input if file upload simulation is tricky for user */}
            <div className="w-full">
                <Label>Or Image URL</Label>
                <Input 
                    name="avatarUrl" 
                    value={formData.avatarUrl} 
                    onChange={handleChange} 
                    placeholder="https://..." 
                    className="text-xs"
                />
            </div>
          </div>

          <div>
            <Label>Full Name</Label>
            <Input name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div>
            <Label>Company Name</Label>
            <Input name="company" value={formData.company} onChange={handleChange} required />
          </div>

          <div>
            <Label>Designation / Role</Label>
            <Input name="designation" value={formData.designation} onChange={handleChange} required />
          </div>

          <div className="pt-4 border-t border-brand-border flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};