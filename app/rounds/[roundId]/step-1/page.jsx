'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';

const choices = ['D', 'V', 'B', 'L'];

export default function Step1({ params }) {
  const { roundId } = use(params);
  const { data: session } = useSession();
  const [locked, setLocked] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function fetchGuess() {
      const res = await fetch(`/api/rounds/${roundId}/guess`);
      const data = await res.json();
      if (data.guess) {
        setLocked(true);
        setSelected(data.guess.choice);
      }
    }
    fetchGuess();
  }, [roundId]);

  const handleGuess = async (choice) => {
    if (locked) return;
    const res = await fetch(`/api/rounds/${roundId}/guess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ choice }),
    });
    if (res.ok) {
      setLocked(true);
      setSelected(choice);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
          VibeBet Round #{roundId.slice(-6)}
        </h1>
        <h2 className="text-3xl font-bold mb-6 text-gray-200">🎯 STEP 1: Guess the Winner</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Which coding tool will create the most impressive result? Make your prediction now!
        </p>

        {/* Tool Explanation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-3xl mb-2">🚀</div>
            <h3 className="font-bold">Devin (D)</h3>
            <p className="text-sm text-gray-300">AI Software Engineer</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-bold">V0 (V)</h3>
            <p className="text-sm text-gray-300">Vercel's AI Builder</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-bold">Bolt (B)</h3>
            <p className="text-sm text-gray-300">StackBlitz AI</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-3xl mb-2">💝</div>
            <h3 className="font-bold">Lovable (L)</h3>
            <p className="text-sm text-gray-300">AI App Builder</p>
          </div>
        </div>

        {/* Choice Buttons */}
        <div className="flex justify-center gap-6 mb-8">
          {choices.map((choice) => (
            <button
              key={choice}
              className={`px-8 py-6 rounded-xl text-2xl font-bold border-2 transition-all duration-300 transform hover:scale-110 ${
                selected === choice
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400 shadow-lg shadow-green-500/50'
                  : locked
                  ? 'bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed'
                  : 'bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 hover:border-white/50 shadow-lg'
              }`}
              disabled={locked}
              onClick={() => handleGuess(choice)}
            >
              {choice}
            </button>
          ))}
        </div>

        {locked && (
          <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-6 border border-green-400/30 mb-6">
            <div className="text-2xl mb-2">✅ Prediction Locked!</div>
            <p className="text-lg text-green-200">
              You predicted: <span className="font-bold text-yellow-400">{selected}</span>
            </p>
            <p className="text-gray-300 mt-2">
              Wait for the voting phase to begin and see if your prediction wins 100 points!
            </p>
            <div className="mt-4">
              <Link 
                href={`/rounds/${roundId}/step-2`}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-bold hover:from-purple-600 hover:to-pink-700 transition duration-200 shadow-lg"
              >
                🗳️ Continue to Step 2: Vote on Previews
              </Link>
            </div>
          </div>
        )}

        {!locked && (
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-4 border border-blue-400/30">
            <p className="text-blue-200">
              💡 Choose wisely! You can only make one prediction per round.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
