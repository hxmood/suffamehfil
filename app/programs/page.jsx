'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FiSave, FiX } from 'react-icons/fi';

const ProgramRegistration = () => {
  const router = useRouter();
  const [programName, setProgramName] = useState("")
  const [category, setCategory] = useState("")
  const [programType, setProgramType] = useState("individual")
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    type: 'individual'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    { value: 'bzone', label: 'B-Zone' },
    { value: 'czone', label: 'C-Zone' },
    { value: 'yzone', label: 'Y-Zone' },
    { value: 'general', label: 'General' }
  ];

  const programTypes = [
    { value: 'individual', label: 'Individual' },
    { value: 'group', label: 'Group' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess('');

    try {
      // Basic validation
      if (!programName.trim()) {
        throw new Error('Program name is required');
      }
      if (!category) {
        throw new Error('Category is required');
      }

      const response = await axios.post('/api/programs', {
        name: programName,
        category: category,
        type: programType
      });
      
      setSuccess('Program registered successfully!');
      setProgramName("");
      
      // Optionally redirect after delay
      setTimeout(() => {
        setSuccess("")
      }, 3000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to register program');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#FF6B6B] p-6 text-center">
          <h2 className="text-2xl font-bold text-white">Register New Program</h2>
          <p className="text-white opacity-90 mt-1">Add a new program for the fest</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
              <p>{success}</p>
            </div>
          )}

          {/* Program Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#2E2E2E] mb-1">
              Program Name *
            </label>
            <input
              type="text"
              id="name"
              name="programName"
              value={programName}
              onChange={(e) => {setProgramName(e.target.value); setError("")}}
              placeholder="Enter program name"
              className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:border-[#12CBC4] transition-all"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-[#2E2E2E] mb-1">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:border-[#12CBC4] transition-all"
              required
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Program Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-[#2E2E2E] mb-1">
              Program Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {programTypes.map(type => (
                <label key={type.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={type.value}
                    name="type"
                    value={type.value}
                    checked={programType === type.value}
                    // onChange={handleChange}
                    onChange={(e) => {setProgramType(e.target.value); setError('')}}
                    className="text-[#12CBC4] focus:ring-[#12CBC4]"
                  />
                  <span>{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => router.push('/registeredPrograms')}
              className="flex items-center px-4 py-2 text-sm font-medium text-[#2E2E2E] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
               View Programs
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#12CBC4] hover:bg-[#0fa9a3]'
              }`}
            >
              <FiSave className="mr-2" />
              {isSubmitting ? 'Registering...' : 'Register Program'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProgramRegistration;