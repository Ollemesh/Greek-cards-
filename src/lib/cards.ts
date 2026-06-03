import { PUBLIC_CARDS_URL } from '$env/static/public';
import type { CardData, CardsDataFile } from './types';

export async function loadCards(): Promise<CardData[]> {
	const res = await fetch(PUBLIC_CARDS_URL);
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const data: CardsDataFile = await res.json();
	return data.cards;
}

export function shuffled<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}
