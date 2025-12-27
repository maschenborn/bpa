import type { APIRoute } from 'astro';
import { getDoctorById, updateDoctor, deleteDoctor } from '../../../lib/data/fileOperations';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const doctor = await getDoctorById(params.id!);
    if (!doctor) {
      return new Response(JSON.stringify({ error: 'Doctor not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(doctor), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch doctor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const data = await request.json();
    const doctor = await updateDoctor(params.id!, data);
    if (!doctor) {
      return new Response(JSON.stringify({ error: 'Doctor not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(doctor), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update doctor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const success = await deleteDoctor(params.id!);
    if (!success) {
      return new Response(JSON.stringify({ error: 'Doctor not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete doctor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
