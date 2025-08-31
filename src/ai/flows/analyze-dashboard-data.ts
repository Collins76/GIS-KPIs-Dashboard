'use server';

/**
 * @fileOverview An AI agent that analyzes dashboard data and identifies key trends.
 *
 * - analyzeDashboardData - A function that handles the dashboard data analysis process.
 * - AnalyzeDashboardDataInput - The input type for the analyzeDashboardData function.
 * - AnalyzeDashboardDataOutput - The return type for the analyzeDashboardData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDashboardDataInputSchema = z.object({
  kpiData: z.string().describe('The KPI data from the dashboard.'),
  role: z.string().describe('The role of the user viewing the dashboard.'),
});
export type AnalyzeDashboardDataInput = z.infer<typeof AnalyzeDashboardDataInputSchema>;

const AnalyzeDashboardDataOutputSchema = z.object({
  analysis: z.string().describe('The analysis of the dashboard data.'),
});
export type AnalyzeDashboardDataOutput = z.infer<typeof AnalyzeDashboardDataOutputSchema>;

export async function analyzeDashboardData(input: AnalyzeDashboardDataInput): Promise<AnalyzeDashboardDataOutput> {
  return analyzeDashboardDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDashboardDataPrompt',
  input: {schema: AnalyzeDashboardDataInputSchema},
  output: {schema: AnalyzeDashboardDataOutputSchema},
  prompt: `You are an expert GIS data analyst at Ikeja Electric.

You are viewing a dashboard with KPI data for the role: {{{role}}}.

Analyze the following KPI data and identify any noteworthy trends or conclusions that a GIS professional should be aware of. Provide a concise summary of your analysis.

KPI Data:
{{{kpiData}}}
`,
});

const analyzeDashboardDataFlow = ai.defineFlow(
  {
    name: 'analyzeDashboardDataFlow',
    inputSchema: AnalyzeDashboardDataInputSchema,
    outputSchema: AnalyzeDashboardDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
