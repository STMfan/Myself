const API = 'https://api.github.com/users/STMfan';
const FALLBACK = '/assets/avatar.png';
const STORAGE_KEY = 'stmfan.githubAvatar';
const TTL = 12 * 60 * 60 * 1000;

let cached: string | null = null;
let pending: Promise<string> | null = null;

function readStored(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
    if (stored && typeof stored.url === 'string' && Date.now() - stored.at < TTL) {
      return stored.url;
    }
  } catch {
    /* ignore malformed cache */
  }
  return null;
}

function persist(url: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ url, at: Date.now() }));
  } catch {
    /* private mode */
  }
}

function withSize(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('s', '240');
    return parsed.toString();
  } catch {
    return url;
  }
}

/** Fetch the avatar from the GitHub API, with a long-lived local cache. */
export function getGithubAvatar(): Promise<string> {
  if (cached) return Promise.resolve(cached);
  const stored = readStored();
  if (stored) {
    cached = stored;
    return Promise.resolve(stored);
  }
  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return Promise.resolve(FALLBACK);
  }
  if (!pending) {
    pending = fetch(API, { headers: { Accept: 'application/vnd.github+json' } })
      .then((response) => {
        if (!response.ok) throw new Error(`GitHub API ${response.status}`);
        return response.json() as Promise<{ avatar_url?: string }>;
      })
      .then((profile) => {
        const url = profile.avatar_url ? withSize(profile.avatar_url) : FALLBACK;
        cached = url;
        persist(url);
        return url;
      })
      .catch(() => FALLBACK)
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}

export { FALLBACK as GITHUB_AVATAR_FALLBACK };
