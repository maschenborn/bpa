import type { APIRoute } from 'astro';
import { getStatusById, updateStatus, deleteStatus } from '../../../lib/data/fileOperations';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const status = await getStatusById(params.id!);
    if (!status) {
      return new Response(JSON.stringify({ error: 'Status entry not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(status), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch status entry' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const data = await request.json();
    const status = await updateStatus(params.id!, data);
    if (!status) {
      return new Response(JSON.stringify({ error: 'Status entry not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(status), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update status entry' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const success = await deleteStatus(params.id!);
    if (!success) {
      return new Response(JSON.stringify({ error: 'Status entry not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete status entry' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
