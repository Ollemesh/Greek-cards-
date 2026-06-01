<script lang="ts">
	import FlashCard from './FlashCard.svelte';
	import type { CardData, SwipeDirection } from '$lib/types';

	let {
		cards,
		onswipe,
		ondone
	}: {
		cards: CardData[];
		onswipe: (dir: SwipeDirection, card: CardData) => void;
		ondone: () => void;
	} = $props();

	let index = $state(0);
	let flipped = $state(false);
	let dragX = $state(0);
	let dragY = $state(0);
	let isDragging = $state(false);
	let isFlying = $state(false);

	let current = $derived(cards[index]);
	let next = $derived(cards[index + 1]);
	let progress = $derived((index / cards.length) * 100);

	const THRESHOLD = 90;
	let startX = 0;
	let startY = 0;
	let hasMoved = false;

	function onPointerDown(e: PointerEvent) {
		if (isFlying) return;
		startX = e.clientX;
		startY = e.clientY;
		hasMoved = false;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onPointerMove(e: PointerEvent) {
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;

		if (!hasMoved && Math.abs(dx) > 8) {
			hasMoved = true;
			isDragging = true;
		}

		if (isDragging) {
			dragX = dx;
			dragY = dy * 0.15;
		}
	}

	function onPointerUp() {
		if (!hasMoved) {
			flipped = !flipped;
			isDragging = false;
			return;
		}

		isDragging = false;
		hasMoved = false;

		if (Math.abs(dragX) >= THRESHOLD) {
			fly(dragX > 0 ? 'right' : 'left');
		} else {
			dragX = 0;
			dragY = 0;
		}
	}

	async function fly(dir: SwipeDirection) {
		isFlying = true;
		dragX = dir === 'right' ? window.innerWidth * 1.6 : -window.innerWidth * 1.6;
		dragY = -40;

		await new Promise((r) => setTimeout(r, 340));

		const card = current;
		const nextIndex = index + 1;
		index = nextIndex;
		flipped = false;
		dragX = 0;
		dragY = 0;
		isFlying = false;

		onswipe(dir, card);

		if (nextIndex >= cards.length) {
			ondone();
		}
	}

	function onKeyDown(e: KeyboardEvent) {
		if (!current) return;
		if (e.code === 'Space') { e.preventDefault(); flipped = !flipped; }
		else if (e.code === 'ArrowLeft') fly('left');
		else if (e.code === 'ArrowRight') fly('right');
	}

	// rotation and overlay intensity
	let rotation = $derived(dragX / 18);
	let overlayIntensity = $derived(Math.min(Math.abs(dragX) / 130, 1));
	let showRight = $derived(dragX > 20);
	let showLeft = $derived(dragX < -20);

	let cardTransition = $derived(
		isFlying
			? 'transform 0.34s cubic-bezier(0.4, 0, 1, 1)'
			: isDragging
				? 'none'
				: 'transform 0.28s ease'
	);
</script>

<svelte:window onkeydown={onKeyDown} />

<div class="deck-container">
	<!-- Progress bar -->
	<div class="progress-track">
		<div class="progress-fill" style:width="{progress}%"></div>
	</div>
	<p class="progress-label">{index} / {cards.length}</p>

	<!-- Card stack -->
	<div class="stack"
		role="application"
		aria-label="Карточки для изучения"
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointercancel={onPointerUp}
	>
		<!-- Behind card -->
		{#if next}
			<div class="card-slot behind">
				<FlashCard card={next} />
			</div>
		{/if}

		<!-- Active card -->
		{#if current}
			{#key index}
				<div
					class="card-slot active"
					style:transform="translateX({dragX}px) translateY({dragY}px) rotate({rotation}deg)"
					style:transition={cardTransition}
				>
					<!-- Know overlay (left swipe) -->
					{#if showLeft}
						<div class="overlay know" style:opacity={overlayIntensity * 0.85}>
							<span>Знаю ✓</span>
						</div>
					{/if}

					<!-- Don't know overlay (right swipe) -->
					{#if showRight}
						<div class="overlay dunno" style:opacity={overlayIntensity * 0.85}>
							<span>Не знаю ✗</span>
						</div>
					{/if}

					<FlashCard card={current} flipped={flipped} />
				</div>
			{/key}
		{/if}
	</div>

	<!-- Swipe hints -->
	<div class="hints">
		<span class="hint-left">← знаю</span>
		<span class="hint-right">не знаю →</span>
	</div>
</div>

<style>
	.deck-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
		padding: 1rem 1.5rem 1.5rem;
		gap: 0.75rem;
		touch-action: none;
		user-select: none;
		-webkit-user-select: none;
	}

	.progress-track {
		width: 100%;
		height: 3px;
		background: rgba(255, 255, 255, 0.08);
		border-radius: 100px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--accent);
		border-radius: 100px;
		transition: width 0.4s ease;
	}

	.progress-label {
		font-size: 0.8rem;
		color: var(--text-secondary);
		margin: 0;
	}

	.stack {
		position: relative;
		width: 100%;
		flex: 1;
		max-width: 420px;
		max-height: 560px;
	}

	.card-slot {
		position: absolute;
		inset: 0;
	}

	.behind {
		transform: translate(0, 10px) scale(0.96);
		filter: brightness(0.7);
	}

	.active {
		z-index: 1;
		will-change: transform;
	}

	.overlay {
		position: absolute;
		inset: 0;
		z-index: 2;
		border-radius: var(--radius);
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}

	.overlay.know {
		background: var(--success);
	}

	.overlay.dunno {
		background: var(--danger);
	}

	.overlay span {
		color: white;
		font-size: 1.8rem;
		font-weight: 700;
		letter-spacing: 0.03em;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	.hints {
		display: flex;
		width: 100%;
		max-width: 420px;
		justify-content: space-between;
		padding: 0 0.5rem;
	}

	.hint-left, .hint-right {
		font-size: 0.75rem;
		color: var(--text-secondary);
		opacity: 0.7;
	}
</style>
