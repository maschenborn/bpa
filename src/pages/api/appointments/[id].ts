import type { APIRoute } from 'astro';
import { getAppointmentById, updateAppointment, deleteAppointment } from '../../../lib/data/fileOperations';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const appointment = await getAppointmentById(params.id!);
    if (!appointment) {
      return new Response(JSON.stringify({ error: 'Appointment not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(appointment), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch appointment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const data = await request.json();
    const appointment = await updateAppointment(params.id!, data);
    if (!appointment) {
      return new Response(JSON.stringify({ error: 'Appointment not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(appointment), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update appointment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const success = await deleteAppointment(params.id!);
    if (!success) {
      return new Response(JSON.stringify({ error: 'Appointment not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete appointment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
