import { newCard, scheduleReview, isDue, type Card } from './fsrs';
import type { CardData } from './types';

const KEY = 'greek_progress_v1';

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

type ProgressMap = Record<string, Serialized>;

function load(): ProgressMap {
	try {
		return JSON.parse(localStorage.getItem(KEY) ?? '{}');
	} catch {
		return {};
	}
}

function save(map: ProgressMap): void {
	try {
		localStorage.setItem(KEY, JSON.stringify(map));
	} catch { /* quota exceeded */ }
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

export function getCardState(id: string): Card {
	const map = load();
	return map[id] ? deser(map[id]) : newCard();
}

export function recordReview(id: string, remembered: boolean): Card {
	const map = load();
	const card = map[id] ? deser(map[id]) : newCard();
	const updated = scheduleReview(card, remembered);
	map[id] = ser(updated);
	save(map);
	return updated;
}

export function getDueCards(allCards: CardData[]): CardData[] {
	const map = load();
	return allCards.filter((c) => {
		const s = map[c.id] ? deser(map[c.id]) : newCard();
		return isDue(s);
	});
}

export interface Stats {
	total: number;
	newCards: number;
	due: number;
	learned: number;
	reviewedToday: number;
}

export function getStats(allCards: CardData[]): Stats {
	const map = load();
	const todayStart = new Date();
	todayStart.setHours(0, 0, 0, 0);

	let newCards = 0, due = 0, learned = 0, reviewedToday = 0;

	for (const card of allCards) {
		const d = map[card.id];
		if (!d) { newCards++; continue; }
		const s = deser(d);
		if (s.reps === 0) newCards++;
		else if (isDue(s)) due++;
		else learned++;
		if (s.last_review && new Date(s.last_review) >= todayStart) reviewedToday++;
	}

	return { total: allCards.length, newCards, due, learned, reviewedToday };
}

export function exportData(): string {
	return localStorage.getItem(KEY) ?? '{}';
}

export function importData(raw: string): void {
	JSON.parse(raw); // validate before writing
	localStorage.setItem(KEY, raw);
}
