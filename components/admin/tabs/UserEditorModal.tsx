import React, { useState } from 'react';
import { User, Persona } from '../../../types';
import { CloseIcon } from '../../common/Icons';
import { Input, Select, Button, Label } from '../../common/Forms';

interface UserEditorModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

export const UserEditorModal: React.FC<UserEditorModalProps> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<User>>({
    name: user.name,
    businessEmail: user.businessEmail,
    persona: user.persona,
    role: user.role,
    company: user.company,
    designation: user.designation,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...user, ...formData } as User);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-card rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-brand-border">
          <h2 className="text-xl font-bold">Edit User Privileges</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20"><CloseIcon className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div>
            <Label>Business Email</Label>
            <Input name="businessEmail" value={formData.businessEmail} onChange={handleChange} required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Platform Persona</Label>
                <Select name="persona" value={formData.persona} onChange={handleChange}>
                    <option value="Buyer">Buyer</option>
                    <option value="Seller">Seller</option>
                    <option value="Investor">Investor</option>
                    <option value="Collaborator">Collaborator</option>
                    <option value="Browser">Browser</option>
                    <option value="Admin">Platform Admin</option>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Controls platform-level features.</p>
              </div>
              <div>
                <Label>Organization Role</Label>
                <Select name="role" value={formData.role} onChange={handleChange}>
                    <option value="Member">Member</option>
                    <option value="Admin">Org Admin</option>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Controls Enterprise management.</p>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Company</Label>
                <Input name="company" value={formData.company} onChange={handleChange} required />
              </div>
              <div>
                <Label>Designation</Label>
                <Input name="designation" value={formData.designation} onChange={handleChange} required />
              </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-brand-border gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};