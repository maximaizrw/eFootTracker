
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
      
      // Calculate versatility once per card, as it's a card-level attribute
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
            isPromising: stats.matches < 10, // Changed from 5 to 10
            isVersatile: isVersatile,
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
    
    // Get all candidates for the specific position.
    const positionCandidates = allPlayerCandidates
      .filter(p => p.position === formationSlot.position)
      .sort((a, b) => b.average - a.average);

    let starterCandidate: CandidatePlayer | undefined;
    
    // First, try to find a player matching the preferred style.
    if (hasStylePreference) {
        const styleCandidates = positionCandidates.filter(p => formationSlot.styles!.includes(p.card.style));
        starterCandidate = findBestPlayer(styleCandidates);
    }
    
    // If no style-matching player is found (or no style was specified), find the best overall for the position.
    if (!starterCandidate) {
        starterCandidate = findBestPlayer(positionCandidates);
    }
    
    if (starterCandidate) {
      usedPlayerIds.add(starterCandidate.player.id);
    }
    
    processingSlots.push({
      starter: createTeamPlayer(starterCandidate, formationSlot.position),
      substitute: null,
      candidatePool: positionCandidates,
      formationSlot: formationSlot,
    });
  });
  
  // 3. Iterate again to select SUBSTITUTES, ensuring no player is picked twice.
  processingSlots.forEach(slot => {
    // Candidates for this position, already sorted by average rating.
    const candidatePool = slot.candidatePool;
    
    // Define substitute priority groups from the remaining candidates in that position's pool.
    const hotStreaks = candidatePool.filter(p => p.performance.isHotStreak);
    const promises = candidatePool.filter(p => p.performance.isPromising);
    
    let substituteCandidate: CandidatePlayer | undefined;

    // Priority 1: Find best player in hot streak
    substituteCandidate = findBestPlayer(hotStreaks);
    
    // Priority 2: Find best promising player
    if (!substituteCandidate) {
      substituteCandidate = findBestPlayer(promises);
    }
    
    // Priority 3: Find best remaining player (fallback)
    if (!substituteCandidate) {
      substituteCandidate = findBestPlayer(candidatePool);
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
