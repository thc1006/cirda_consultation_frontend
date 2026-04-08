import type { RequestHandler } from './$types';
import { exportConversations } from '$lib/server/repo';
import { toJsonl, toCsv } from '$lib/server/exporter';

export const GET: RequestHandler = async ({ url }) => {
  const format = url.searchParams.get('format') ?? 'jsonl';
  const rows = exportConversations();
  if (format === 'csv') {
    return new Response(toCsv(rows), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="cirda-export-${Date.now()}.csv"`
      }
    });
  }
  return new Response(toJsonl(rows), {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Content-Disposition': `attachment; filename="cirda-export-${Date.now()}.jsonl"`
    }
  });
};
