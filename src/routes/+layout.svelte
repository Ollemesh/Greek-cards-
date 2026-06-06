<script lang="ts">
	import '../app.css';
	import { version } from '$lib/version';
	let { children } = $props();
</script>

{@render children()}
<span class="version">v{version}</span>

<style>
	.version {
		position: fixed;
		bottom: 0.5rem;
		right: 0.75rem;
		font-size: 0.65rem;
		color: rgba(255, 255, 255, 0.18);
		pointer-events: none;
		z-index: 100;
	}
</style>
