import { BattlePokemon, EV, NATURE_MODIFIERS, PokemonStat, Nature } from "../types";

const LEVEL = 50;

// Function to get the base stat value by name
const getBaseStat = (stats: PokemonStat[], name: keyof EV): number => {
    const statNameMap: { [key in keyof EV]: string } = {
        hp: 'hp',
        attack: 'attack',
        defense: 'defense',
        spAtk: 'sp. atk',
        spDef: 'sp. def',
        speed: 'speed',
    };
    const stat = stats.find(s => s.name.toLowerCase() === statNameMap[name]);
    return stat ? stat.value : 0;
};

export const calculateStats = (pokemon: { stats: PokemonStat[], evs: EV, ivs: EV, nature: Nature }): EV => {
    const { stats, evs, ivs, nature } = pokemon;

    const natureMod = NATURE_MODIFIERS[nature];

    // HP calculation
    const baseHp = getBaseStat(stats, 'hp');
    const hp = Math.floor(((2 * baseHp + ivs.hp + Math.floor(evs.hp / 4)) * LEVEL) / 100) + LEVEL + 10;
    
    // Other stats calculation
    const otherStats = (['attack', 'defense', 'spAtk', 'spDef', 'speed'] as const).reduce((acc, statName) => {
        const base = getBaseStat(stats, statName);
        let natureMultiplier = 1.0;
        if (natureMod) {
            if (natureMod.increase === statName) natureMultiplier = 1.1;
            if (natureMod.decrease === statName) natureMultiplier = 0.9;
        }
        
        const statValue = Math.floor((Math.floor(((2 * base + ivs[statName] + Math.floor(evs[statName] / 4)) * LEVEL) / 100) + 5) * natureMultiplier);
        acc[statName] = statValue;
        return acc;
    }, {} as Omit<EV, 'hp'>);

    return {
        hp,
        ...otherStats,
    } as EV;
};