'use server';

/**
 * @fileOverview An AI agent that suggests maintenance procedures for a piece of equipment.
 *
 * - suggestMaintenanceProcedures - A function that suggests maintenance procedures.
 * - SuggestMaintenanceProceduresInput - The input type for the suggestMaintenanceProcedures function.
 * - SuggestMaintenanceProceduresOutput - The return type for the suggestMaintenanceProcedures function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMaintenanceProceduresInputSchema = z.object({
  equipmentType: z.string().describe('The type of equipment (e.g., CPU, monitor, printer).'),
  maintenanceHistory: z.string().describe('A summary of the equipment\'s maintenance history.'),
  commonFailurePoints: z.string().describe('Common failure points for this type of equipment.'),
});
export type SuggestMaintenanceProceduresInput = z.infer<
  typeof SuggestMaintenanceProceduresInputSchema
>;

const SuggestMaintenanceProceduresOutputSchema = z.object({
  suggestedProcedures: z
    .string()
    .describe('A list of suggested maintenance procedures for the equipment.'),
});
export type SuggestMaintenanceProceduresOutput = z.infer<
  typeof SuggestMaintenanceProceduresOutputSchema
>;

export async function suggestMaintenanceProcedures(
  input: SuggestMaintenanceProceduresInput
): Promise<SuggestMaintenanceProceduresOutput> {
  return suggestMaintenanceProceduresFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMaintenanceProceduresPrompt',
  input: {schema: SuggestMaintenanceProceduresInputSchema},
  output: {schema: SuggestMaintenanceProceduresOutputSchema},
  prompt: `You are an expert maintenance technician. Based on the equipment type, maintenance history, and common failure points, suggest a list of maintenance procedures to perform.\n\nEquipment Type: {{{equipmentType}}}\nMaintenance History: {{{maintenanceHistory}}}\nCommon Failure Points: {{{commonFailurePoints}}}\n\nSuggested Maintenance Procedures:`,
});

const suggestMaintenanceProceduresFlow = ai.defineFlow(
  {
    name: 'suggestMaintenanceProceduresFlow',
    inputSchema: SuggestMaintenanceProceduresInputSchema,
    outputSchema: SuggestMaintenanceProceduresOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
