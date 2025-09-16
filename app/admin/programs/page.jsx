'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const ProgramsPage = () => {
  const router = useRouter();
  const [allPrograms, setAllPrograms] = useState([]); // Store all programs
  const [filteredPrograms, setFilteredPrograms] = useState([]); // Store filtered programs
  const [filters, setFilters] = useState({
    category: '',
    type: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit and Delete modal states remain the same
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ 
    _id: '',
    name: '', 
    category: '', 
    type: 'individual' 
  });
  const [editError, setEditError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);

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

  // Fetch all programs once on component mount
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await axios.get('/api/programs');
        setAllPrograms(response.data);
        setFilteredPrograms(response.data); // Initialize filtered programs with all data
      } catch (err) {
        console.error('Failed to fetch programs:', err);
        setError('Failed to load programs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  // Apply filters whenever filters or allPrograms change
  useEffect(() => {
    const filtered = allPrograms.filter(program => {
      // Category filter
      if (filters.category && program.category !== filters.category) {
        return false;
      }
      // Type filter
      if (filters.type && program.type !== filters.type) {
        return false;
      }
      return true;
    });
    setFilteredPrograms(filtered);
  }, [filters, allPrograms]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: '', type: '' });
  };

  // Edit Program Functions
  const openEditModal = (program) => {
    setEditForm({
      _id: program._id,
      name: program.name,
      category: program.category,
      type: program.type
    });
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const submitEdit = async () => {
    try {
      setEditError('');
      const res = await axios.put(`/api/programs/${editForm._id}`, editForm);
      
      // Update both allPrograms and filteredPrograms
      setAllPrograms(allPrograms.map(p => 
        p._id === editForm._id ? res.data.program : p
      ));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating program:', error);
      setEditError(error.response?.data?.error || 'Failed to update program');
    }
  };

  // Delete Program Functions
  const openDeleteModal = (program) => {
    setProgramToDelete(program);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/programs/${programToDelete._id}`);
      // Update both allPrograms and filteredPrograms
      setAllPrograms(allPrograms.filter(p => p._id !== programToDelete._id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting program:', error);
      setError('Failed to delete program');
      setIsDeleteModalOpen(false);
    }
  };

  // The rest of the component remains the same, just replace references to 'programs' with 'filteredPrograms'
  return (
    <div className="min-h-screen bg-[#F9F9F9] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#FF6B6B] p-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Programs Management</h1>
              <p className="text-white opacity-90 mt-1">
                View and manage all festival programs
              </p>
            </div>
            <button
              onClick={() => router.push('/programs')}
              className="flex items-center bg-white text-[#FF6B6B] px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiPlus className="mr-2" /> Add Program
            </button>
          </div>

          {/* Filters */}
          <div className="p-6 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-[#2E2E2E] mb-1">Filter by Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:border-[#12CBC4]"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-[#2E2E2E] mb-1">Filter by Type</label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:border-[#12CBC4]"
                >
                  <option value="">All Types</option>
                  {programTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-[#2E2E2E] px-4 py-2 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Programs Table - Now using filteredPrograms */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#12CBC4]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                <p>{error}</p>
              </div>
            ) : filteredPrograms.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No programs found matching your criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2E2E] uppercase tracking-wider">Program Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2E2E] uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2E2E] uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2E2E] uppercase tracking-wider">Created At</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2E2E] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPrograms.map(program => (
                      <tr key={program._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2E2E2E]">
                          {program.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            program.category === 'bzone' ? 'bg-blue-100 text-blue-800' :
                            program.category === 'czone' ? 'bg-green-100 text-green-800' :
                            program.category === 'yzone' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {categories.find(c => c.value === program.category)?.label || program.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            program.type === 'individual' ? 'bg-purple-100 text-purple-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {program.type.charAt(0).toUpperCase() + program.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2E2E2E]">
                          {new Date(program.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(program)}
                              className="text-[#12CBC4] hover:text-[#0fa9a3]"
                              title="Edit"
                            >
                              <FiEdit size={18} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(program)}
                              className="text-[#FF6B6B] hover:text-[#e05555]"
                              title="Delete"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit and Delete Modals remain the same */}
      <Transition appear show={isEditModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsEditModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-[#2E2E2E]"
                  >
                    Edit Program
                  </Dialog.Title>
                  
                  <div className="mt-4 space-y-4">
                    {editError && (
                      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                        <p>{editError}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2E2E2E] mb-1">Program Name</label>
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:border-[#12CBC4]"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2E2E2E] mb-1">Category</label>
                      <select
                        name="category"
                        value={editForm.category}
                        onChange={handleEditChange}
                        className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:border-[#12CBC4]"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2E2E2E] mb-1">Program Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {programTypes.map(type => (
                          <label key={type.value} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="type"
                              value={type.value}
                              checked={editForm.type === type.value}
                              onChange={handleEditChange}
                              className="text-[#12CBC4] focus:ring-[#12CBC4]"
                            />
                            <span>{type.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-[#2E2E2E] bg-gray-100 hover:bg-gray-200 rounded-lg"
                      onClick={() => setIsEditModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-[#12CBC4] hover:bg-[#0fa9a3] rounded-lg"
                      onClick={submitEdit}
                    >
                      Save Changes
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Modal */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsDeleteModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-[#2E2E2E]"
                  >
                    Delete Program
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete "{programToDelete?.name}"? This action cannot be undone.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-[#2E2E2E] bg-gray-100 hover:bg-gray-200 rounded-lg"
                      onClick={() => setIsDeleteModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-[#FF6B6B] hover:bg-[#e05555] rounded-lg"
                      onClick={confirmDelete}
                    >
                      Delete
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      
      {/* ... */}
    </div>
  );
};

export default ProgramsPage;