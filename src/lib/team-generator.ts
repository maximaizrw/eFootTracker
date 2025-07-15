
import type { Player, FormationStats, IdealTeamPlayer, Position, IdealTeamSlot } from './types';
import { calculateAverage } from './utils';

/**
 * Generates the ideal team (starters and substitutes) based on a given formation.
 * 
 * @param players - The list of all available players.
 * @param formation - The selected formation with defined slots.
 * @returns An array of 11 slots, each with a starter and a substitute.
 */
export function generateIdealTeam(
  players: Player[],
  formation: FormationStats
): IdealTeamSlot[] {
  // 1. Create a flat list of all possible player-card-position combinations.
  const allRatedPlayers: IdealTeamPlayer[] = players.flatMap(player =>
    (player.cards || []).flatMap(card =>
      Object.keys(card.ratingsByPosition || {}).map(posStr => {
        const position = posStr as Position;
        const ratings = card.ratingsByPosition![position];
        if (!ratings || ratings.length === 0) return null;
        return {
          player,
          card,
          position,
          average: calculateAverage(ratings),
        };
      }).filter((p): p is IdealTeamPlayer => p !== null)
    )
  ).sort((a, b) => b.average - a.average); // Sort once by highest average rating.

  const usedCardIds = new Set<string>();
  const newTeam: IdealTeamSlot[] = [];

  // 2. Iterate through each required slot in the formation.
  formation.slots.forEach((slot, index) => {
    // 3. Find the best available player for the starter.
    const starter = allRatedPlayers.find(p => 
      !usedCardIds.has(p.card.id) &&
      p.position === slot.position &&
      (slot.styles.length === 0 || slot.styles.includes(p.card.style))
    );
    
    if (starter) {
      usedCardIds.add(starter.card.id); // Mark starter card as used
    }
    
    // 4. Find the best available player for the substitute.
    const substitute = allRatedPlayers.find(p =>
      !usedCardIds.has(p.card.id) &&
      p.position === slot.position &&
      (slot.styles.length === 0 || slot.styles.includes(p.card.style))
    );

    if (substitute) {
      usedCardIds.add(substitute.card.id); // Mark substitute card as used
    }

    // 5. Add the pair (or placeholders) to the team.
    newTeam.push({
        starter: starter || {
            player: { id: `placeholder-S-${slot.position}-${index}`, name: `Vacante`, cards: [] },
            card: { id: `placeholder-card-S-${slot.position}-${index}`, name: 'N/A', style: 'Ninguno', ratingsByPosition: {} },
            position: slot.position,
            average: 0,
        },
        substitute: substitute || {
             player: { id: `placeholder-SUB-${slot.position}-${index}`, name: `Vacante`, cards: [] },
            card: { id: `placeholder-card-SUB-${slot.position}-${index}`, name: 'N/A', style: 'Ninguno', ratingsByPosition: {} },
            position: slot.position,
            average: 0,
        }
    });
  });
  
  return newTeam;
}
