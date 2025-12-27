import type { APIRoute } from 'astro';
import { getMedicationById, updateMedication, deleteMedication } from '../../../lib/data/fileOperations';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const medication = await getMedicationById(params.id!);
    if (!medication) {
      return new Response(JSON.stringify({ error: 'Medication not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(medication), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch medication' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const data = await request.json();
    const medication = await updateMedication(params.id!, data);
    if (!medication) {
      return new Response(JSON.stringify({ error: 'Medication not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(medication), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update medication' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const success = await deleteMedication(params.id!);
    if (!success) {
      return new Response(JSON.stringify({ error: 'Medication not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete medication' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
