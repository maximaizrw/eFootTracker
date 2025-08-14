
import type { Player, FormationStats, IdealTeamPlayer, Position, IdealTeamSlot, PlayerCard, PlayerPerformance } from './types';
import { calculateStats } from './utils';

type CandidatePlayer = {
  player: Player;
  card: PlayerCard;
  average: number;
  position: Position;
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
  
  // 1. Create a flat list of all possible player-card-position combinations, with stats calculated *per position*.
  const allPlayerCandidates: CandidatePlayer[] = players.flatMap(player =>
    (player.cards || []).flatMap(card => {
      const positionsWithRatings = Object.keys(card.ratingsByPosition || {}) as Position[];
      
      // Versatility check - this is the only stat that looks across all positions for a card.
      const highPerfPositions = new Set<Position>();
      for (const p in card.ratingsByPosition) {
          const positionKey = p as Position;
          const posRatings = card.ratingsByPosition[positionKey];
          if (posRatings && posRatings.length > 0) {
              const posAvg = calculateStats(posRatings).average;
              if (posAvg >= 7.5) {
                  highPerfPositions.add(positionKey);
              }
          }
      }
      const isVersatile = highPerfPositions.size >= 3;

      return positionsWithRatings.map(pos => {
        const ratings = card.ratingsByPosition![pos]!;
        if (ratings.length === 0) return null;
        
        const stats = calculateStats(ratings);
        const recentRatings = ratings.slice(-3);
        const recentStats = calculateStats(recentRatings);
        
        const performance: PlayerPerformance = {
            stats,
            isHotStreak: stats.matches >= 3 && recentStats.average > stats.average + 0.5,
            isConsistent: stats.matches >= 5 && stats.stdDev < 0.5,
            isPromising: stats.matches < 5 && stats.average >= 8.0,
            isVersatile: isVersatile, // Versatility is a card-level attribute
        };

        return {
          player,
          card,
          position: pos,
          average: stats.average,
          performance: performance,
        };
      }).filter((p): p is CandidatePlayer => p !== null);
    })
  );

  const usedPlayerIds = new Set<string>();
  const teamSlots: IdealTeamSlot[] = [];

  const createTeamPlayer = (candidate: CandidatePlayer | undefined, assignedPosition: Position): IdealTeamPlayer | null => {
      if (!candidate) return null;
      return {
          player: candidate.player,
          card: candidate.card,
          position: assignedPosition,
          average: candidate.average,
          performance: candidate.performance,
      }
  }

  const findBestPlayer = (candidates: CandidatePlayer[]): CandidatePlayer | undefined => {
      return candidates.find(p => !usedPlayerIds.has(p.player.id) && !discardedCardIds.has(p.card.id));
  };
  
  // Create a type to hold temporary data for each slot during processing
  type ProcessingSlot = {
    starter: IdealTeamPlayer | null;
    substitute: IdealTeamPlayer | null;
    candidatePool: CandidatePlayer[];
    formationSlot: FormationStats['slots'][number];
  };

  const processingSlots: ProcessingSlot[] = [];

  // 2. Iterate through each required slot in the formation to select STARTERS first.
  formation.slots.forEach((formationSlot) => {
    const hasStylePreference = formationSlot.styles && formationSlot.styles.length > 0;
    
    // Filter candidates for the specific position and optionally by style.
    const eligibleCandidates = allPlayerCandidates.filter(p => {
      const positionMatch = p.position === formationSlot.position;
      const styleMatch = !hasStylePreference || formationSlot.styles!.includes(p.card.style);
      return positionMatch && styleMatch;
    });

    // Sort by the average IN THAT SPECIFIC POSITION.
    eligibleCandidates.sort((a, b) => b.average - a.average);

    const starterCandidate = findBestPlayer(eligibleCandidates);
    
    if (starterCandidate) {
      usedPlayerIds.add(starterCandidate.player.id);
    }
    
    processingSlots.push({
      starter: createTeamPlayer(starterCandidate, formationSlot.position),
      substitute: null,
      candidatePool: eligibleCandidates,
      formationSlot: formationSlot,
    });
  });
  
  // 3. Iterate again to select SUBSTITUTES, ensuring no player is picked twice.
  processingSlots.forEach(slot => {
    const candidatePool = slot.candidatePool;
    
    // Define substitute priority groups from the remaining candidates in that position's pool.
    const hotStreaks = candidatePool.filter(p => p.performance.isHotStreak);
    const promises = candidatePool.filter(p => p.performance.isPromising);
    
    let substituteCandidate = findBestPlayer(hotStreaks);
    if (!substituteCandidate) {
        substituteCandidate = findBestPlayer(promises);
    }
    if (!substituteCandidate) {
        substituteCandidate = findBestPlayer(candidatePool); // Fallback to any remaining player.
    }

    if (substituteCandidate) {
      usedPlayerIds.add(substituteCandidate.player.id);
    }

    slot.substitute = createTeamPlayer(substituteCandidate, slot.formationSlot.position);
  });


  // 4. Fill any empty slots with placeholders and construct the final team.
  const placeholderPerformance: PlayerPerformance = {
        stats: { average: 0, matches: 0, stdDev: 0 },
        isHotStreak: false, isConsistent: false, isPromising: false, isVersatile: false
  };

  return processingSlots.map((slot, index) => ({
      starter: slot.starter || {
          player: { id: `placeholder-S-${index}`, name: `Vacante`, cards: [] },
          card: { id: `placeholder-card-S-${index}`, name: 'N/A', style: 'Ninguno', ratingsByPosition: {} },
          position: slot.formationSlot.position,
          average: 0,
          performance: placeholderPerformance
      },
      substitute: slot.substitute || {
           player: { id: `placeholder-SUB-${index}`, name: `Vacante`, cards: [] },
          card: { id: `placeholder-card-SUB-${index}`, name: 'N/A', style: 'Ninguno', ratingsByPosition: {} },
          position: slot.formationSlot.position,
          average: 0,
          performance: placeholderPerformance
      }
  }));
}
