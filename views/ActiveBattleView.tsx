import React, { useState, useEffect, useRef } from 'react';
import { BattlePokemon, Move } from '../types';
import { HPBar } from '../components/HPBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PartyStatusDisplay } from '../components/PartyStatusDisplay';

type PlayerAction = 'awaiting_input' | 'selecting_move' | 'selecting_switch' | 'must_switch';

interface ActiveBattleViewProps {
  playerTeam: BattlePokemon[];
  opponentTeam: BattlePokemon[];
  activePlayerIndex: number;
  activeOpponentIndex: number;
  battleLog: string[];
  onMoveSelect: (move: Move) => void;
  isProcessingTurn: boolean;
  winner: string | null;
  playerAction: PlayerAction;
  setPlayerAction: (action: PlayerAction) => void;
  backgroundUrl: string;
}

const PokemonDisplay: React.FC<{ pokemon: BattlePokemon; isPlayer: boolean; tookDamage: boolean }> = ({ pokemon, isPlayer, tookDamage }) => {
    const alignment = isPlayer ? 'items-start' : 'items-end';
    const textAlignment = isPlayer ? 'text-left' : 'text-right';
    
    // Player uses front-facing official art, opponent uses front-facing official art. Player's is flipped.
    const spriteUrl = pokemon.imageUrl;
    const fallbackSprite = isPlayer ? pokemon.backSpriteUrl : pokemon.spriteUrl;

    const handleSpriteError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        if (fallbackSprite) {
          e.currentTarget.src = fallbackSprite;
        }
    };


    return (
        <div className={`flex flex-col ${alignment} gap-2 w-full`}>
            <div className={`bg-gray-800/80 p-3 rounded-lg border border-gray-700 w-full max-w-sm ${textAlignment}`}>
                <div className="flex justify-between font-bold text-lg items-center">
                    <span className="capitalize">{pokemon.name}</span>
                    <div className="flex items-center gap-2">
                        {pokemon.item && <img src={pokemon.item.spriteUrl} alt={pokemon.item.name} title={pokemon.item.name} className="w-5 h-5" />}
                        <span>Lv. 50</span>
                    </div>
                </div>
                <HPBar current={pokemon.currentHp} max={pokemon.maxHp} />
            </div>
            <img 
                src={spriteUrl} 
                alt={pokemon.name}
                onError={handleSpriteError}
                className={`h-40 sm:h-56 object-contain drop-shadow-xl ${isPlayer ? 'self-start transform -scale-x-100' : 'self-end'} ${pokemon.status === 'fainted' ? 'opacity-0 translate-y-5' : ''} transition-all duration-500`}
                style={{ imageRendering: 'pixelated', width: 'auto' }}
            />
        </div>
    );
};


export const ActiveBattleView: React.FC<ActiveBattleViewProps> = ({ 
    playerTeam, 
    opponentTeam,
    activePlayerIndex,
    activeOpponentIndex, 
    battleLog, 
    onMoveSelect, 
    isProcessingTurn, 
    winner,
    playerAction,
    setPlayerAction,
    backgroundUrl
}) => {
  const [playerTookDamage, setPlayerTookDamage] = useState(false);
  const [opponentTookDamage, setOpponentTookDamage] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  const playerPokemon = playerTeam[activePlayerIndex];
  const opponentPokemon = opponentTeam[activeOpponentIndex];

  useEffect(() => {
    if (playerPokemon) {
        setPlayerTookDamage(true);
        setTimeout(() => setPlayerTookDamage(false), 300);
    }
  }, [playerPokemon?.currentHp]);
  
  useEffect(() => {
     if (opponentPokemon) {
        setOpponentTookDamage(true);
        setTimeout(() => setOpponentTookDamage(false), 300);
    }
  }, [opponentPokemon?.currentHp]);

  // Auto-scroll battle log
  useEffect(() => {
    if (logContainerRef.current) {
      const { scrollHeight, clientHeight } = logContainerRef.current;
      logContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, [battleLog]);


  const BattleMenu = () => (
    <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setPlayerAction('selecting_move')} className="p-4 bg-red-600 rounded-lg text-white font-bold hover:bg-red-700 transition-colors">FIGHT</button>
        <button onClick={() => setPlayerAction('selecting_switch')} className="p-4 bg-blue-600 rounded-lg text-white font-bold hover:bg-blue-700 transition-colors">POKéMON</button>
        <button className="p-4 bg-yellow-600 rounded-lg text-white font-bold opacity-50 cursor-not-allowed">ITEM</button>
        <button className="p-4 bg-gray-500 rounded-lg text-white font-bold opacity-50 cursor-not-allowed">RUN</button>
    </div>
  );

  const MoveSelection = () => (
    <div className="grid grid-cols-2 gap-3">
        {playerPokemon.selectedMoves.map(move => (
            <button
                key={move.name}
                onClick={() => onMoveSelect(move)}
                disabled={isProcessingTurn || (move.pp !== undefined && move.pp <= 0)}
                className="p-3 bg-gray-700 rounded-lg text-white font-semibold hover:bg-purple-600 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-wait transition-colors text-center"
            >
                <div>{move.name}</div>
                <div className="text-xs text-gray-400">({move.pp ?? '?'}/{move.maxPp ?? '?'})</div>
            </button>
        ))}
        <button onClick={() => setPlayerAction('awaiting_input')} className="p-3 bg-gray-600 rounded-lg text-white font-semibold hover:bg-gray-500 transition-colors text-center col-span-2">
            &larr; Back
        </button>
    </div>
  );

  return (
    <div className="space-y-4 relative overflow-hidden rounded-lg border border-gray-700 p-4 bg-no-repeat bg-cover bg-center" style={{backgroundImage: `url('${backgroundUrl}')`}}>
        <style>{`
            @keyframes screen-shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
            .animate-shake { animation: screen-shake 0.3s linear; }
            @keyframes log-entry-animation { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-log-entry { animation: log-entry-animation 0.3s ease-out forwards; }
        `}</style>
        
        {/* Top section: Party Status */}
        <div className="absolute top-2 left-2 w-full flex justify-between">
            <PartyStatusDisplay team={playerTeam} activeIndex={activePlayerIndex} isPlayer={true} />
            <PartyStatusDisplay team={opponentTeam} activeIndex={activeOpponentIndex} isPlayer={false} />
        </div>

        {/* Middle Section: Pokémon Display */}
        <div className={`relative h-72 flex justify-between items-end ${(playerTookDamage || opponentTookDamage) && !winner ? 'animate-shake' : ''}`}>
             <div className="absolute left-0 bottom-0 w-2/5">
                <PokemonDisplay pokemon={playerPokemon} isPlayer={true} tookDamage={playerTookDamage}/>
             </div>
             <div className="absolute right-0 top-10 w-2/5">
                <PokemonDisplay pokemon={opponentPokemon} isPlayer={false} tookDamage={opponentTookDamage}/>
             </div>
        </div>
        
        {/* Bottom section: Log and Moves */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-900/70 backdrop-blur-sm p-3 rounded-md border border-gray-600">
            {/* Battle Log */}
            <div ref={logContainerRef} className="bg-gray-800/80 p-4 rounded-lg border border-gray-700 h-48 overflow-y-auto scroll-smooth">
                 <div className="flex flex-col">
                    {battleLog.map((entry, index) => (
                       <p key={index} className={`text-sm py-1 ${entry.startsWith('**') ? 'font-bold text-yellow-300' : 'text-gray-300'} animate-log-entry`}>
                           {entry.replace(/\*\*/g, '')}
                       </p>
                    ))}
                 </div>
            </div>

            {/* Action Panel */}
            <div className="relative">
                 {isProcessingTurn && (
                    <div className="absolute inset-0 bg-black/70 rounded-lg flex flex-col items-center justify-center z-10">
                        <LoadingSpinner />
                        <p className="mt-2 text-gray-300">Opponent is thinking...</p>
                    </div>
                 )}
                {winner ? (
                    <div className="flex items-center justify-center bg-gray-800/80 p-4 rounded-lg border border-gray-700 h-full">
                        <h2 className="text-2xl font-bold text-yellow-400">** {winner === 'player' ? 'You win!' : 'You lose!'} **</h2>
                    </div>
                ) : (
                    <>
                        {playerAction === 'awaiting_input' && <BattleMenu />}
                        {playerAction === 'selecting_move' && <MoveSelection />}
                    </>
                )}
            </div>
        </div>
    </div>
  );
};
