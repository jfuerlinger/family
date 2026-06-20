const CONNECTION_STRING_PREFIX = 'ConnectionStrings__';

function resolveFromConnectionStrings(): string | undefined {
  if (process.env.ConnectionStrings__family) return process.env.ConnectionStrings__family;
  if (process.env.ConnectionStrings__default) return process.env.ConnectionStrings__default;
  if (process.env.ConnectionStrings__DefaultConnection) return process.env.ConnectionStrings__DefaultConnection;

  const firstConnectionStringEntry = Object.entries(process.env).find(([key, value]) => {
    return key.startsWith(CONNECTION_STRING_PREFIX) && typeof value === 'string' && value.length > 0;
  });

  return firstConnectionStringEntry?.[1];
}

function toUrlFromKeywordStyle(connectionString: string): string {
  const entries = connectionString
    .split(';')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const separatorIndex = segment.indexOf('=');
      if (separatorIndex < 0) return undefined;
      const key = segment.slice(0, separatorIndex).trim().toLowerCase();
      const value = segment.slice(separatorIndex + 1).trim();
      return [key, value] as const;
    })
    .filter((entry): entry is readonly [string, string] => Boolean(entry));

  const values = new Map(entries);
  const host = values.get('host') ?? values.get('server');
  const database = values.get('database') ?? values.get('dbname');
  const username = values.get('username') ?? values.get('user id') ?? values.get('user');
  const password = values.get('password');
  const port = values.get('port');

  if (!host || !database || !username) {
    throw new Error(
      'DATABASE_URL is neither a PostgreSQL URL nor a valid connection-string format (missing host/database/username).',
    );
  }

  const hostWithoutPort = host.split(',')[0];
  const url = new URL(`postgresql://${hostWithoutPort}/${database}`);

  if (port) url.port = port;
  url.username = username;
  if (password) url.password = password;

  if (!url.searchParams.has('schema')) {
    url.searchParams.set('schema', 'public');
  }

  return url.toString();
}

type ResolveDatabaseUrlOptions = {
  fallback?: string;
};

export function resolveDatabaseUrl(options?: ResolveDatabaseUrlOptions): string {
  const rawValue = process.env.DATABASE_URL ?? resolveFromConnectionStrings();
  if (!rawValue) {
    if (options?.fallback) return options.fallback;
    throw new Error(
      'DATABASE_URL is not set. Provide DATABASE_URL directly or an Aspire connection string (ConnectionStrings__*).',
    );
  }

  if (rawValue.startsWith('postgres://') || rawValue.startsWith('postgresql://')) {
    return rawValue;
  }

  return toUrlFromKeywordStyle(rawValue);
}
