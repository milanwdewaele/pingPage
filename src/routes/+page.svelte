<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let url = '';
	let status = 'idle'; // idle, checking, up, down
	let pingTime = null;
	let lastCheck = null;
	let error = null;
	let autoRefresh = true;

	// Parse URL from query parameters
	onMount(() => {
		url = $page.url.searchParams.get('url') || $page.url.searchParams.get('target') || '';
		if (url) {
			checkPing();
			// Auto-refresh every 30 seconds
			const interval = setInterval(() => {
				if (autoRefresh && url) {
					checkPing();
				}
			}, 30000);
			return () => clearInterval(interval);
		}
	});

	async function checkPing() {
		if (!url) return;

		status = 'checking';
		error = null;

		try {
			const response = await fetch(`/api/ping?url=${encodeURIComponent(url)}`);
			const data = await response.json();

			status = data.status;
			pingTime = data.pingTime;
			lastCheck = new Date(data.timestamp);
			error = data.error || null;
		} catch (err) {
			status = 'down';
			error = err.message;
		}
	}
</script>

<svelte:head>
	<title>Ping Monitor - Brussels</title>
</svelte:head>

<div class="container">
	<div class="header">
		<h1>Ping Monitor</h1>
		<div class="location">
			<span class="location-icon">📍</span>
			<span>Pinging from Brussels, Belgium</span>
		</div>
	</div>

	{#if !url}
		<div class="no-url-message">
			<h2>No URL Specified</h2>
			<p>Please provide a URL to ping using the query parameter.</p>
			<p>Example:</p>
			<p><code>?url=https://example.com</code></p>
			<p>or</p>
			<p><code>?url=example.com</code></p>
		</div>
	{:else}
		<div class="status-panel">
			<div class="target-url">{url}</div>
			{#if status === 'checking'}
				<div class="ping-display checking">
					<div class="spinner-large"></div>
					<div class="ping-label">Checking...</div>
				</div>
			{:else if pingTime !== null}
				<div class="ping-display" class:up={status === 'up'} class:down={status === 'down'}>
					<div class="ping-value">{pingTime}<span class="ping-unit">ms</span></div>
				</div>
			{:else}
				<div class="ping-display">
					<div class="ping-label">Please wait</div>
				</div>
			{/if}
		</div>
	{/if}

	<div class="footer">
		Powered by Ping Monitor • Real-time Status
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
		background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
		color: #e0e0e0;
		min-height: 100vh;
	}

	.container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20px;
		animation: fadeIn 0.5s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.header {
		text-align: center;
		margin-bottom: 30px;
	}

	.header h1 {
		color: #ffffff;
		font-size: 36px;
		font-weight: 600;
		margin-bottom: 10px;
	}

	.location {
		color: #888;
		font-size: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.location-icon {
		display: inline-block;
		width: 18px;
		height: 18px;
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	.status-panel {
		background: #282828;
		border: 1px solid #3a3a3a;
		border-radius: 8px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
		padding: 60px 40px;
		max-width: 800px;
		width: 100%;
		text-align: center;
	}

	.target-url {
		color: #4a9eff;
		font-size: 22px;
		margin-bottom: 50px;
		word-break: break-all;
		font-weight: 500;
	}

	.ping-display {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 250px;
	}

	.ping-display.checking {
		color: #4a9eff;
	}

	.ping-value {
		font-size: 140px;
		font-weight: 700;
		line-height: 1;
		transition: color 0.3s ease;
		animation: fadeInScale 0.5s ease-out;
	}

	.ping-display.up .ping-value {
		color: #2ecc71;
		text-shadow: 0 0 30px rgba(46, 204, 113, 0.5);
		animation: pulseGlow 2s ease-in-out infinite;
	}

	.ping-display.down .ping-value {
		color: #e74c3c;
		text-shadow: 0 0 30px rgba(231, 76, 60, 0.5);
		animation: pulseGlowRed 2s ease-in-out infinite;
	}

	.ping-unit {
		font-size: 60px;
		margin-left: 10px;
		opacity: 0.8;
	}

	.ping-label {
		font-size: 32px;
		color: #4a9eff;
		font-weight: 500;
	}

	.spinner-large {
		width: 100px;
		height: 100px;
		border: 8px solid #3a3a3a;
		border-top: 8px solid #4a9eff;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 30px;
	}

	@keyframes fadeInScale {
		from {
			opacity: 0;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes pulseGlow {
		0%, 100% {
			text-shadow: 0 0 20px rgba(46, 204, 113, 0.5);
		}
		50% {
			text-shadow: 0 0 40px rgba(46, 204, 113, 0.8), 0 0 60px rgba(46, 204, 113, 0.5);
		}
	}

	@keyframes pulseGlowRed {
		0%, 100% {
			text-shadow: 0 0 20px rgba(231, 76, 60, 0.5);
		}
		50% {
			text-shadow: 0 0 40px rgba(231, 76, 60, 0.8), 0 0 60px rgba(231, 76, 60, 0.5);
		}
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.no-url-message {
		background: #282828;
		border: 1px solid #3a3a3a;
		border-radius: 8px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
		padding: 40px;
		max-width: 600px;
		width: 100%;
		text-align: center;
		margin-bottom: 20px;
	}

	.no-url-message h2 {
		color: #e0e0e0;
		margin-bottom: 15px;
	}

	.no-url-message p {
		color: #888;
		line-height: 1.6;
		margin-bottom: 10px;
	}

	.no-url-message code {
		background: #1f1f1f;
		padding: 2px 8px;
		border-radius: 3px;
		color: #4a9eff;
		font-size: 13px;
	}

	.footer {
		text-align: center;
		margin-top: 30px;
		color: #666;
		font-size: 14px;
	}
</style>
