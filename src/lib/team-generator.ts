
import type { Player, FormationStats, IdealTeamPlayer, Position, IdealTeamSlot, PlayerCard, PlayerPerformance } from './types';
import { calculateAverage, calculateStats } from './utils';

type CandidatePlayer = {
  player: Player;
  card: PlayerCard;
  average: number; // The highest average rating for this card, regardless of position
  position: Position; // The position where the highest average was achieved
  performance: PlayerPerformance; // The performance object for this card
};


/**
 * Generates the ideal team (starters and substitutes) based on a given formation.
 * 
 * @param players - The list of all available players.
 * @param formation - The selected formation with defined slots.
 * @param discardedCardIds - A set of card IDs to exclude from the selection.
 * @returns An array of 11 slots, each with a starter and a substitute.
 */
export function generateIdealTeam(
  players: Player[],
  formation: FormationStats,
  discardedCardIds: Set<string> = new Set()
): IdealTeamSlot[] {
  
  // 1. Create a flat list of all possible player-card combinations with their best performance.
  const allPlayerCandidates: CandidatePlayer[] = players.flatMap(player =>
    (player.cards || []).map(card => {
      let bestAvg = -1;
      let bestPos: Position | null = null;
      
      const positionsWithRatings = Object.keys(card.ratingsByPosition || {}) as Position[];

      if (positionsWithRatings.length === 0) return null;

      let allRatings: number[] = [];
      const highPerfPositions = new Set<Position>();

      for (const pos of positionsWithRatings) {
        const ratings = card.ratingsByPosition![pos];
        if (ratings && ratings.length > 0) {
          const sum = ratings.reduce((a, b) => a + b, 0);
          const avg = sum / ratings.length;
           if (avg >= 7.5) {
            highPerfPositions.add(pos);
           }
          if (avg > bestAvg) {
            bestAvg = avg;
            bestPos = pos;
          }
          allRatings = allRatings.concat(ratings);
        }
      }

      if (bestPos === null) return null;

      // Calculate performance based on overall card ratings
      const stats = calculateStats(allRatings);
      const recentRatings = allRatings.slice(-3);
      const recentStats = calculateStats(recentRatings);
      
      const performance: PlayerPerformance = {
          stats,
          isHotStreak: stats.matches >= 3 && recentStats.average > stats.average + 0.5,
          isConsistent: stats.matches >= 5 && stats.stdDev < 0.5,
          isPromising: stats.matches < 5 && stats.average >= 8.0,
          isVersatile: highPerfPositions.size >= 3,
      };

      return {
        player,
        card,
        average: bestAvg,
        position: bestPos,
        performance,
      };
    }).filter((p): p is CandidatePlayer => p !== null)
  );

  const usedCardIds = new Set<string>();
  const newTeam: IdealTeamSlot[] = [];

  const createTeamPlayer = (player: CandidatePlayer | undefined, assignedPosition: Position): IdealTeamPlayer | null => {
      if (!player) return null;
      
      const averageInPosition = calculateAverage(player.card.ratingsByPosition![assignedPosition] ?? []);

      // If the player has no ratings in the assigned position, something is wrong with the selection logic.
      // However, we should still show the best average to avoid confusion.
      const displayAverage = averageInPosition > 0 ? averageInPosition : player.average;

      return {
          player: player.player,
          card: player.card,
          position: assignedPosition, // The position is the one from the formation slot
          average: displayAverage,
          performance: player.performance,
      }
  }
  
  const createTeamPlayerByStyle = (player: CandidatePlayer | undefined, assignedPosition: Position): IdealTeamPlayer | null => {
      if (!player) return null;
      // When selected by style, the average shown is the player's best overall average.
      return {
          player: player.player,
          card: player.card,
          position: assignedPosition,
          average: player.average,
          performance: player.performance,
      }
  }


  // 2. Iterate through each required slot in the formation.
  formation.slots.forEach((slot, index) => {
    
    const hasStylePreference = slot.styles && slot.styles.length > 0;
    
    let eligibleCandidates: CandidatePlayer[];
    let createFn: (player: CandidatePlayer | undefined, assignedPosition: Position) => IdealTeamPlayer | null;


    if (hasStylePreference) {
      // Filter by style and sort by the candidate's best overall average.
      eligibleCandidates = allPlayerCandidates
        .filter(p => slot.styles!.includes(p.card.style))
        .sort((a, b) => b.average - a.average);
      createFn = createTeamPlayerByStyle;
    } else {
      // Filter by position and sort by the average IN THAT SPECIFIC POSITION.
      eligibleCandidates = allPlayerCandidates
        .filter(p => p.card.ratingsByPosition?.[slot.position] && p.card.ratingsByPosition[slot.position]!.length > 0)
        .sort((a, b) => {
            const avgA = calculateAverage(a.card.ratingsByPosition![slot.position]!);
            const avgB = calculateAverage(b.card.ratingsByPosition![slot.position]!);
            if (avgB !== avgA) {
              return avgB - avgA;
            }
            // As a tie-breaker, prefer the player with more matches in that position
            return (b.card.ratingsByPosition![slot.position]!.length || 0) - (a.card.ratingsByPosition![slot.position]!.length || 0);
        });
      createFn = createTeamPlayer;
    }

    const findBestPlayer = (candidates: CandidatePlayer[]): CandidatePlayer | undefined => {
      return candidates.find(p => !usedCardIds.has(p.card.id) && !discardedCardIds.has(p.card.id));
    };

    // 3. Find the best available player for the starter.
    const starter = findBestPlayer(eligibleCandidates);
    
    if (starter) {
      usedCardIds.add(starter.card.id); // Mark starter card as used
    }
    
    // 4. Find the best available player for the substitute, giving priority to promises.
    const promises = eligibleCandidates.filter(p => p.performance.stats.matches < 10);
    const experienced = eligibleCandidates.filter(p => p.performance.stats.matches >= 10);
    
    let substitute = findBestPlayer(promises); // Try to find a promise first
    if (!substitute) {
        substitute = findBestPlayer(experienced); // If no promise, find an experienced player
    }

    if (substitute) {
      usedCardIds.add(substitute.card.id); // Mark substitute card as used
    }
    
    // 5. Add the pair (or placeholders) to the team.
    const placeholderPerformance: PlayerPerformance = {
        stats: { average: 0, matches: 0, stdDev: 0 },
        isHotStreak: false, isConsistent: false, isPromising: false, isVersatile: false
    };

    newTeam.push({
        starter: createFn(starter, slot.position) || {
            player: { id: `placeholder-S-${slot.position}-${index}`, name: `Vacante`, cards: [] },
            card: { id: `placeholder-card-S-${slot.position}-${index}`, name: 'N/A', style: 'Ninguno', ratingsByPosition: {} },
            position: slot.position,
            average: 0,
            performance: placeholderPerformance
        },
        substitute: createFn(substitute, slot.position) || {
             player: { id: `placeholder-SUB-${slot.position}-${index}`, name: `Vacante`, cards: [] },
            card: { id: `placeholder-card-SUB-${slot.position}-${index}`, name: 'N/A', style: 'Ninguno', ratingsByPosition: {} },
            position: slot.position,
            average: 0,
            performance: placeholderPerformance
        }
    });
  });
  
  return newTeam;
}
