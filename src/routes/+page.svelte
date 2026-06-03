<script lang="ts">
	import { onMount } from 'svelte';
	import HomeScreen from '$lib/components/HomeScreen.svelte';
	import SwipeDeck from '$lib/components/SwipeDeck.svelte';
	import SessionComplete from '$lib/components/SessionComplete.svelte';
	import { loadCards, shuffled } from '$lib/cards';
	import { getDueCards, recordReview, getStats, type Stats } from '$lib/progress';
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

	onMount(async () => {
		try {
			allCards = await loadCards();
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
		screen = 'study';
	}

	async function onSwipe(dir: SwipeDirection, card: CardData) {
		await recordReview(card.id, dir === 'left');
		results = [...results, { card, remembered: dir === 'left' }];
	}

	async function onDeckDone() {
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
		<SwipeDeck cards={sessionCards} onswipe={onSwipe} ondone={onDeckDone} />
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
