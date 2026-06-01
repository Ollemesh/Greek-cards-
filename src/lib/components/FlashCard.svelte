<script lang="ts">
	import type { CardData } from '$lib/types';

	let { card, flipped = false }: { card: CardData; flipped?: boolean } = $props();
</script>

<div class="perspective">
	<div class="card" class:flipped>
		<div class="face front">
			{#if card.category}
				<span class="badge">{card.category}</span>
			{/if}
			<p class="greek">{card.front}</p>
			{#if card.transliteration}
				<p class="translit">{card.transliteration}</p>
			{/if}
			<p class="hint">нажми чтобы перевернуть</p>
		</div>

		<div class="face back">
			{#if card.category}
				<span class="badge">{card.category}</span>
			{/if}
			<p class="greek small">{card.front}</p>
			<p class="translation">{card.back}</p>
			{#if card.notes}
				<p class="notes">{card.notes}</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.perspective {
		width: 100%;
		height: 100%;
		perspective: 1200px;
	}

	.card {
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
		transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
	}

	.card.flipped {
		transform: rotateY(180deg);
	}

	.face {
		position: absolute;
		inset: 0;
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
		border-radius: var(--radius);
		background: var(--bg-card);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem 1.5rem;
		gap: 0.5rem;
		box-shadow: var(--shadow-card);
		overflow: hidden;
	}

	.back {
		transform: rotateY(180deg);
	}

	.badge {
		position: absolute;
		top: 1rem;
		right: 1rem;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--accent);
		background: rgba(37, 99, 235, 0.1);
		border: 1px solid rgba(37, 99, 235, 0.25);
		padding: 0.2rem 0.6rem;
		border-radius: 100px;
	}

	.greek {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 2.6rem;
		font-weight: 400;
		color: var(--text-card);
		text-align: center;
		margin: 0;
		line-height: 1.2;
	}

	.greek.small {
		font-size: 1.2rem;
		color: var(--text-card-sub);
		margin-bottom: 0.5rem;
	}

	.translit {
		font-size: 1rem;
		color: var(--text-card-sub);
		font-style: italic;
		margin: 0;
	}

	.translation {
		font-size: 1.6rem;
		font-weight: 500;
		color: var(--text-card);
		text-align: center;
		margin: 0;
		line-height: 1.3;
	}

	.notes {
		font-size: 0.9rem;
		color: var(--text-card-sub);
		text-align: center;
		margin: 0.5rem 0 0;
		line-height: 1.5;
	}

	.hint {
		position: absolute;
		bottom: 1rem;
		font-size: 0.72rem;
		color: #cbd5e1;
		margin: 0;
		letter-spacing: 0.02em;
	}
</style>
