<script lang="ts">
	import type { Stats } from '$lib/progress';

	let {
		stats,
		loading,
		error,
		onstart
	}: {
		stats: Stats | null;
		loading: boolean;
		error: string | null;
		onstart: () => void;
	} = $props();

	let total = $derived((stats?.newCards ?? 0) + (stats?.due ?? 0));
	let canStart = $derived(total > 0 && !loading && !error);
</script>

<div class="home">
	<header>
		<div class="logo">α</div>
		<h1>Ελληνικά</h1>
		<p class="subtitle">Греческие карточки</p>
	</header>

	{#if loading}
		<div class="status">загрузка...</div>
	{:else if error}
		<div class="status error">{error}</div>
	{:else if stats}
		<div class="stats-grid">
			<div class="stat-card highlight">
				<span class="stat-num">{total}</span>
				<span class="stat-label">на сегодня</span>
			</div>
			<div class="stat-card">
				<span class="stat-num">{stats.newCards}</span>
				<span class="stat-label">новых</span>
			</div>
			<div class="stat-card">
				<span class="stat-num">{stats.due}</span>
				<span class="stat-label">к повторению</span>
			</div>
			<div class="stat-card">
				<span class="stat-num">{stats.learned}</span>
				<span class="stat-label">изучено</span>
			</div>
		</div>

		{#if stats.reviewedToday > 0}
			<p class="today-note">сегодня повторено: {stats.reviewedToday}</p>
		{/if}
	{/if}

	<button class="start-btn" onclick={onstart} disabled={!canStart}>
		{#if loading}
			загружаю...
		{:else if total === 0}
			всё повторено ✓
		{:else}
			начать — {total} карточек
		{/if}
	</button>

	<p class="total-label">{stats?.total ?? 0} карточек всего</p>
</div>

<style>
	.home {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 2rem 1.5rem;
		gap: 1.5rem;
	}

	header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.logo {
		width: 72px;
		height: 72px;
		background: var(--accent);
		border-radius: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: Georgia, serif;
		font-size: 2.4rem;
		color: white;
		margin-bottom: 0.5rem;
		box-shadow: 0 8px 32px rgba(37, 99, 235, 0.4);
	}

	h1 {
		margin: 0;
		font-size: 1.8rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--text-primary);
	}

	.subtitle {
		margin: 0;
		font-size: 0.9rem;
		color: var(--text-secondary);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
		width: 100%;
		max-width: 320px;
	}

	.stat-card {
		background: var(--bg-surface);
		border-radius: 14px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	.stat-card.highlight {
		background: rgba(37, 99, 235, 0.15);
		border-color: rgba(37, 99, 235, 0.3);
	}

	.stat-num {
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-primary);
		line-height: 1;
	}

	.stat-card.highlight .stat-num {
		color: #60a5fa;
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--text-secondary);
		letter-spacing: 0.02em;
	}

	.today-note {
		font-size: 0.8rem;
		color: var(--success);
		margin: -0.5rem 0 0;
	}

	.start-btn {
		width: 100%;
		max-width: 320px;
		padding: 1rem;
		background: var(--accent);
		color: white;
		font-size: 1rem;
		font-weight: 600;
		border-radius: 14px;
		transition: background 0.2s, transform 0.1s;
		box-shadow: 0 4px 20px rgba(37, 99, 235, 0.35);
	}

	.start-btn:hover:not(:disabled) {
		background: var(--accent-dim);
	}

	.start-btn:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.total-label {
		font-size: 0.75rem;
		color: var(--text-secondary);
		margin: 0;
	}

	.status {
		color: var(--text-secondary);
		font-size: 0.9rem;
	}

	.status.error {
		color: var(--danger);
	}
</style>
