import { PUBLIC_CARDS_URL } from '$env/static/public';
import type { CardData, CardsDataFile } from './types';

const CACHE_KEY = 'greek_cards_data_v1';
const CACHE_TS_KEY = 'greek_cards_ts_v1';
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6h

export async function loadCards(): Promise<CardData[]> {
	const cached = localStorage.getItem(CACHE_KEY);
	const ts = parseInt(localStorage.getItem(CACHE_TS_KEY) ?? '0', 10);

	if (cached && Date.now() - ts < CACHE_TTL) {
		return JSON.parse(cached) as CardData[];
	}

	try {
		const res = await fetch(PUBLIC_CARDS_URL);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data: CardsDataFile = await res.json();
		localStorage.setItem(CACHE_KEY, JSON.stringify(data.cards));
		localStorage.setItem(CACHE_TS_KEY, Date.now().toString());
		return data.cards;
	} catch {
		if (cached) return JSON.parse(cached) as CardData[];
		throw new Error('Не удалось загрузить карточки');
	}
}

export function shuffled<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}
