'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRound, setNewRound] = useState({
    title: '',
    linkMappings: [
      { linkId: 'LinkA', tool: 'Dualite', url: '', description: '' },
      { linkId: 'LinkB', tool: 'Lovable', url: '', description: '' },
      { linkId: 'LinkC', tool: 'Bolt', url: '', description: '' },
      { linkId: 'LinkD', tool: 'V0', url: '', description: '' }
    ]
  });

  // Check if user is admin
  const isAdmin = session?.user?.email === 'shubhsoch@gmail.com' || session?.user?.email === 'Rohan@dualite.dev';

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/');
      return;
    }
    
    if (!isAdmin) {
      router.push('/');
      return;
    }

    fetchRounds();
  }, [session, status, isAdmin, router]);

  const fetchRounds = () => {
    fetch('/api/admin/rounds')
      .then(res => res.json())
      .then(data => {
        setRounds(data.rounds || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching rounds:', err);
        setLoading(false);
      });
  };

  const createTestRound = async () => {
    try {
      const response = await fetch('/api/admin/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Game - AI Tools Battle',
          linkMappings: [
            { linkId: 'LinkA', tool: 'Dualite', url: 'https://example.com/dualite', description: 'Modern AI assistant' },
            { linkId: 'LinkB', tool: 'Lovable', url: 'https://example.com/lovable', description: 'Full-stack builder' },
            { linkId: 'LinkC', tool: 'Bolt', url: 'https://example.com/bolt', description: 'Quick prototyping tool' },
            { linkId: 'LinkD', tool: 'V0', url: 'https://example.com/v0', description: 'Vercel AI builder' }
          ]
        })
      });

      if (response.ok) {
        alert('Test game created successfully!');
        fetchRounds();
      } else {
        alert('Failed to create test game');
      }
    } catch (error) {
      console.error('Error creating test game:', error);
      alert('Error creating test game');
    }
  };

  const createCustomRound = async () => {
    try {
      const response = await fetch('/api/admin/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRound)
      });

      if (response.ok) {
        alert('Custom game created successfully!');
        setShowCreateForm(false);
        setNewRound({
          title: '',
          linkMappings: [
            { linkId: 'LinkA', tool: 'Dualite', url: '', description: '' },
            { linkId: 'LinkB', tool: 'Lovable', url: '', description: '' },
            { linkId: 'LinkC', tool: 'Bolt', url: '', description: '' },
            { linkId: 'LinkD', tool: 'V0', url: '', description: '' }
          ]
        });
        fetchRounds();
      } else {
        alert('Failed to create custom game');
      }
    } catch (error) {
      console.error('Error creating custom game:', error);
      alert('Error creating custom game');
    }
  };

  const changeRoundStatus = async (roundId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/rounds/${roundId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert(`Game status changed to ${newStatus}`);
        fetchRounds();
      } else {
        alert('Failed to change game status');
      }
    } catch (error) {
      console.error('Error changing game status:', error);
      alert('Error changing game status');
    }
  };

  const deleteRound = async (roundId) => {
    if (!confirm('Are you sure you want to delete this game?')) return;

    try {
      const response = await fetch(`/api/admin/rounds/${roundId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Game deleted successfully');
        fetchRounds();
      } else {
        alert('Failed to delete game');
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Error deleting game');
    }
  };

  const startGame = async (roundId) => {
    try {
      const response = await fetch(`/api/admin/rounds/${roundId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      });

      if (response.ok) {
        alert('Game started! Players can now join and play.');
        fetchRounds();
      } else {
        alert('Failed to start game');
      }
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Error starting game');
    }
  };

  const endGame = async (roundId) => {
    try {
      const response = await fetch(`/api/admin/rounds/${roundId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ended', endedAt: new Date() })
      });

      if (response.ok) {
        alert('Game ended! Points have been calculated. Check the results page.');
        fetchRounds();
      } else {
        alert('Failed to end game');
      }
    } catch (error) {
      console.error('Error ending game:', error);
      alert('Error ending game');
    }
  };

  const updateLinkMapping = (index, field, value) => {
    const updated = [...newRound.linkMappings];
    updated[index][field] = value;
    setNewRound({ ...newRound, linkMappings: updated });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading Admin Dashboard...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400 text-2xl">🚫 Access Denied - Admin Only</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-8 text-center text-white">
          🔧 VibeBet Admin Dashboard
        </h1>
        
        {/* Quick Actions */}
        <div className="mb-8 text-center">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <button
              onClick={createTestRound}
              className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition shadow-lg"
            >
              🚀 Create Test Round
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition shadow-lg"
            >
              {showCreateForm ? '❌ Cancel' : '➕ Create Custom Round'}
            </button>
          </div>
        </div>

        {/* Create Round Form */}
        {showCreateForm && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6 text-white">Create New VibeBet Game</h2>
            
            {/* Round Details */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-200">Game Title:</label>
              <input
                type="text"
                value={newRound.title}
                onChange={(e) => setNewRound({...newRound, title: e.target.value})}
                className="w-full p-3 border rounded-lg bg-gray-800 text-white border-gray-600"
                placeholder="e.g., AI Tools Battle - Frontend Components"
              />
            </div>

            {/* Link Mappings Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {newRound.linkMappings.map((mapping, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                  <h3 className="font-bold mb-3 text-white">{mapping.linkId}</h3>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1 text-gray-300">Tool Mapping:</label>
                    <select
                      value={mapping.tool}
                      onChange={(e) => updateLinkMapping(index, 'tool', e.target.value)}
                      className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600"
                    >
                      <option value="Dualite">Dualite</option>
                      <option value="Lovable">Lovable</option>
                      <option value="Bolt">Bolt</option>
                      <option value="V0">V0</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1 text-gray-300">Description:</label>
                    <textarea
                      value={mapping.description}
                      onChange={(e) => updateLinkMapping(index, 'description', e.target.value)}
                      className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600 h-20"
                      placeholder="Brief description of this option..."
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1 text-gray-300">Demo URL:</label>
                    <input
                      type="url"
                      value={mapping.url}
                      onChange={(e) => updateLinkMapping(index, 'url', e.target.value)}
                      className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={createCustomRound}
              className="w-full px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition shadow-lg"
            >
              🎯 Create Custom Game
            </button>
          </div>
        )}

        {/* Rounds Management */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 text-white">📊 Manage Rounds</h2>
          
          {rounds.length === 0 ? (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🎲</div>
              <p className="text-xl text-gray-300">No rounds created yet</p>
              <p className="text-gray-400 mt-2">Create your first VibeBet round above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {rounds.map(round => (
                <div key={round._id} className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{round.title || `Round #${round._id.slice(-6)}`}</h3>
                      <p className="text-gray-300">Status: <span className={`font-semibold ${round.status === 'ended' ? 'text-red-400' : round.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>{round.status.toUpperCase()}</span></p>
                      {round.prompt && <p className="text-gray-400 mt-2">{round.prompt}</p>}
                      {round.winner && <p className="text-gray-300 mt-2">Winner: <span className="font-bold text-white">{round.winner}</span></p>}
                    </div>
                    <button
                      onClick={() => deleteRound(round._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <button
                      onClick={() => startGame(round._id)}
                      className={`px-4 py-2 rounded font-semibold ${round.status === 'active' ? 'bg-green-600' : round.status === 'waiting' ? 'bg-gray-600 hover:bg-green-500' : 'bg-gray-700'} text-white transition`}
                      disabled={round.status !== 'waiting'}
                    >
                      🚀 Start Game
                    </button>
                    <button
                      onClick={() => endGame(round._id)}
                      className={`px-4 py-2 rounded font-semibold ${round.status === 'ended' ? 'bg-red-600' : round.status === 'active' ? 'bg-gray-600 hover:bg-red-500' : 'bg-gray-700'} text-white transition`}
                      disabled={round.status !== 'active'}
                    >
                      🏁 End Game
                    </button>
                    <button
                      onClick={() => changeRoundStatus(round._id, 'waiting')}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded font-semibold transition"
                    >
                      � Reset
                    </button>
                    <a
                      href={`/game/${round._id}`}
                      className="px-4 py-2 bg-white text-black rounded font-semibold hover:bg-gray-200 transition text-center"
                    >
                      👁️ View Game
                    </a>
                    <a
                      href={`/game/${round._id}/results`}
                      className={`px-4 py-2 rounded font-semibold transition text-center ${
                        round.status === 'ended' 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      📊 Results
                    </a>
                  </div>
                  
                  {/* Link Mappings Information */}
                  {round.linkMappings && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {round.linkMappings.map((mapping, idx) => (
                        <div key={idx} className="bg-gray-800 rounded p-3 border border-gray-600">
                          <p className="font-bold text-white">{mapping.linkId}</p>
                          <p className="text-sm text-gray-300">Tool: {mapping.tool}</p>
                          <p className="text-xs text-gray-400 mt-1">{mapping.description?.substring(0, 30)}...</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <a href="/" className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition">
            🏠 Back to VibeBet Home
          </a>
        </div>
      </div>
    </div>
  );
}
