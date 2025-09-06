
'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';

export default function Step2({ params }) {
  const { roundId } = use(params);
  const { data: session } = useSession();
  const [previews, setPreviews] = useState([]);
  const [locked, setLocked] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function fetchPreviews() {
      const res = await fetch(`/api/rounds/${roundId}/reveal`);
      const data = await res.json();
      // Only show label and content, hide tool mapping
      setPreviews((data.previews || []).map(p => ({ label: p.label, content: p.content })));
    }
    async function fetchVote() {
      const res = await fetch(`/api/rounds/${roundId}/vote`);
      const data = await res.json();
      if (data.vote) {
        setLocked(true);
        setSelected(data.vote.previewLabel);
      }
    }
    fetchPreviews();
    fetchVote();
  }, [roundId]);

  const handleVote = async (label) => {
    if (locked) return;
    const res = await fetch(`/api/rounds/${roundId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ previewLabel: label }),
    });
    if (res.ok) {
      setLocked(true);
      setSelected(label);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-6xl w-full text-center">
        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          VibeBet Round #{roundId.slice(-6)}
        </h1>
        <h2 className="text-3xl font-bold mb-6 text-gray-200">🗳️ STEP 2: Vote on Previews</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Four mystery previews await! Vote for the one you think is the best. 
          <br />The mapping to tools (D, V, B, L) is hidden until the final reveal!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {previews.map((preview) => (
            <div key={preview.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition duration-300">
              <div className="mb-4">
                <div className="text-4xl font-bold text-yellow-400 mb-2">
                  Preview {preview.label}
                </div>
                <div className="h-32 bg-gray-800/50 rounded-lg flex items-center justify-center mb-4 border border-gray-600">
                  <div className="text-gray-300 text-center">
                    {preview.content || `Preview ${preview.label} content will be shown here`}
                  </div>
                </div>
              </div>
              
              <button
                className={`w-full px-6 py-4 rounded-lg text-xl font-bold transition-all duration-300 transform hover:scale-105 ${
                  selected === preview.label
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50'
                    : locked
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg'
                }`}
                disabled={locked}
                onClick={() => handleVote(preview.label)}
              >
                {selected === preview.label ? '✅ VOTED' : '🗳️ Vote for This'}
              </button>
            </div>
          ))}
        </div>

        {locked && (
          <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-6 border border-green-400/30 mb-6">
            <div className="text-2xl mb-2">✅ Vote Cast!</div>
            <p className="text-lg text-green-200">
              You voted for: <span className="font-bold text-yellow-400">Preview {selected}</span>
            </p>
            <p className="text-gray-300 mt-2">
              Wait for the final reveal to see if your choice matches your Step 1 prediction!
            </p>
            <div className="mt-4 flex gap-4 justify-center">
              <Link 
                href={`/rounds/${roundId}/step-3`}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition duration-200 shadow-lg"
              >
                📊 Continue to Step 3: Results
              </Link>
              <Link 
                href={`/rounds/${roundId}/final`}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-black rounded-lg font-bold hover:from-yellow-600 hover:to-orange-700 transition duration-200 shadow-lg"
              >
                🏆 View Final Results
              </Link>
            </div>
          </div>
        )}

        {!locked && (
          <div className="bg-purple-500/20 backdrop-blur-sm rounded-lg p-4 border border-purple-400/30">
            <p className="text-purple-200">
              💡 Vote carefully! The identity of each preview is hidden until the final reveal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
