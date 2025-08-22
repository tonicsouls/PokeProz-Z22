import React, { useState, useCallback, useEffect } from 'react';
import { ErrorMessage } from '../components/ErrorMessage';
import { BattlePokemon, PokemonListItem, Move, AiAction } from '../types';
import { TeamSelectionView } from './TeamSelectionView';
import { BattlePrepView } from './BattlePrepView';
import { ActiveBattleView } from './ActiveBattleView';
import { generateAiAction } from '../services/geminiService';
import { PokemonSwitchView } from './PokemonSwitchView';
import { calculateDamage } from '../utils/damageCalculator';
import { BATTLE_BACKGROUNDS } from '../constants';
import { generateEngineAction } from '../utils/engineLogic';
import { BattleEndView } from './BattleEndView';


type BattleStage = 'selection' | 'prep' | 'active_battle' | 'finished';
type PlayerAction = 'awaiting_input' | 'selecting_move' | 'selecting_switch' | 'must_switch';
type BattleEngine = 'ai' | 'game';

interface BattleArenaViewProps {
    allPokemon: PokemonListItem[];
    navigateTo: (view: 'menu' | 'pokedex') => void;
    onApiError: (message: string) => void;
}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export const BattleArenaView: React.FC<BattleArenaViewProps> = ({ allPokemon, navigateTo, onApiError }) => {
  const [playerTeam, setPlayerTeam] = useState<BattlePokemon[]>([]);
  const [opponentTeam, setOpponentTeam] = useState<BattlePokemon[]>([]);
  
  const [battleStage, setBattleStage] = useState<BattleStage>('selection');
  const [playerAction, setPlayerAction] = useState<PlayerAction>('awaiting_input');
  const [battleEngine, setBattleEngine] = useState<BattleEngine>('ai');

  const [activePlayerPokemonIndex, setActivePlayerPokemonIndex] = useState(0);
  const [activeOpponentPokemonIndex, setActiveOpponentPokemonIndex] = useState(0);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [aiLastAction, setAiLastAction] = useState<'move' | 'switch' | null>(null);

  const [isProcessingTurn, setIsProcessingTurn] = useState<boolean>(false);
  const [battleError, setBattleError] = useState<string | null>(null);
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);
  const [battleBackground, setBattleBackground] = useState<string>(BATTLE_BACKGROUNDS[0]);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audioInstance = new Audio();
    setAudio(audioInstance);
    return () => {
      audioInstance.pause();
      setAudio(null);
    }
  }, []);

  const playCry = useCallback((url: string | null | undefined) => {
    if (audio && url) {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
      audio.src = url;
      audio.play().catch(e => console.error("Audio play failed:", e.message));
    }
  }, [audio]);

  const handleTeamsSelected = (pTeam: BattlePokemon[], oTeam: BattlePokemon[]) => {
      setPlayerTeam(pTeam);
      setOpponentTeam(oTeam);
      setBattleStage('prep');
  };

  const handleTeamUpdate = (updatedTeam: BattlePokemon[], teamType: 'player' | 'opponent') => {
      if (teamType === 'player') {
          setPlayerTeam(updatedTeam);
      } else {
          setOpponentTeam(updatedTeam);
      }
  }

  const handleStartBattle = (engine: BattleEngine) => {
    setBattleEngine(engine);
    const initializedPlayerTeam = playerTeam.map(p => ({ ...p, currentHp: p.maxHp, status: 'ok' as const, selectedMoves: p.selectedMoves.map(m => ({...m, pp: m.maxPp})) }));
    const initializedOpponentTeam = opponentTeam.map(p => ({ ...p, currentHp: p.maxHp, status: 'ok' as const, selectedMoves: p.selectedMoves.map(m => ({...m, pp: m.maxPp})) }));
    setPlayerTeam(initializedPlayerTeam);
    setOpponentTeam(initializedOpponentTeam);

    setActivePlayerPokemonIndex(0);
    setActiveOpponentPokemonIndex(0);
    
    setBattleBackground(BATTLE_BACKGROUNDS[Math.floor(Math.random() * BATTLE_BACKGROUNDS.length)]);
    setBattleLog([`Battle begins between ${initializedPlayerTeam[0].name} and ${initializedOpponentTeam[0].name}!`]);
    setWinner(null);
    setPlayerAction('awaiting_input');
    setBattleStage('active_battle');
    setAiLastAction(null);

    playCry(initializedOpponentTeam[0].cryUrl);
    setTimeout(() => playCry(initializedPlayerTeam[0].cryUrl), 700);
  };

  const addToLog = (message: string) => {
    setBattleLog(prev => [...prev, message]);
  }

  const getOpponentAction = async (opponent: BattlePokemon, player: BattlePokemon, currentOpponentTeam: BattlePokemon[]): Promise<AiAction> => {
    if (battleEngine === 'ai') {
        try {
            return await generateAiAction(opponent, player, currentOpponentTeam, aiLastAction);
        } catch(e: any) {
            onApiError(e.message);
            // Fallback to game engine if AI fails
            addToLog("**AI failed. Using standard engine.**");
            return generateEngineAction(opponent, player);
        }
    } else {
        return generateEngineAction(opponent, player);
    }
  };

  const handlePlayerSwitch = async (pokemonIndex: number, isTurnAction: boolean = false) => {
    const newIndex = pokemonIndex;
    if (newIndex !== -1 && playerTeam[newIndex].status !== 'fainted' && newIndex !== activePlayerPokemonIndex) {
        addToLog(`You withdraw ${playerTeam[activePlayerPokemonIndex].name}.`);
        await sleep(1000);
        setActivePlayerPokemonIndex(newIndex);
        addToLog(`Go, ${playerTeam[newIndex].name}!`);
        playCry(playerTeam[newIndex].cryUrl);
        setPlayerAction('awaiting_input');
        await sleep(1000);

        if (isTurnAction) {
            await handleAiOnlyTurn();
        }
    } else {
        setPlayerAction('awaiting_input');
    }
  }

  const handleFaint = async (faintedTeam: 'player' | 'opponent', updatedPlayerTeam: BattlePokemon[], updatedOpponentTeam: BattlePokemon[]) => {
    if (faintedTeam === 'player') {
      const activePokemon = updatedPlayerTeam[activePlayerPokemonIndex];
      playCry(activePokemon.cryUrl);
      addToLog(`${activePokemon.name} fainted!`);
      await sleep(1000);
      const isWipe = updatedPlayerTeam.every(p => p.status === 'fainted');
      if (isWipe) {
        setWinner('opponent');
        setBattleStage('finished');
      } else {
        setPlayerAction('must_switch');
      }
    } else {
      const activePokemon = updatedOpponentTeam[activeOpponentPokemonIndex];
      playCry(activePokemon.cryUrl);
      addToLog(`The opponent's ${activePokemon.name} fainted!`);
      await sleep(1000);
      const isWipe = updatedOpponentTeam.every(p => p.status === 'fainted');
      if(isWipe) {
        setWinner('player');
        setBattleStage('finished');
      } else {
        await handleAiSwitch(true, updatedOpponentTeam); // Forced switch
      }
    }
  }
  
  const handleAiSwitch = async (isForced: boolean, currentOpponentTeam: BattlePokemon[]) => {
    let newIndex = -1;

    if(isForced) {
        newIndex = currentOpponentTeam.findIndex(p => p.status === 'ok');
    }

    if (newIndex !== -1 && newIndex !== activeOpponentPokemonIndex) {
        if (!isForced) addToLog(`The opponent withdraws ${currentOpponentTeam[activeOpponentPokemonIndex].name}.`);
        await sleep(1000);
        setActiveOpponentPokemonIndex(newIndex);
        addToLog(`The opponent sent out ${currentOpponentTeam[newIndex].name}!`);
        playCry(currentOpponentTeam[newIndex].cryUrl);
        setAiLastAction('switch');
        await sleep(1000);
        return currentOpponentTeam[newIndex];
    }
    return currentOpponentTeam[activeOpponentPokemonIndex];
  }

  const processAction = async (attacker: BattlePokemon, defender: BattlePokemon, move: Move): Promise<{ updatedAttacker: BattlePokemon, updatedDefender: BattlePokemon }> => {
    let updatedAttacker = { ...attacker };
    let updatedDefender = { ...defender };
    
    addToLog(`${updatedAttacker.name} used ${move.name}!`);
    await sleep(500);
    
    const moveIndex = updatedAttacker.selectedMoves.findIndex(m => m.name === move.name);
    if(moveIndex !== -1 && updatedAttacker.selectedMoves[moveIndex].pp !== undefined) {
        updatedAttacker.selectedMoves = updatedAttacker.selectedMoves.map((m, i) => i === moveIndex ? {...m, pp: m.pp! - 1} : m);
    }
    
    const { damage, effectiveness, effectivenessMultiplier } = calculateDamage(updatedAttacker, updatedDefender, move);
    
    // Animate HP bar
    updatedDefender.currentHp = Math.max(0, updatedDefender.currentHp - damage);
    
    // Need to set state here to trigger HP bar animation
    if (attacker.id === playerTeam[activePlayerPokemonIndex].id) {
        setOpponentTeam(prev => prev.map((p,i) => i === activeOpponentPokemonIndex ? updatedDefender : p));
    } else {
        setPlayerTeam(prev => prev.map((p,i) => i === activePlayerPokemonIndex ? updatedDefender : p));
    }
    
    await sleep(800); // Wait for HP animation

    if(effectiveness) {
        const multiplierText = effectivenessMultiplier !== undefined && effectivenessMultiplier !== 1 ? ` (x${effectivenessMultiplier})` : '';
        addToLog(effectiveness + multiplierText);
        await sleep(500);
    }

    if (updatedDefender.currentHp === 0) {
      updatedDefender.status = 'fainted';
    }

    return { updatedAttacker, updatedDefender };
  }
  
  const handleAiOnlyTurn = async () => {
    setIsProcessingTurn(true);
    let player = playerTeam[activePlayerPokemonIndex];
    let opponent = opponentTeam[activeOpponentPokemonIndex];
    
    const opponentAction = await getOpponentAction(opponent, player, opponentTeam);
    setAiLastAction(opponentAction.action);

    if(opponentAction.action === 'move') {
      const aiMove = opponent.selectedMoves.find(m => m.name.toLowerCase() === opponentAction.move.toLowerCase());
      if(aiMove) {
         const { updatedAttacker, updatedDefender } = await processAction(opponent, player, aiMove);
         const newOpponentTeam = opponentTeam.map((p, i) => i === activeOpponentPokemonIndex ? updatedAttacker : p);
         const newPlayerTeam = playerTeam.map((p, i) => i === activePlayerPokemonIndex ? updatedDefender : p);
         setOpponentTeam(newOpponentTeam);
         setPlayerTeam(newPlayerTeam);
         if (updatedDefender.status === 'fainted') {
            await handleFaint('player', newPlayerTeam, newOpponentTeam);
         }
      }
    }
    setIsProcessingTurn(false);
  }

  const handleMoveSelect = async (playerMove: Move) => {
    if (isProcessingTurn) return;

    setIsProcessingTurn(true);
    setBattleError(null);
    setPlayerAction('awaiting_input');
    
    const currentOpponent = opponentTeam[activeOpponentPokemonIndex];
    const currentPlayer = playerTeam[activePlayerPokemonIndex];
    
    const opponentAction = await getOpponentAction(currentOpponent, currentPlayer, opponentTeam);
    setAiLastAction(opponentAction.action);

    if (opponentAction.action === 'switch') {
        const opponentIndexToSwitchTo = opponentTeam.findIndex(p => p.name.toLowerCase() === opponentAction.to.toLowerCase() && p.status !== 'fainted');
        
        if (opponentIndexToSwitchTo !== -1 && opponentIndexToSwitchTo !== activeOpponentPokemonIndex) {
            addToLog(`The opponent withdraws ${currentOpponent.name}.`);
            await sleep(1000);

            setActiveOpponentPokemonIndex(opponentIndexToSwitchTo);
            const newOpponent = opponentTeam[opponentIndexToSwitchTo];
            playCry(newOpponent.cryUrl);
            addToLog(`The opponent sent out ${newOpponent.name}!`);
            await sleep(1000);
            
            const { updatedAttacker, updatedDefender } = await processAction(currentPlayer, newOpponent, playerMove);
            const newPlayerTeam = playerTeam.map((p,i) => i === activePlayerPokemonIndex ? updatedAttacker : p);
            const newOpponentTeam = opponentTeam.map((p,i) => i === opponentIndexToSwitchTo ? updatedDefender : p);
            
            setPlayerTeam(newPlayerTeam);
            setOpponentTeam(newOpponentTeam);

            if (updatedDefender.status === 'fainted') {
                await handleFaint('opponent', newPlayerTeam, newOpponentTeam);
            }
        }
        setIsProcessingTurn(false);
        return;
    }

    const aiMove = currentOpponent.selectedMoves.find(m => m.name.toLowerCase() === opponentAction.move.toLowerCase());
    
    let playerGoesFirst = false;
    const playerMovePriority = playerMove.priority ?? 0;
    const aiMovePriority = aiMove?.priority ?? 0;

    if (playerMovePriority > aiMovePriority) {
        playerGoesFirst = true;
    } else if (aiMovePriority > playerMovePriority) {
        playerGoesFirst = false;
    } else {
        playerGoesFirst = currentPlayer.calculatedStats.speed >= currentOpponent.calculatedStats.speed;
    }

    const firstAttacker = playerGoesFirst ? currentPlayer : currentOpponent;
    const secondAttacker = playerGoesFirst ? currentOpponent : currentPlayer;
    const firstMove = playerGoesFirst ? playerMove : aiMove;
    const secondMove = playerGoesFirst ? aiMove : playerMove;
    
    // First action
    if (!firstMove) {
        setIsProcessingTurn(false);
        return;
    }
    const { updatedAttacker: postFirstAttacker, updatedDefender: postFirstDefender } = await processAction(firstAttacker, secondAttacker, firstMove);
      
    let intermediatePlayerTeam = playerTeam.map((p,i) => {
        if (i === activePlayerPokemonIndex) return playerGoesFirst ? postFirstAttacker : postFirstDefender;
        return p;
    });
    let intermediateOpponentTeam = opponentTeam.map((p,i) => {
        if (i === activeOpponentPokemonIndex) return playerGoesFirst ? postFirstDefender : postFirstAttacker;
        return p;
    });

    if (postFirstDefender.status === 'fainted') {
        await handleFaint(playerGoesFirst ? 'opponent' : 'player', intermediatePlayerTeam, intermediateOpponentTeam);
        setIsProcessingTurn(false);
        return;
    }

    // Second action
    if (!secondMove) {
        setIsProcessingTurn(false);
        return;
    }
    const { updatedAttacker: postSecondAttacker, updatedDefender: postSecondDefender } = await processAction(postFirstDefender, postFirstAttacker, secondMove);
    
    const finalPlayerTeam = intermediatePlayerTeam.map((p, i) => {
        if(i === activePlayerPokemonIndex) return playerGoesFirst ? postSecondDefender : postSecondAttacker;
        return p;
    });
    const finalOpponentTeam = intermediateOpponentTeam.map((p, i) => {
        if(i === activeOpponentPokemonIndex) return playerGoesFirst ? postSecondAttacker : postSecondDefender;
        return p;
    });
    
    setPlayerTeam(finalPlayerTeam);
    setOpponentTeam(finalOpponentTeam);
    
    if (postSecondDefender.status === 'fainted') {
        await handleFaint(playerGoesFirst ? 'player' : 'opponent', finalPlayerTeam, finalOpponentTeam);
    }
    
    setIsProcessingTurn(false);
  };
  
  const resetBattle = () => {
    setPlayerTeam([]);
    setOpponentTeam([]);
    setBattleLog([]);
    setWinner(null);
    setBattleError(null);
    setBattleStage('selection');
  }
  
  const renderContent = () => {
    switch (battleStage) {
      case 'selection':
        return <TeamSelectionView allPokemon={allPokemon} onTeamsSelected={handleTeamsSelected} onApiError={onApiError} />;
      case 'prep':
        return <BattlePrepView playerTeam={playerTeam} opponentTeam={opponentTeam} onStartBattle={handleStartBattle} onTeamUpdate={handleTeamUpdate} onApiError={onApiError} />;
      case 'active_battle':
      case 'finished':
         if (playerAction === 'must_switch' || playerAction === 'selecting_switch') {
             return <PokemonSwitchView team={playerTeam} activeIndex={activePlayerPokemonIndex} onSelect={(index) => handlePlayerSwitch(index, playerAction !== 'must_switch')} onCancel={() => playerAction !== 'must_switch' && setPlayerAction('awaiting_input')} isForced={playerAction === 'must_switch'}/>
         }
        return (
            <div className="w-full max-w-5xl mx-auto relative">
                {battleError && <ErrorMessage message={battleError} />}
                <ActiveBattleView 
                    playerTeam={playerTeam}
                    opponentTeam={opponentTeam}
                    activePlayerIndex={activePlayerPokemonIndex}
                    activeOpponentIndex={activeOpponentPokemonIndex}
                    battleLog={battleLog}
                    onMoveSelect={handleMoveSelect}
                    isProcessingTurn={isProcessingTurn}
                    winner={winner}
                    playerAction={playerAction}
                    setPlayerAction={setPlayerAction}
                    backgroundUrl={battleBackground}
                />
                {battleStage === 'finished' && winner && (
                  <BattleEndView winner={winner} onPlayAgain={resetBattle} onReturnToMenu={() => navigateTo('menu')} />
                )}
            </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        <header className="text-center mb-8 relative">
            <button onClick={() => battleStage === 'selection' ? navigateTo('menu') : resetBattle()} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                &larr; {battleStage === 'selection' ? 'Main Menu' : 'Reset Battle'}
            </button>
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                Battle Arena
            </h1>
            <p className="text-gray-400 mt-2">
                {battleStage === 'selection' && 'Build your team and face your opponent.'}
                {battleStage === 'prep' && 'Configure your team for the upcoming battle.'}
                {(battleStage === 'active_battle' || battleStage === 'finished') && 'The battle is on!'}
            </p>
        </header>

        <main>
            {renderContent()}
        </main>
    </div>
  );
};
