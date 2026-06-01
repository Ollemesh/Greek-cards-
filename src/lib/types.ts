export interface CardData {
	id: string;
	front: string;
	back: string;
	transliteration?: string;
	category?: string;
	notes?: string;
}

export interface CardsDataFile {
	version: number;
	updated: string;
	cards: CardData[];
}

export type SwipeDirection = 'left' | 'right';

export interface SessionResult {
	card: CardData;
	remembered: boolean;
}
