<script lang="ts">
	import type { SessionResult } from '$lib/types';

	let {
		results,
		ondone
	}: {
		results: SessionResult[];
		ondone: () => void;
	} = $props();

	let remembered = $derived(results.filter((r) => r.remembered).length);
	let forgot = $derived(results.length - remembered);
	let percent = $derived(Math.round((remembered / results.length) * 100));
</script>

<div class="complete">
	<div class="trophy">{percent >= 80 ? '🏆' : percent >= 50 ? '💪' : '📚'}</div>

	<h2>Сессия завершена</h2>

	<div class="result-row">
		<div class="result-item good">
			<span class="num">{remembered}</span>
			<span class="lbl">знаю</span>
		</div>
		<div class="divider"></div>
		<div class="result-item bad">
			<span class="num">{forgot}</span>
			<span class="lbl">не знаю</span>
		</div>
	</div>

	<p class="score">{percent}% запомнено</p>

	{#if results.length > 0}
		<div class="card-list">
			<p class="list-title">В этой сессии:</p>
			{#each results as r}
				<div class="card-row" class:good={r.remembered} class:bad={!r.remembered}>
					<span class="mark">{r.remembered ? '✓' : '✗'}</span>
					<span class="word">{r.card.front}</span>
					<span class="trans">{r.card.back}</span>
				</div>
			{/each}
		</div>
	{/if}

	<button class="done-btn" onclick={ondone}>на главную</button>
</div>

<style>
	.complete {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
		padding: 2rem 1.5rem;
		gap: 1rem;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.trophy {
		font-size: 3.5rem;
		line-height: 1;
	}

	h2 {
		margin: 0;
		font-size: 1.4rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.result-row {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		background: var(--bg-surface);
		border-radius: 16px;
		padding: 1.25rem 2rem;
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	.result-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
	}

	.num {
		font-size: 2.2rem;
		font-weight: 700;
		line-height: 1;
	}

	.result-item.good .num { color: var(--success); }
	.result-item.bad .num { color: var(--danger); }

	.lbl {
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.divider {
		width: 1px;
		height: 40px;
		background: rgba(255, 255, 255, 0.1);
	}

	.score {
		font-size: 0.9rem;
		color: var(--text-secondary);
		margin: -0.25rem 0 0;
	}

	.card-list {
		width: 100%;
		max-width: 400px;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.list-title {
		font-size: 0.78rem;
		color: var(--text-secondary);
		margin: 0 0 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.card-row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.5rem 0.75rem;
		background: var(--bg-surface);
		border-radius: 8px;
		font-size: 0.85rem;
	}

	.mark {
		font-weight: 700;
		width: 16px;
		flex-shrink: 0;
	}

	.card-row.good .mark { color: var(--success); }
	.card-row.bad .mark { color: var(--danger); }

	.word {
		font-family: Georgia, serif;
		color: var(--text-primary);
		flex-shrink: 0;
	}

	.trans {
		color: var(--text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.done-btn {
		width: 100%;
		max-width: 320px;
		padding: 0.9rem;
		background: var(--bg-surface);
		color: var(--text-primary);
		font-size: 0.95rem;
		font-weight: 600;
		border-radius: 14px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		margin-top: 0.5rem;
	}
</style>
