const KEY = 'greek_session_v1';

interface PersistedSession {
	date: string;
	cardIds: string[];
	index: number;
	results: { cardId: string; remembered: boolean }[];
}

function today(): string {
	return new Date().toISOString().slice(0, 10);
}

export function saveSession(
	cardIds: string[],
	index: number,
	results: { cardId: string; remembered: boolean }[]
): void {
	localStorage.setItem(KEY, JSON.stringify({ date: today(), cardIds, index, results }));
}

export function loadSession(): PersistedSession | null {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return null;
		const s: PersistedSession = JSON.parse(raw);
		if (s.date !== today()) return null;
		if (s.index >= s.cardIds.length) return null;
		return s;
	} catch {
		return null;
	}
}

export function clearSession(): void {
	localStorage.removeItem(KEY);
}
