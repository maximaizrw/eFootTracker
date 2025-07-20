
import type { Player as PlayerType, PlayerCard as PlayerCardType, Position as PositionType } from './types';
import * as z from "zod";

export const playerStyles = ['Ninguno', 'Cazagoles', 'Señuelo', 'Hombre de área', 'Hombre objetivo', 'Creador de juego', 'El destructor', 'Portero defensivo', 'Portero ofensivo', 'Atacante extra', 'Lateral defensivo', 'Lateral Ofensivo', 'Lateral finalizador', 'Omnipresente', 'Medio escudo', 'Organizador', 'Jugador de huecos', 'Especialista en centros', 'Extremo móvil', 'Creador de jugadas', 'Diez Clasico', 'Segundo delantero', 'Extremo prolífico'] as const;
export type PlayerStyle = typeof playerStyles[number];

export const positions = ['PT', 'DFC', 'LI', 'LD', 'MCD', 'MC', 'MDI', 'MDD', 'MO', 'EXI', 'EXD', 'SD', 'DC'] as const;
export type Position = typeof positions[number];

export type PositionGroup = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';

export type PlayerCard = {
  id: string;
  name: string; // e.g., "Highlight", "Player of the Week"
  style: PlayerStyle;
  imageUrl?: string;
  ratingsByPosition: { [key in Position]?: number[] };
};

export type Player = {
  id: string;
  name: string;
  cards: PlayerCard[];
};

export type AddRatingFormValues = {
    playerId?: string;
    playerName: string;
    cardName: string;
    position: Position;
    style: PlayerStyle;
    rating: number;
}

export type EditCardFormValues = {
    playerId: string;
    cardId: string;
    currentCardName: string;
    currentStyle: PlayerStyle;
    imageUrl?: string;
};

export type EditPlayerFormValues = {
    playerId: string;
    currentPlayerName: string;
};

export type PlayersByPosition = {
  [key in Position]: Player[];
};

export type Formation = {
  [key in Position]?: number;
};

export type IdealTeamPlayer = {
  player: Player;
  card: PlayerCard;
  position: Position;
  average: number;
};

export type IdealTeamSlot = {
  starter: IdealTeamPlayer | null;
  substitute: IdealTeamPlayer | null;
}

// --- Tipos para Formaciones ---

export const formationPlayStyles = [
  'Contraataque rápido', 
  'Contraataque largo', 
  'Por las bandas', 
  'Balones largos', 
  'Posesión'
] as const;
export type FormationPlayStyle = typeof formationPlayStyles[number];

export type MatchResult = {
  id: string;
  goalsFor: number;
  goalsAgainst: number;
  date: string; // ISO 8601 string
};

export const FormationSlotSchema = z.object({
  position: z.enum(positions),
  styles: z.array(z.enum(playerStyles)).optional().default([]),
});

export type FormationSlot = z.infer<typeof FormationSlotSchema>;

export type FormationStats = {
  id: string;
  name: string;
  creator?: string;
  playStyle: FormationPlayStyle;
  slots: FormationSlot[];
  imageUrl?: string;
  secondaryImageUrl?: string;
  sourceUrl?: string;
  matches: MatchResult[];
};

export type AddFormationFormValues = {
  name: string;
  creator?: string;
  playStyle: FormationPlayStyle;
  slots: FormationSlot[];
  imageUrl?: string;
  secondaryImageUrl?: string;
  sourceUrl?: string;
};

export type EditFormationFormValues = {
  id: string;
  name: string;
  creator?: string;
  playStyle: FormationPlayStyle;
  slots: FormationSlot[];
  imageUrl?: string;
  secondaryImageUrl?: string;
  sourceUrl?: string;
};


export type AddMatchFormValues = {
  formationId: string;
  goalsFor: number;
  goalsAgainst: number;
}

// --- Tipos para componentes refactorizados
export type FlatPlayer = {
  player: PlayerType;
  card: PlayerCardType;
  ratingsForPos: number[];
};

// --- Tipos para Guías de Entrenamiento ---
export type TrainingGuide = {
  id: string;
  title: string;
  content: string; // Markdown content
  createdAt: string; // ISO 8601 string
};

export type AddTrainingGuideFormValues = {
  title: string;
  content: string;
};

export type EditTrainingGuideFormValues = {
  id: string;
  title: string;
  content: string;
};

<<<<<<< HEAD
<<<<<<< HEAD
// --- Tipos para el Flow de Análisis de IA ---
const IdealTeamPlayerSchema = z.object({
    playerName: z.string(),
    cardName: z.string(),
    position: z.string(),
    style: z.string(),
    average: z.number(),
});

const IdealTeamSlotForAnalysisSchema = z.object({
    starter: IdealTeamPlayerSchema,
    substitute: IdealTeamPlayerSchema.nullable(),
});

export const AnalyzeTeamInputSchema = z.object({
  formationName: z.string().describe("El nombre de la formación táctica, ej: '4-3-3'."),
  playStyle: z.string().describe("El estilo de juego global de la formación, ej: 'Contraataque rápido'."),
  team: z.array(IdealTeamSlotForAnalysisSchema).describe("Una lista de 11 jugadores, con sus posiciones y estilos, que componen el equipo titular."),
=======
=======
>>>>>>> feccb5d (I see this error with the app, reported by NextJS, please fix it. The er)
// --- Tipos para Análisis de IA ---
export const AnalyzeTeamPlayerSchema = z.object({
    name: z.string(),
    position: z.enum(positions),
    cardName: z.string(),
    style: z.enum(playerStyles),
});
export type AnalyzeTeamPlayer = z.infer<typeof AnalyzeTeamPlayerSchema>;

export const AnalyzeTeamInputSchema = z.object({
    formationName: z.string(),
    starters: z.array(AnalyzeTeamPlayerSchema),
    substitutes: z.array(AnalyzeTeamPlayerSchema),
<<<<<<< HEAD
>>>>>>> feccb5d (I see this error with the app, reported by NextJS, please fix it. The er)
=======
>>>>>>> feccb5d (I see this error with the app, reported by NextJS, please fix it. The er)
});
export type AnalyzeTeamInput = z.infer<typeof AnalyzeTeamInputSchema>;

export const AnalyzeTeamOutputSchema = z.object({
<<<<<<< HEAD
<<<<<<< HEAD
  strengths: z.array(z.string()).describe("Una lista de 2 o 3 puntos fuertes clave del equipo."),
  weaknesses: z.array(z.string()).describe("Una lista de 2 o 3 debilidades o vulnerabilidades potenciales del equipo."),
  suggestions: z.array(z.string()).describe("Una lista de 2 o 3 sugerencias para mejorar el equipo, como qué tipo de jugador (posición y estilo) fichar."),
  summary: z.string().describe("Un resumen táctico general de 2 o 3 frases sobre cómo se debería jugar con este equipo y formación."),
=======
=======
>>>>>>> feccb5d (I see this error with the app, reported by NextJS, please fix it. The er)
    strengths: z.array(z.string()).describe("A list of key strengths of the generated team."),
    weaknesses: z.array(z.string()).describe("A list of key weaknesses of the generated team."),
    signingSuggestion: z.string().describe("A suggestion for a new player (position and style) that would improve the team."),
    tacticalSummary: z.string().describe("A concise summary of the team's overall tactical approach."),
<<<<<<< HEAD
>>>>>>> feccb5d (I see this error with the app, reported by NextJS, please fix it. The er)
=======
>>>>>>> feccb5d (I see this error with the app, reported by NextJS, please fix it. The er)
});
export type AnalyzeTeamOutput = z.infer<typeof AnalyzeTeamOutputSchema>;
