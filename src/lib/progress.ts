import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { newCard, scheduleReview, isDue, type Card } from './fsrs';
import type { CardData } from './types';

interface Serialized {
	due: string;
	stability: number;
	difficulty: number;
	elapsed_days: number;
	scheduled_days: number;
	reps: number;
	lapses: number;
	state: number;
	last_review?: string;
}

interface ProgressDB extends DBSchema {
	progress: { key: string; value: Serialized };
}

let dbPromise: ReturnType<typeof openDB<ProgressDB>> | null = null;

function getDB() {
	if (!dbPromise) {
		dbPromise = openDB<ProgressDB>('greek-cards', 1, {
			upgrade(db) {
				db.createObjectStore('progress');
			}
		});
	}
	return dbPromise;
}

async function loadAll(db: IDBPDatabase<ProgressDB>): Promise<Map<string, Card>> {
	const keys = await db.getAllKeys('progress');
	const values = await db.getAll('progress');
	const map = new Map<string, Card>();
	keys.forEach((k, i) => map.set(k, deser(values[i])));
	return map;
}

function ser(card: Card): Serialized {
	return {
		due: new Date(card.due).toISOString(),
		stability: card.stability,
		difficulty: card.difficulty,
		elapsed_days: card.elapsed_days,
		scheduled_days: card.scheduled_days,
		reps: card.reps,
		lapses: card.lapses,
		state: card.state,
		last_review: card.last_review ? new Date(card.last_review).toISOString() : undefined
	};
}

function deser(d: Serialized): Card {
	return {
		due: new Date(d.due),
		stability: d.stability,
		difficulty: d.difficulty,
		elapsed_days: d.elapsed_days,
		scheduled_days: d.scheduled_days,
		reps: d.reps,
		lapses: d.lapses,
		state: d.state as Card['state'],
		last_review: d.last_review ? new Date(d.last_review) : undefined
	} as Card;
}

export async function recordReview(id: string, remembered: boolean): Promise<Card> {
	const db = await getDB();
	const stored = await db.get('progress', id);
	const card = stored ? deser(stored) : newCard();
	const updated = scheduleReview(card, remembered);
	await db.put('progress', ser(updated), id);
	return updated;
}

export async function getDueCards(allCards: CardData[]): Promise<CardData[]> {
	const db = await getDB();
	const map = await loadAll(db);
	return allCards.filter((c) => isDue(map.get(c.id) ?? newCard()));
}

export interface Stats {
	total: number;
	newCards: number;
	due: number;
	learned: number;
	reviewedToday: number;
}

export async function getStats(allCards: CardData[]): Promise<Stats> {
	const db = await getDB();
	const map = await loadAll(db);
	const todayStart = new Date();
	todayStart.setHours(0, 0, 0, 0);

	let newCards = 0, due = 0, learned = 0, reviewedToday = 0;

	for (const card of allCards) {
		const s = map.get(card.id);
		if (!s) { newCards++; continue; }
		if (s.reps === 0) newCards++;
		else if (isDue(s)) due++;
		else learned++;
		if (s.last_review && s.last_review >= todayStart) reviewedToday++;
	}

	return { total: allCards.length, newCards, due, learned, reviewedToday };
}

export async function exportData(): Promise<string> {
	const db = await getDB();
	const keys = await db.getAllKeys('progress');
	const values = await db.getAll('progress');
	const map: Record<string, Serialized> = {};
	keys.forEach((k, i) => { map[k] = values[i]; });
	return JSON.stringify(map);
}

export async function importData(raw: string): Promise<void> {
	const map: Record<string, Serialized> = JSON.parse(raw);
	const db = await getDB();
	const tx = db.transaction('progress', 'readwrite');
	await tx.store.clear();
	for (const [id, value] of Object.entries(map)) {
		await tx.store.put(value, id);
	}
	await tx.done;
}
