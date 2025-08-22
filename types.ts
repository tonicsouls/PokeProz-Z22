export interface PokemonStat {
  name: string;
  value: number;
}

export interface Move {
  name: string;
  pp?: number;
  maxPp?: number;
  power?: number | null;
  type?: string;
  damageClass?: 'physical' | 'special' | 'status';
  priority?: number;
}

export interface DetailedMove extends Move {
    learnMethod: string;
    level: number;
}

export interface PokedexEntry {
    version: string;
    text: string;
}

export interface Evolution {
    name: string;
    id: number;
    spriteUrl: string;
}

export interface EvolutionStage {
    pokemon: Evolution;
    evolvesTo: EvolutionStage[];
}

export interface TypeEffectiveness {
    [type: string]: number; // e.g., { "fire": 0.5, "water": 2, "grass": 0.25 }
}

// This is the full, detailed object for the Pokedex view
export interface DetailedPokemon {
  id: number;
  name: string;
  imageUrl: string;
  shinyImageUrl: string;
  spriteUrl: string;
  types: string[];
  height: number; // in decimetres
  weight: number; // in hectograms
  stats: PokemonStat[];
  abilities: string[];
  cryUrl: string | null;
  pokedexEntries: PokedexEntry[];
  evolutionChain: EvolutionStage | null;
  typeEffectiveness: TypeEffectiveness;
  learnableMoves: DetailedMove[];
}


// A lightweight type for search suggestions
export interface PokemonListItem {
  id: number;
  name: string;
  spriteUrl: string;
}

export const NatureList = [
  'Adamant', 'Bashful', 'Brave', 'Bold', 'Calm', 'Careful', 'Docile', 'Gentle', 'Hardy', 'Hasty',
  'Impish', 'Jolly', 'Lax', 'Lonely', 'Mild', 'Modest', 'Naive', 'Naughty', 'Quiet', 'Quirky',
  'Rash', 'Relaxed', 'Sassy', 'Serious', 'Timid'
] as const;
export type Nature = typeof NatureList[number];

export const NATURE_MODIFIERS: { [key in Nature]?: { increase: keyof EV, decrease: keyof EV } } = {
    Adamant: { increase: 'attack', decrease: 'spAtk' },
    Brave: { increase: 'attack', decrease: 'speed' },
    Lonely: { increase: 'attack', decrease: 'defense' },
    Naughty: { increase: 'attack', decrease: 'spDef' },
    Bold: { increase: 'defense', decrease: 'attack' },
    Impish: { increase: 'defense', decrease: 'spAtk' },
    Lax: { increase: 'defense', decrease: 'spDef' },
    Relaxed: { increase: 'defense', decrease: 'speed' },
    Modest: { increase: 'spAtk', decrease: 'attack' },
    Mild: { increase: 'spAtk', decrease: 'defense' },
    Quiet: { increase: 'spAtk', decrease: 'speed' },
    Rash: { increase: 'spAtk', decrease: 'spDef' },
    Calm: { increase: 'spDef', decrease: 'attack' },
    Careful: { increase: 'spDef', decrease: 'spAtk' },
    Gentle: { increase: 'spDef', decrease: 'defense' },
    Sassy: { increase: 'spDef', decrease: 'speed' },
    Timid: { increase: 'speed', decrease: 'attack' },
    Jolly: { increase: 'speed', decrease: 'spAtk' },
    Hasty: { increase: 'speed', decrease: 'defense' },
    Naive: { increase: 'speed', decrease: 'spDef' },
};


export interface EV {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
}

export interface BattleItem {
    name: string;
    spriteUrl: string;
}

// A type for pokemon in a battle context
export interface BattlePokemon extends Omit<DetailedPokemon, 'pokedexEntries' | 'evolutionChain' | 'learnableMoves' | 'shinyImageUrl'> {
  backSpriteUrl: string | null;
  maxHp: number;
  currentHp: number;
  moveList: Move[]; // All available moves
  selectedMoves: Move[]; // The 4 chosen for battle
  moves: string[]; // For display on the battle card
  evs: EV;
  ivs: EV;
  nature: Nature;
  status: 'ok' | 'fainted';
  item: BattleItem | null;
  calculatedStats: EV;
}

// For pre-configured trainer teams in constants.ts
export interface PresetPokemon {
    name: string;
    item: string;
    nature: Nature;
    evs: EV;
    moves: string[];
}

export interface DamageResult {
    damage: number;
    effectiveness?: string;
    effectivenessMultiplier?: number;
}

export interface TurnResult {
    narration: string;
    playerHpChange: number;
    opponentHpChange: number;
    opponentMove: string;
    winner?: 'player' | 'opponent' | null;
    isCriticalHit?: boolean;
    effectiveness?: string;
}

export type AiAction = {
    action: 'move';
    move: string; // name of the move
} | {
    action: 'switch';
    to: string; // name of the pokemon to switch to
};