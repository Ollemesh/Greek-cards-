import { createEmptyCard, fsrs, generatorParameters, Rating, type Card } from 'ts-fsrs';

export type { Card };

const scheduler = fsrs(generatorParameters({ enable_fuzz: true, maximum_interval: 365 }));

export function newCard(): Card {
	return createEmptyCard();
}

export function scheduleReview(card: Card, remembered: boolean): Card {
	const rating = remembered ? Rating.Good : Rating.Again;
	return scheduler.repeat(card, new Date())[rating].card;
}

export function isDue(card: Card): boolean {
	return new Date(card.due) <= new Date();
}

export function nextReviewText(card: Card): string {
	const diffMs = new Date(card.due).getTime() - Date.now();
	if (diffMs <= 0) return 'сейчас';
	const mins = Math.floor(diffMs / 60_000);
	const hours = Math.floor(diffMs / 3_600_000);
	const days = Math.floor(diffMs / 86_400_000);
	if (mins < 60) return `через ${mins} мин`;
	if (hours < 24) return `через ${hours} ч`;
	return `через ${days} д`;
}
