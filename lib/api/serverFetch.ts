type ServerFetchOptions = {
  /** seconds */
  revalidate?: number;
  /** Next cache tags (optional). Useful if you later use revalidateTag(). */
  tags?: string[];
  /** query params */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** request init overrides */
  init?: RequestInit;
};

function getApiBaseUrl() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set. Add it to .env (example: https://api.example.com/api)"
    );
  }
  return base.replace(/\/$/, "");
}

function buildUrl(path: string, params?: ServerFetchOptions["params"]) {
  const base = getApiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${p}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

/**
 * Server-only JSON fetch that participates in Next.js Data Cache (ISR).
 * Use in Server Components / route handlers.
 */
export async function serverGetJSON<T>(
  path: string,
  opts: ServerFetchOptions = {}
): Promise<T> {
  const url = buildUrl(path, opts.params);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(opts.init?.headers ?? {}),
    },
    // IMPORTANT: this is what enables ISR on server
    next:
      typeof opts.revalidate === "number" || (opts.tags && opts.tags.length)
        ? {
            revalidate: opts.revalidate,
            tags: opts.tags,
          }
        : undefined,
    ...opts.init,
  });

  if (!res.ok) {
    // keep it short (don’t leak body)
    throw new Error(`serverGetJSON failed: ${res.status} ${res.statusText} (${url})`);
  }

  return (await res.json()) as T;
}
