import type { APIRoute } from 'astro';
import { getTimeline } from '../../lib/data/fileOperations';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    // Parse filter parameters from query string
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');
    // Convert string dates to Date objects for getTimeline
    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;
    const typesParam = url.searchParams.get('types');
    const types = typesParam ? typesParam.split(',') as ('appointment' | 'medication' | 'status' | 'document')[] : undefined;
    const doctorId = url.searchParams.get('doctorId') || undefined;
    const minPainLevelParam = url.searchParams.get('minPainLevel');
    const minPainLevel = minPainLevelParam ? parseInt(minPainLevelParam, 10) : undefined;
    const maxPainLevelParam = url.searchParams.get('maxPainLevel');
    const maxPainLevel = maxPainLevelParam ? parseInt(maxPainLevelParam, 10) : undefined;

    const timeline = await getTimeline({
      startDate,
      endDate,
      types,
      doctorId,
      minPainLevel,
      maxPainLevel,
    });

    return new Response(JSON.stringify(timeline), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch timeline' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
