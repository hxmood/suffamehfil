'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit, FiPlus, FiTrash2 } from 'react-icons/fi';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ParticipantsPage = () => {
  const router = useRouter()
  const [participants, setParticipants] = useState([]);
  const [teams, setTeams] = useState([]);
  const [filters, setFilters] = useState({ team: '', category: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState(null);
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ 
    _id: '',
    name: '', 
    team: '', 
    category: '' 
  });
  const [editError, setEditError] = useState('');

  const categories = [
    { value: 'bzone', label: 'B-Zone' },
    { value: 'czone', label: 'C-Zone' },
    { value: 'yzone', label: 'Y-Zone' },
    { value: 'general', label: 'General' }
  ];

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const teamsRes = await axios.get('/api/teams');
      setTeams(teamsRes.data);
      
      const params = new URLSearchParams();
      if (filters.team) params.append('team', filters.team);
      if (filters.category) params.append('category', filters.category);
      
      const participantsRes = await axios.get(`/api/registeredParticipants?${params.toString()}`);
      setParticipants(participantsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ team: '', category: '' });
  };

  // Edit Participant Functions
  const openEditModal = (participant) => {
    setEditForm({
      _id: participant._id,
      name: participant.name,
      team: participant.team._id,
      category: participant.category
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
      const res = await axios.put(`/api/participant/${editForm._id}`, {
        name: editForm.name,
        team: editForm.team,
        category: editForm.category
      });
      
      setParticipants(participants.map(p => 
        p._id === editForm._id ? res.data.participant : p
      ));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating participant:', error);
      setEditError(error.response?.data?.error || 'Failed to update participant');
    }
  };

  // Delete Participant Functions
  const openDeleteModal = (participant) => {
    setParticipantToDelete(participant);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/participant/${participantToDelete._id}`);
      setParticipants(participants.filter(p => p._id !== participantToDelete._id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting participant:', error);
      setError('Failed to delete participant');
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#FF6B6B] relative p-6 lg:flex lg:justify-between">
            <div>
            <h1 className="text-2xl font-bold text-white">Registered Participants</h1>
            <p className="text-white opacity-90 mt-1">
              View and manage all registered participants
            </p>
            </div>
            
            <button
              onClick={() => router.push('/participants')}
              className="flex items-center bg-white text-[#FF6B6B] px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors mt-4 md:mt-0"
            >
              <FiPlus className="mr-2" /> Add Participants
            </button>

            
            
          </div>

          {/* Filters */}
          <div className="p-6 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2E2E2E] mb-1">Filter by Team</label>
                <select
                  name="team"
                  value={filters.team}
                  onChange={handleFilterChange}
                  className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:border-[#12CBC4]"
                >
                  <option value="">All Teams</option>
                  {teams.map(team => (
                    <option key={team._id} value={team._id}>{team.name}</option>
                  ))}
                </select>
              </div>

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

          {/* Participants Table */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#12CBC4]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                <p>{error}</p>
              </div>
            ) : participants.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No participants found matching your criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2E2E] uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2E2E] uppercase tracking-wider">Team</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2E2E] uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2E2E] uppercase tracking-wider">Registered At</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2E2E] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {participants.map(participant => (
                      <tr key={participant._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2E2E2E]">
                          {participant.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2E2E2E]">
                          {participant.team?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            participant.category === 'bzone' ? 'bg-blue-100 text-blue-800' :
                            participant.category === 'czone' ? 'bg-green-100 text-green-800' :
                            participant.category === 'yzone' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {categories.find(c => c.value === participant.category)?.label || participant.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2E2E2E]">
                          {new Date(participant.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(participant)}
                              className="text-[#12CBC4] hover:text-[#0fa9a3]"
                              title="Edit"
                            >
                              <FiEdit size={18} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(participant)}
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

      {/* Edit Participant Modal */}
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
                    Edit Participant
                  </Dialog.Title>
                  
                  <div className="mt-4 space-y-4">
                    {editError && (
                      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                        <p>{editError}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2E2E2E] mb-1">Name</label>
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
                      <label className="block text-sm font-medium text-[#2E2E2E] mb-1">Team</label>
                      <select
                        name="team"
                        value={editForm.team}
                        onChange={handleEditChange}
                        className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:border-[#12CBC4]"
                        required
                      >
                        <option value="">Select Team</option>
                        {teams.map(team => (
                          <option key={team._id} value={team._id}>{team.name}</option>
                        ))}
                      </select>
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
                    Delete Participant
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete {participantToDelete?.name}? This action cannot be undone.
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
    </div>
  );
};

export default ParticipantsPage;