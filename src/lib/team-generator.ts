
import type { Player, FormationStats, IdealTeamPlayer, Position, IdealTeamSlot, PlayerCard } from './types';
import { calculateAverage } from './utils';

type CandidatePlayer = {
  player: Player;
  card: PlayerCard;
  average: number; // The highest average rating for this card, regardless of position
  position: Position; // The position where the highest average was achieved
};


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
  
  // 1. Create a flat list of all possible player-card combinations with their best performance.
  const allPlayerCandidates: CandidatePlayer[] = players.flatMap(player =>
    (player.cards || []).map(card => {
      let bestAvg = -1;
      let bestPos: Position | null = null;
      
      const positionsWithRatings = Object.keys(card.ratingsByPosition || {}) as Position[];

      if (positionsWithRatings.length === 0) return null;

      for (const pos of positionsWithRatings) {
        const ratings = card.ratingsByPosition![pos];
        if (ratings && ratings.length > 0) {
          const avg = calculateAverage(ratings);
          if (avg > bestAvg) {
            bestAvg = avg;
            bestPos = pos;
          }
        }
      }

      if (bestPos === null) return null;

      return {
        player,
        card,
        average: bestAvg,
        position: bestPos,
      };
    }).filter((p): p is CandidatePlayer => p !== null)
  );

  const usedCardIds = new Set<string>();
  const newTeam: IdealTeamSlot[] = [];

  const createTeamPlayer = (player: CandidatePlayer | undefined, assignedPosition: Position, hasStylePreference: boolean): IdealTeamPlayer | null => {
      if (!player) return null;

      // If styles were specified, the average is the player's best overall.
      // If not, we MUST calculate the average for the specific slot position.
      const average = hasStylePreference
          ? player.average
          : calculateAverage(player.card.ratingsByPosition![assignedPosition]!);

      return {
          ...player,
          position: assignedPosition, // The position is the one from the formation slot
          average: average,
      }
  }

  // 2. Iterate through each required slot in the formation.
  formation.slots.forEach((slot, index) => {
    
    const hasStylePreference = slot.styles && slot.styles.length > 0;
    
    let eligibleCandidates: CandidatePlayer[];

    if (hasStylePreference) {
      // Filter by style and sort by the candidate's best overall average.
      eligibleCandidates = allPlayerCandidates
        .filter(p => slot.styles!.includes(p.card.style))
        .sort((a, b) => b.average - a.average);
    } else {
      // Filter by position and sort by the average IN THAT SPECIFIC POSITION.
      eligibleCandidates = allPlayerCandidates
        .filter(p => p.card.ratingsByPosition?.[slot.position] && p.card.ratingsByPosition[slot.position]!.length > 0)
        .sort((a, b) => {
            const avgA = calculateAverage(a.card.ratingsByPosition![slot.position]!);
            const avgB = calculateAverage(b.card.ratingsByPosition![slot.position]!);
            return avgB - avgA;
        });
    }

    const findBestPlayer = (candidates: CandidatePlayer[]): CandidatePlayer | undefined => {
      return candidates.find(p => !usedCardIds.has(p.card.id));
    };

    // 3. Find the best available player for the starter.
    const starter = findBestPlayer(eligibleCandidates);
    
    if (starter) {
      usedCardIds.add(starter.card.id); // Mark starter card as used
    }
    
    // 4. Find the best available player for the substitute.
    const substitute = findBestPlayer(eligibleCandidates);

    if (substitute) {
      usedCardIds.add(substitute.card.id); // Mark substitute card as used
    }
    
    // 5. Add the pair (or placeholders) to the team.
    newTeam.push({
        starter: createTeamPlayer(starter, slot.position, hasStylePreference) || {
            player: { id: `placeholder-S-${slot.position}-${index}`, name: `Vacante`, cards: [] },
            card: { id: `placeholder-card-S-${slot.position}-${index}`, name: 'N/A', style: 'Ninguno', ratingsByPosition: {} },
            position: slot.position,
            average: 0,
        },
        substitute: createTeamPlayer(substitute, slot.position, hasStylePreference) || {
             player: { id: `placeholder-SUB-${slot.position}-${index}`, name: `Vacante`, cards: [] },
            card: { id: `placeholder-card-SUB-${slot.position}-${index}`, name: 'N/A', style: 'Ninguno', ratingsByPosition: {} },
            position: slot.position,
            average: 0,
        }
    });
  });
  
  return newTeam;
}
