
import type { Player, FormationStats, IdealTeamPlayer, Position, IdealTeamSlot, PlayerCard, PlayerPerformance } from './types';
import { calculateAverage, calculateStats } from './utils';

type CandidatePlayer = {
  player: Player;
  card: PlayerCard;
  average: number; // The highest average rating for this card, for a specific position.
  position: Position; // The position where the average was achieved.
  performance: PlayerPerformance;
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
  
  // 1. Create a flat list of all possible player-card-position combinations.
  const allPlayerCandidates: CandidatePlayer[] = players.flatMap(player =>
    (player.cards || []).flatMap(card => {
      const positionsWithRatings = Object.keys(card.ratingsByPosition || {}) as Position[];
      
      const cardPerformance = (() => {
          let allRatings: number[] = [];
          const highPerfPositions = new Set<Position>();
           for (const pos of positionsWithRatings) {
                const ratings = card.ratingsByPosition![pos];
                if (ratings && ratings.length > 0) {
                  const avg = calculateAverage(ratings);
                   if (avg >= 7.5) highPerfPositions.add(pos);
                  allRatings = allRatings.concat(ratings);
                }
            }
            const stats = calculateStats(allRatings);
            const recentRatings = allRatings.slice(-3);
            const recentStats = calculateStats(recentRatings);
            
            return {
                stats,
                isHotStreak: stats.matches >= 3 && recentStats.average > stats.average + 0.5,
                isConsistent: stats.matches >= 5 && stats.stdDev < 0.5,
                isPromising: stats.matches < 5 && stats.average >= 8.0,
                isVersatile: highPerfPositions.size >= 3,
            };
      })();

      return positionsWithRatings.map(pos => {
        const ratings = card.ratingsByPosition![pos]!;
        if (ratings.length === 0) return null;
        
        return {
          player,
          card,
          position: pos,
          average: calculateAverage(ratings),
          performance: cardPerformance,
        };
      }).filter((p): p is CandidatePlayer => p !== null);
    })
  );

  const usedPlayerIds = new Set<string>();
  const newTeam: IdealTeamSlot[] = [];

  const createTeamPlayer = (player: CandidatePlayer | undefined, assignedPosition: Position): IdealTeamPlayer | null => {
      if (!player) return null;
      return {
          player: player.player,
          card: player.card,
          position: assignedPosition,
          average: player.average, // Average is already for this position
          performance: player.performance,
      }
  }

  const findBestPlayer = (candidates: CandidatePlayer[]): CandidatePlayer | undefined => {
      return candidates.find(p => !usedPlayerIds.has(p.player.id) && !discardedCardIds.has(p.card.id));
    };

  // 2. Iterate through each required slot in the formation to select STARTERS first.
  formation.slots.forEach((slot) => {
    const hasStylePreference = slot.styles && slot.styles.length > 0;
    
    let eligibleCandidates: CandidatePlayer[];
    
    // Filter candidates for the specific position and optionally by style.
    eligibleCandidates = allPlayerCandidates.filter(p => {
      const positionMatch = p.position === slot.position;
      const styleMatch = !hasStylePreference || slot.styles!.includes(p.card.style);
      return positionMatch && styleMatch;
    });

    // Sort by the average IN THAT SPECIFIC POSITION. This is crucial.
    eligibleCandidates.sort((a, b) => b.average - a.average);

    const starter = findBestPlayer(eligibleCandidates);
    
    if (starter) {
      usedPlayerIds.add(starter.player.id); // Mark player as used.
    }
    
    // Temporarily store the starter and the pool of candidates for substitutes.
    newTeam.push({
      starter: createTeamPlayer(starter, slot.position),
      substitute: null, // Will be filled in the next loop.
      _candidatePool: eligibleCandidates, // Store for sub selection.
    } as any);
  });
  
  // 3. Iterate again to select SUBSTITUTES, ensuring no player is picked twice.
  newTeam.forEach(slot => {
    const candidatePool = (slot as any)._candidatePool as CandidatePlayer[];
    
    // Define substitute priority groups from the remaining candidates.
    const hotStreaks = candidatePool.filter(p => p.performance.isHotStreak);
    const promises = candidatePool.filter(p => p.performance.stats.matches < 10);
    const experienced = candidatePool.filter(p => p.performance.stats.matches >= 10);
    
    let substitute = findBestPlayer(hotStreaks);
    if (!substitute) {
        substitute = findBestPlayer(promises);
    }
    if (!substitute) {
        substitute = findBestPlayer(candidatePool); // Fallback to any remaining player.
    }

    if (substitute) {
      usedPlayerIds.add(substitute.player.id); // Mark substitute as used.
    }

    slot.substitute = createTeamPlayer(substitute, slot.starter!.position);

    // Clean up temporary property.
    delete (slot as any)._candidatePool;
  });


  // 4. Fill any empty slots with placeholders.
  const placeholderPerformance: PlayerPerformance = {
        stats: { average: 0, matches: 0, stdDev: 0 },
        isHotStreak: false, isConsistent: false, isPromising: false, isVersatile: false
  };

  return newTeam.map((slot, index) => ({
      starter: slot.starter || {
          player: { id: `placeholder-S-${index}`, name: `Vacante`, cards: [] },
          card: { id: `placeholder-card-S-${index}`, name: 'N/A', style: 'Ninguno', ratingsByPosition: {} },
          position: formation.slots[index].position,
          average: 0,
          performance: placeholderPerformance
      },
      substitute: slot.substitute || {
           player: { id: `placeholder-SUB-${index}`, name: `Vacante`, cards: [] },
          card: { id: `placeholder-card-SUB-${index}`, name: 'N/A', style: 'Ninguno', ratingsByPosition: {} },
          position: formation.slots[index].position,
          average: 0,
          performance: placeholderPerformance
      }
  }));
}
