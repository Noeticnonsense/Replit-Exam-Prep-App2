import Whop from '@whop/sdk';

let clientPromise: Promise<Whop> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function initWhopClient(): Promise<Whop> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!hostname || !xReplitToken) {
    throw new Error(
      'Missing Replit environment variables. ' +
        'Ensure the Whop integration is connected via the Integrations tab.',
    );
  }

  const resp = await fetch(
    `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=whop`,
    {
      headers: { Accept: 'application/json', 'X-Replit-Token': xReplitToken },
      signal: AbortSignal.timeout(10_000),
    },
  );

  if (!resp.ok) {
    throw new Error(
      `Failed to fetch Whop credentials: ${resp.status} ${resp.statusText}`,
    );
  }

  const data: unknown = await resp.json();
  const firstItem =
    isRecord(data) && Array.isArray(data.items) ? data.items[0] : undefined;
  const settings = isRecord(firstItem) ? firstItem.settings : undefined;
  const apiKey = isRecord(settings) ? settings.api_key : undefined;

  if (typeof apiKey !== 'string' || apiKey.length === 0) {
    throw new Error(
      'Whop integration not connected or missing credentials. ' +
        'Connect Whop via the Integrations tab first.',
    );
  }

  return new Whop({ apiKey });
}

export function getWhopClient(): Promise<Whop> {
  if (!clientPromise) {
    clientPromise = initWhopClient().catch((err) => {
      clientPromise = null;
      throw err;
    });
  }

  return clientPromise;
}
