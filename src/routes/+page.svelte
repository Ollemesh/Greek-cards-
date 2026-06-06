<script lang="ts">
	import { onMount } from 'svelte';
	import HomeScreen from '$lib/components/HomeScreen.svelte';
	import SwipeDeck from '$lib/components/SwipeDeck.svelte';
	import SessionComplete from '$lib/components/SessionComplete.svelte';
	import { loadCards, shuffled } from '$lib/cards';
	import { getDueCards, recordReview, getStats, type Stats } from '$lib/progress';
	import { saveSession, loadSession, clearSession } from '$lib/session';
	import type { CardData, SessionResult, SwipeDirection } from '$lib/types';

	const MAX_SESSION = 20;
	type Screen = 'home' | 'study' | 'complete';

	let screen = $state<Screen>('home');
	let allCards = $state<CardData[]>([]);
	let sessionCards = $state<CardData[]>([]);
	let results = $state<SessionResult[]>([]);
	let stats = $state<Stats | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let initialIndex = $state(0);

	onMount(async () => {
		try {
			allCards = await loadCards();

			const saved = loadSession();
			if (saved) {
				const cardMap = new Map(allCards.map(c => [c.id, c]));
				const restored = saved.cardIds.map(id => cardMap.get(id)).filter(Boolean) as CardData[];
				if (restored.length === saved.cardIds.length) {
					sessionCards = restored;
					results = saved.results.map(r => ({
						card: cardMap.get(r.cardId)!,
						remembered: r.remembered
					}));
					initialIndex = saved.index;
					screen = 'study';
				}
			}

			stats = await getStats(allCards);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Ошибка загрузки';
		} finally {
			loading = false;
		}
	});

	async function startSession() {
		const due = await getDueCards(allCards);
		sessionCards = shuffled(due).slice(0, MAX_SESSION);
		results = [];
		initialIndex = 0;
		saveSession(sessionCards.map(c => c.id), 0, []);
		screen = 'study';
	}

	async function onSwipe(dir: SwipeDirection, card: CardData) {
		await recordReview(card.id, dir === 'left');
		results = [...results, { card, remembered: dir === 'left' }];
		saveSession(
			sessionCards.map(c => c.id),
			results.length,
			results.map(r => ({ cardId: r.card.id, remembered: r.remembered }))
		);
	}

	async function onDeckDone() {
		clearSession();
		stats = await getStats(allCards);
		screen = 'complete';
	}

	function onDone() {
		screen = 'home';
	}
</script>

<div class="app">
	{#if screen === 'home'}
		<HomeScreen {stats} {loading} {error} onstart={startSession} />
	{:else if screen === 'study'}
		<SwipeDeck cards={sessionCards} {initialIndex} onswipe={onSwipe} ondone={onDeckDone} />
	{:else if screen === 'complete'}
		<SessionComplete {results} ondone={onDone} />
	{/if}
</div>

<style>
	.app {
		height: 100dvh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
</style>
