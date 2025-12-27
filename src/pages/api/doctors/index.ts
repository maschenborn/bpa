import type { APIRoute } from 'astro';
import { getAllDoctors, createDoctor } from '../../../lib/data/fileOperations';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const doctors = await getAllDoctors();
    return new Response(JSON.stringify(doctors), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch doctors' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const doctor = await createDoctor(data);
    return new Response(JSON.stringify(doctor), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create doctor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
