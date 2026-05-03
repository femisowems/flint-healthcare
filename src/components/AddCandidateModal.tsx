import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const RECRUITER_OPTIONS = [
  { label: 'Admin User', value: 'Admin User', email: 'admin@flint.test' },
  { label: 'Priya Shah', value: 'Priya Shah', email: 'priya@flint.test' },
  { label: 'Daniel Kim', value: 'Daniel Kim', email: 'daniel@flint.test' },
  { label: 'Sofia Alvarez', value: 'Sofia Alvarez', email: 'sofia@flint.test' },
];

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCandidateModal({ isOpen, onClose, onSuccess }: AddCandidateModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    stage: 'Applied',
    assignedRecruiter: 'Admin User',
    assignedRecruiterEmail: 'admin@flint.test',
    interviewDate: '',
    experience: '',
    specialization: '',
    tags: '',
    resume: true,
    nursingLicense: false,
    passport: false,
    visaPacket: false,
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (name === 'assignedRecruiter') {
      const selectedRecruiter = RECRUITER_OPTIONS.find((recruiter) => recruiter.value === value);
      setFormData((prev) => ({
        ...prev,
        assignedRecruiter: value,
        assignedRecruiterEmail: selectedRecruiter?.email || prev.assignedRecruiterEmail,
      }));
      return;
    }

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        experience: formData.experience ? parseInt(formData.experience) : undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        interviewDate: formData.interviewDate || undefined,
        documents: {
          resume: { received: formData.resume },
          nursingLicense: { received: formData.nursingLicense },
          passport: { received: formData.passport },
          visaPacket: { received: formData.visaPacket },
        },
      };

      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create candidate');
      
      toast.success('Candidate added successfully!');
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: '',
        email: '',
        country: '',
        stage: 'Applied',
        assignedRecruiter: 'Admin User',
        assignedRecruiterEmail: 'admin@flint.test',
        interviewDate: '',
        experience: '',
        specialization: '',
        tags: '',
        resume: true,
        nursingLicense: false,
        passport: false,
        visaPacket: false,
      });
    } catch (error) {
      console.error(error);
      toast.error('Error creating candidate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Add New Candidate</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" placeholder="e.g. Jane Doe" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" placeholder="jane@example.com" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
              <input required type="text" name="country" value={formData.country} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" placeholder="e.g. Canada" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
              <select name="stage" value={formData.stage} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-white">
                <option value="Applied">Applied</option>
                <option value="Screening">Screening</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Visa Processing">Visa Processing</option>
                <option value="Placed">Placed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Recruiter</label>
              <select name="assignedRecruiter" value={formData.assignedRecruiter} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-white">
                {RECRUITER_OPTIONS.map((recruiter) => (
                  <option key={recruiter.value} value={recruiter.value}>{recruiter.value}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interview Date</label>
              <input type="date" name="interviewDate" value={formData.interviewDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
              <input type="number" name="experience" value={formData.experience} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" placeholder="e.g. ICU" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Comma separated)</label>
            <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" placeholder="e.g. Pediatric, Bilingual" />
          </div>

          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">Document Checklist</p>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="resume" checked={formData.resume} onChange={handleChange} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                Resume received
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="nursingLicense" checked={formData.nursingLicense} onChange={handleChange} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                Nursing license
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="passport" checked={formData.passport} onChange={handleChange} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                Passport copy
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="visaPacket" checked={formData.visaPacket} onChange={handleChange} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                Visa packet
              </label>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Candidate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
