import type { APIRoute } from 'astro';
import { getAllStatuses, createStatus } from '../../../lib/data/fileOperations';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const statusEntries = await getAllStatuses();
    return new Response(JSON.stringify(statusEntries), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch status entries' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const status = await createStatus(data);
    return new Response(JSON.stringify(status), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create status entry' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
