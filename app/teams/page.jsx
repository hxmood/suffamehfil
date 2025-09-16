'use client';

import { useState } from 'react';

export default function AddTeamsForm() {
  const [teams, setTeams] = useState(['', '', '']);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (index, value) => {
    const updatedTeams = [...teams];
    updatedTeams[index] = value;
    setTeams(updatedTeams);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);
    
    try {
      for (const name of teams) {
        if (name.trim() === '') continue;

        const res = await fetch('/api/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(prev => prev + `❌ ${name}: ${data.error}\n`);
        } else {
          setMessage(prev => prev + `✅ ${name}: Added successfully\n`);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-[#FF6B6B] p-6 text-center">
          <h2 className="text-2xl font-bold text-white">Register Your Teams</h2>
          <p className="text-white opacity-90 mt-1">Create the three competing teams for the fest</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {teams.map((team, index) => (
            <div key={index} className="relative">
              <input
                type="text"
                placeholder={`Team ${index + 1} Name`}
                value={team}
                onChange={(e) => handleChange(index, e.target.value)}
                className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:border-[#12CBC4] transition-all"
                required
              />
              <span className="absolute right-3 top-3.5 bg-[#FFC312] text-[#2E2E2E] text-xs font-bold px-2 py-0.5 rounded-full">
                #{index + 1}
              </span>
            </div>
          ))}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#12CBC4] hover:bg-[#0fa9a3] hover:shadow-md'
            }`}
          >
            {isSubmitting ? 'Registering...' : 'Register Teams'}
          </button>
        </form>

        {message && (
          <div className="px-6 pb-6">
            <div className="bg-gray-100 p-4 rounded-lg border-l-4 border-[#FF6B6B]">
              <h3 className="font-bold text-[#2E2E2E] mb-2">Registration Status</h3>
              <pre className="whitespace-pre-wrap text-sm text-[#2E2E2E]">{message}</pre>
            </div>
          </div>
        )}

        <div className="bg-gray-50 px-6 py-4 text-center">
          <p className="text-sm text-gray-600">
            Need help? <span className="text-[#FF6B6B] font-medium">Contact support</span>
          </p>
        </div>
      </div>
    </div>
  );
}