
import type { Player, FormationStats, IdealTeamPlayer, Position } from './types';
import { calculateAverage } from './utils';

/**
 * Generates the ideal team based on a given formation and a list of available players.
 * 
 * @param players - The list of all available players.
 * @param formation - The selected formation with defined slots (position and required styles).
 * @returns An array of 11 players (or placeholders) that best fit the formation.
 */
export function generateIdealTeam(
  players: Player[],
  formation: FormationStats
): (IdealTeamPlayer | null)[] {
  // 1. Create a flat list of all possible player-card-position combinations with their average rating.
  // This list represents every single "version" of a player you could field.
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
  const newTeam: (IdealTeamPlayer | null)[] = [];

  // 2. Iterate through each required slot in the formation.
  formation.slots.forEach((slot, index) => {
    // 3. Find the best available player for that specific slot.
    // It finds the first player in the pre-sorted list that matches the criteria.
    const bestPlayerForSlot = allRatedPlayers.find(p => 
      !usedCardIds.has(p.card.id) && // Card is not already in the team
      p.position === slot.position && // Player matches the position
      (slot.styles.length === 0 || slot.styles.includes(p.card.style)) // Player's style is in the allowed list, or any style is allowed
    );

    if (bestPlayerForSlot) {
      usedCardIds.add(bestPlayerForSlot.card.id); // Mark card as used
      newTeam.push(bestPlayerForSlot);
    } else {
      // 4. If no player is found, add a placeholder.
      newTeam.push({
        player: { id: `placeholder-${slot.position}-${index}`, name: `Vacante`, cards: [] },
        card: { id: `placeholder-card-${slot.position}-${index}`, name: 'N/A', style: 'Ninguno', ratingsByPosition: {} },
        position: slot.position,
        average: 0,
      });
    }
  });
  
  return newTeam;
}
