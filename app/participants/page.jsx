'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

const ParticipantForm = () => {
  // Persistent team and category selection
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Form state
  const [name, setName] = useState('');
  const [teams, setTeams] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [nameError, setNameError] = useState('');

  // Fetch teams and existing participants on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, participantsRes] = await Promise.all([
          axios.get('/api/teams'),
          axios.get('/api/participant')
        ]);
        setTeams(teamsRes.data);
        setParticipants(participantsRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
        setStatusMessage({ text: 'Failed to load data', type: 'error' });
      }
    };
    fetchData();
  }, []);

  // Check for duplicate names
  const checkDuplicateName = (name) => {
    if (!name.trim()) return false;
    
    return participants.some(participant => 
      participant.name.toLowerCase() === name.toLowerCase() &&
      participant.team === selectedTeam &&
      participant.category === selectedCategory
    );
  };

  // Clear success message when typing starts
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    
    if (statusMessage.type === 'success') {
      setStatusMessage({ text: '', type: '' });
    }

    // Check for duplicates in real-time
    if (checkDuplicateName(newName)) {
      setNameError('This name already exists for the selected team and category');
    } else {
      setNameError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Final duplicate check before submission
    if (checkDuplicateName(name)) {
      setStatusMessage({ text: 'This participant is already registered', type: 'error' });
      setIsSubmitting(false);
      return;
    }

    if (!selectedTeam || !selectedCategory) {
      setStatusMessage({ text: 'Please select both team and category', type: 'error' });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          team: selectedTeam,
          category: selectedCategory,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMessage({ text: `${name} added successfully!`, type: 'success' });
        setName("");
        // Update participants list
        setParticipants([...participants, data.participant]);
      } else {
        setStatusMessage({ text: data.error || "Failed to add participant", type: 'error' });
      }
    } catch (error) {
      console.error("Error:", error);
      setStatusMessage({ text: "Something went wrong", type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-[#FF6B6B] p-6 text-center">
          <h2 className="text-2xl font-bold text-white">Register Participants</h2>
          <p className="text-white opacity-90 mt-1">
            {selectedTeam && teams.find(t => t._id === selectedTeam)?.name} 
            {selectedTeam && selectedCategory && ' • '}
            {selectedCategory && selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Name Input */}
          <div className="space-y-1">
              <label className="block text-sm font-medium text-[#2E2E2E]">Participant Name</label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="Enter full name"
                required
                className={`w-full border-2 px-4 py-3 rounded-lg focus:outline-none transition-all ${
                  nameError 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-200 focus:border-[#12CBC4]'
                }`}
              />
              {nameError && (
                <p className="text-red-500 text-sm mt-1">{nameError}</p>
              )}
            </div>
            
          {/* Global Team Selector */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#2E2E2E]">Team</label>
            <select
              value={selectedTeam}
              onChange={(e) => {
                setSelectedTeam(e.target.value);
                setNameError(''); // Clear name error when team changes
              }}
              className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:border-[#12CBC4] transition-all appearance-none bg-white"
            >
              <option value="">Select Team</option>
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          {/* Global Category Selector */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#2E2E2E]">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setNameError(''); // Clear name error when category changes
              }}
              className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:border-[#12CBC4] transition-all appearance-none bg-white"
            >
              <option value="">Select Category</option>
              <option value="bzone">B-Zone</option>
              <option value="czone">C-Zone</option>
              <option value="yzone">Y-Zone</option>
              <option value="general">General</option>
            </select>
          </div>

          

          <button
            type="submit"
            disabled={isSubmitting || !name || !selectedTeam || !selectedCategory || nameError}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#12CBC4] hover:bg-[#0fa9a3] hover:shadow-md'
            } ${
              !name || !selectedTeam || !selectedCategory || nameError ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Registering...' : 'Register Participant'}
          </button>

          {statusMessage.text && (
            <div className={`p-3 rounded-lg ${
              statusMessage.type === 'error' 
                ? 'bg-red-100 text-red-800 border-l-4 border-red-500' 
                : 'bg-green-100 text-green-800 border-l-4 border-green-500'
            }`}>
              {statusMessage.text}
            </div>
          )}
        </form>

        <div className="bg-gray-50 px-6 py-4 text-center">
          <Link href="/registeredParticipants" className="text-sm text-gray-600">
            <span className="text-[#FF6B6B] font-medium">View Participants</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ParticipantForm;