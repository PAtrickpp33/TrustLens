import { http } from '@/lib/http';
import { z } from 'zod';

export const ResultSchema = z.object({
  id: z.string(),
  score: z.number(),
  summary: z.string().optional()
});

export const ResultsResponseSchema = z.object({
  items: z.array(ResultSchema)
});

export type Result = z.infer<typeof ResultSchema>;
export type ResultsResponse = z.infer<typeof ResultsResponseSchema>;

export async function fetchResultsService(): Promise<ResultsResponse> {
  const { data } = await http.get('/results');
  return ResultsResponseSchema.parse(data);
}


