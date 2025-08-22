import React from 'react';

interface BattleEndViewProps {
  winner: 'player' | 'opponent';
  onPlayAgain: () => void;
  onReturnToMenu: () => void;
}

export const BattleEndView: React.FC<BattleEndViewProps> = ({ winner, onPlayAgain, onReturnToMenu }) => {
  const message = winner === 'player' ? 'You Win!' : 'You Lose!';
  const gradient = winner === 'player'
    ? 'from-green-500 to-lime-500'
    : 'from-red-600 to-orange-500';

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-20">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-8 text-center">
        <h2 className={`text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}>
          {message}
        </h2>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={onPlayAgain}
            className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={onReturnToMenu}
            className="w-full px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
          >
            Return to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};