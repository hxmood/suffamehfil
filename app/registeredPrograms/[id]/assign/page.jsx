// app/admin/programs/[id]/assign/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { FiUserPlus, FiX, FiArrowLeft, FiFilter } from "react-icons/fi";

export default function AssignParticipants() {
  const router = useRouter();
  const params = useParams();
  const programId = params.id; // Now properly accessed via useParams()

  const [program, setProgram] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [teams, setTeams] = useState([]);
  const [filters, setFilters] = useState({
    team: "",
    category: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!programId) return; // Ensure programId exists before fetching

    const fetchData = async () => {
      try {
        setLoading(true);

        const [programRes, participantsRes, teamsRes] = await Promise.all([
          axios.get(`/api/programs/${programId}`),
          axios.get(
            `/api/participant?team=${filters.team}&category=${filters.category}`
          ),
          axios.get("/api/teams"),
        ]);

        setProgram(programRes.data);
        setParticipants(participantsRes.data);
        setTeams(teamsRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [programId, filters.team, filters.category]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const isParticipantAssigned = (participantId) => {
    return program?.participants.some(
      (p) =>
        p.participant._id === participantId || p.participant === participantId
    );
  };

  const isTeamAtLimit = (teamId) => {
    if (!program || program.type === "individual") return false;
    return (
      program.participants.filter(
        (p) => p.team?._id === teamId || p.team === teamId
      ).length >= 2
    );
  };

  const handleAssignParticipant = async (participant) => {
    try {
      setError("");
      setSuccess("");

      const response = await axios.post(
        `/api/programs/${programId}/participants`,
        {
          participantId: participant._id,
          teamId: participant.team._id,
        }
      );

      setProgram(response.data.program);
      setSuccess(`${participant.name} assigned successfully!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Assignment error:", err);
      setError(err.response?.data?.error || "Failed to assign participant");
    }
  };

  const handleRemoveParticipant = async (participantId) => {
    try {
      setError("");
      setSuccess("");

      const response = await axios.delete(
        `/api/programs/${programId}/participants/${participantId}`
      );

      setProgram(response.data.program);
      setSuccess("Participant removed successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Removal error:", err);
      setError(err.response?.data?.error || "Failed to remove participant");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push(`/registeredPrograms`)}
            className="flex items-center text-[#FF6B6B] hover:text-[#e05555] transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Program
          </button>
          <h1 className="text-3xl font-bold text-[#2E2E2E] text-center">
            Assign Participants to{" "}
            <span className="text-[#FF6B6B]">{program?.name}</span>
          </h1>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-sm">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg shadow-sm">
            <p>{success}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filters Panel */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-[#12CBC4] p-4 flex items-center">
              <FiFilter className="text-white mr-2" />
              <h2 className="text-lg font-semibold text-white">Filters</h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2E2E2E] mb-2">
                  Team
                </label>
                <select
                  name="team"
                  value={filters.team}
                  onChange={handleFilterChange}
                  className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:border-[#FF6B6B] transition-all"
                >
                  <option value="">All Teams</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2E2E2E] mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:border-[#FF6B6B] transition-all"
                >
                  <option value="">All Categories</option>
                  <option value="bzone">B-Zone</option>
                  <option value="czone">C-Zone</option>
                  <option value="yzone">Y-Zone</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
          </div>

          {/* Available Participants */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-[#FFC312] p-4">
              <h2 className="text-lg font-semibold text-[#2E2E2E]">
                Available Participants
              </h2>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#12CBC4]"></div>
                </div>
              ) : participants.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No participants found matching filters
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {participants.map((participant) => (
                    <li
                      key={participant._id}
                      className={`p-3 rounded-lg border transition-all ${
                        isParticipantAssigned(participant._id)
                          ? "bg-gray-50 border-gray-200"
                          : "bg-white border-gray-200 hover:border-[#FF6B6B] hover:shadow-md"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-[#2E2E2E]">
                            {participant.name}
                          </p>
                          <div className="flex items-center mt-1 space-x-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                participant.team?.name === "Team A"
                                  ? "bg-blue-100 text-blue-800"
                                  : participant.team?.name === "Team B"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {participant.team?.name}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                participant.category === "bzone"
                                  ? "bg-blue-100 text-blue-800"
                                  : participant.category === "czone"
                                  ? "bg-green-100 text-green-800"
                                  : participant.category === "yzone"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {participant.category}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAssignParticipant(participant)}
                          disabled={
                            isParticipantAssigned(participant._id) ||
                            (program?.type === "group" &&
                              isTeamAtLimit(participant.team._id))
                          }
                          className={`p-2 rounded-full transition-colors ${
                            isParticipantAssigned(participant._id)
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : program?.type === "group" &&
                                isTeamAtLimit(participant.team._id)
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-[#12CBC4] text-white hover:bg-[#0fa9a3]"
                          }`}
                          title={
                            isParticipantAssigned(participant._id)
                              ? "Already assigned"
                              : program?.type === "group" &&
                                isTeamAtLimit(participant.team._id)
                              ? "Team limit reached"
                              : "Assign participant"
                          }
                        >
                          <FiUserPlus size={18} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Assigned Participants */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-[#FF6B6B] p-4">
              <h2 className="text-lg font-semibold text-white">
                Assigned Participants ({program?.participants.length || 0})
              </h2>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#12CBC4]"></div>
                </div>
              ) : !program?.participants.length ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No participants assigned yet</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {program.participants.map(({ participant, team }) => (
                    <li
                      key={participant._id}
                      className="p-3 rounded-lg border border-gray-200 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-[#2E2E2E]">
                            {participant.name}
                          </p>
                          <div className="flex items-center mt-1 space-x-2">
                            {team && (
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  team.name === "Team A"
                                    ? "bg-blue-100 text-blue-800"
                                    : team.name === "Team B"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {team.name}
                              </span>
                            )}
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                participant.category === "bzone"
                                  ? "bg-blue-100 text-blue-800"
                                  : participant.category === "czone"
                                  ? "bg-green-100 text-green-800"
                                  : participant.category === "yzone"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {participant.category}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleRemoveParticipant(participant._id)
                          }
                          className="p-2 rounded-full bg-[#FF6B6B] text-white hover:bg-[#e05555] transition-colors"
                          title="Remove participant"
                        >
                          <FiX size={18} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
