
import { BattlePokemon, Move, DamageResult } from "../types";

const LEVEL = 50;

export const calculateDamage = (attacker: BattlePokemon, defender: BattlePokemon, move: Move): DamageResult => {
    if (!move.power || move.damageClass === 'status') {
        return { damage: 0 };
    }

    const attackStat = move.damageClass === 'physical' ? attacker.calculatedStats.attack : attacker.calculatedStats.spAtk;
    const defenseStat = move.damageClass === 'physical' ? defender.calculatedStats.defense : defender.calculatedStats.spDef;

    let damage = Math.floor(
        ( ( ( ( (2 * LEVEL) / 5 ) + 2) * move.power * (attackStat / defenseStat) ) / 50 ) + 2
    );
    
    // Type effectiveness
    let effectivenessMultiplier = 1;
    if (move.type) {
        // The defender.typeEffectiveness object already contains the final calculated multiplier
        // for damage FROM a given type (e.g., from 'fire').
        effectivenessMultiplier = defender.typeEffectiveness[move.type] ?? 1;
    }

    damage = Math.floor(damage * effectivenessMultiplier);

    let effectiveness = '';
    if (effectivenessMultiplier > 1) effectiveness = "It's super effective!";
    if (effectivenessMultiplier < 1 && effectivenessMultiplier > 0) effectiveness = "It's not very effective...";
    if (effectivenessMultiplier === 0) effectiveness = `It doesn't affect ${defender.name}...`;


    // Add some random variance (+/- 15%)
    const randomFactor = (Math.random() * (1 - 0.85) + 0.85);
    damage = Math.floor(damage * randomFactor);

    return { damage, effectiveness, effectivenessMultiplier };
};