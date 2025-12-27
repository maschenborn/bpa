import type { APIRoute } from 'astro';
import { getAllDocuments, createDocument } from '../../../lib/data/fileOperations';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const documents = await getAllDocuments();
    return new Response(JSON.stringify(documents), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch documents' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const document = await createDocument(data);
    return new Response(JSON.stringify(document), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create document' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
