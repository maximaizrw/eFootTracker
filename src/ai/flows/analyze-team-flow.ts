
'use server';

/**
 * @fileOverview Un agente de IA que analiza una plantilla de eFootball.
 *
 * - analyzeTeam - Una función que maneja el proceso de análisis de equipo.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { AnalyzeTeamInput, AnalyzeTeamOutput } from '@/lib/types';
import { AnalyzeTeamInputSchema, AnalyzeTeamOutputSchema } from '@/lib/types';

export async function analyzeTeam(input: AnalyzeTeamInput): Promise<AnalyzeTeamOutput> {
  return analyzeTeamFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTeamPrompt',
  input: { schema: AnalyzeTeamInputSchema },
  output: { schema: AnalyzeTeamOutputSchema },
  prompt: `Eres un entrenador experto de eFootball y analista táctico. Se te ha proporcionado la composición de un equipo, su formación y su estilo de juego.

Tu tarea es realizar un análisis táctico conciso y experto. Debes identificar las fortalezas, debilidades, y dar sugerencias para mejorar la plantilla, además de un resumen general.

Aquí está la información del equipo:
Formación: {{{formationName}}}
Estilo de Juego Global: {{{playStyle}}}

Composición del Equipo (Titulares y Suplentes):
{{#each team}}
- Posición: {{this.starter.position}}
  - Titular: {{this.starter.playerName}} (Estilo: {{this.starter.style}})
  {{#if this.substitute}}
  - Suplente: {{this.substitute.playerName}} (Estilo: {{this.substitute.style}})
  {{/if}}
{{/each}}

Basándote en la combinación de posiciones, estilos de juego de los jugadores y el estilo de juego global, proporciona tu análisis estructurado. Sé directo y específico en tus comentarios.`,
});

const analyzeTeamFlow = ai.defineFlow(
  {
    name: 'analyzeTeamFlow',
    inputSchema: AnalyzeTeamInputSchema,
    outputSchema: AnalyzeTeamOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("El análisis de la IA no devolvió una respuesta válida.");
    }
    return output;
  }
);
