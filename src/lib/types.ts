export interface CardData {
	id: string;
	front: string;
	back: string;
	transliteration?: string;
	category?: string;
	notes?: string;
}

export interface CardsDataFile {
	cards: CardData[];
}

export type SwipeDirection = 'left' | 'right';

export interface SessionResult {
	card: CardData;
	remembered: boolean;
}
