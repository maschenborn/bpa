import type { APIRoute } from 'astro';
import { getAllAppointments, createAppointment } from '../../../lib/data/fileOperations';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const appointments = await getAllAppointments();
    return new Response(JSON.stringify(appointments), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch appointments' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const appointment = await createAppointment(data);
    return new Response(JSON.stringify(appointment), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create appointment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
