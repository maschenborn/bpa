import type { APIRoute } from 'astro';
import { getAllMedications, createMedication } from '../../../lib/data/fileOperations';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const medications = await getAllMedications();
    return new Response(JSON.stringify(medications), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch medications' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const medication = await createMedication(data);
    return new Response(JSON.stringify(medication), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create medication' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
