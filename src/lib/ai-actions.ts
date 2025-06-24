'use server';

import { suggestMaintenanceProcedures } from '@/ai/flows/suggest-maintenance-procedures';
import type { SuggestMaintenanceProceduresInput, SuggestMaintenanceProceduresOutput } from '@/ai/flows/suggest-maintenance-procedures';

// --- AI Suggestions ---
export async function getAiMaintenanceSuggestions(
  input: SuggestMaintenanceProceduresInput
): Promise<SuggestMaintenanceProceduresOutput> {
  try {
    const suggestions = await suggestMaintenanceProcedures(input);
    return suggestions;
  } catch (error) {
    console.error("Error fetching AI maintenance suggestions:", error);
    return { suggestedProcedures: "Error al obtener sugerencias de IA. Verifique la conexión o inténtelo más tarde." };
  }
}
