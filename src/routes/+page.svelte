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
			<div class="status-indicator" class:checking={status === 'checking'} class:up={status === 'up'} class:down={status === 'down'}>
				{#if status === 'checking'}
					<div class="spinner"></div>
				{:else if status === 'up'}
					<div class="status-icon">✓</div>
				{:else if status === 'down'}
					<div class="status-icon">✗</div>
				{/if}
			</div>
			<div class="status-text" class:checking={status === 'checking'} class:up={status === 'up'} class:down={status === 'down'}>
				{status === 'checking' ? 'Checking...' : status.toUpperCase()}
			</div>
			{#if pingTime !== null}
				<div class="ping-time">Response time: {pingTime}ms</div>
			{:else}
				<div class="ping-time">Please wait</div>
			{/if}
			<button class="retry-btn" on:click={checkPing}>Check Again</button>
		</div>

		{#if status !== 'idle' && status !== 'checking'}
			<div class="details-panel show">
				<div class="detail-row">
					<span class="detail-label">Status</span>
					<span class="detail-value">{status.toUpperCase()}</span>
				</div>
				{#if pingTime !== null}
					<div class="detail-row">
						<span class="detail-label">Response Time</span>
						<span class="detail-value">{pingTime}ms</span>
					</div>
				{/if}
				<div class="detail-row">
					<span class="detail-label">Checked From</span>
					<span class="detail-value">Brussels, Belgium</span>
				</div>
				{#if lastCheck}
					<div class="detail-row">
						<span class="detail-label">Last Check</span>
						<span class="detail-value">{lastCheck.toLocaleString()}</span>
					</div>
				{/if}
				{#if error}
					<div class="detail-row">
						<span class="detail-label">Error</span>
						<span class="detail-value">{error}</span>
					</div>
				{/if}
			</div>
		{/if}
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
		font-size: 28px;
		font-weight: 600;
		margin-bottom: 10px;
	}

	.location {
		color: #888;
		font-size: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.location-icon {
		display: inline-block;
		width: 16px;
		height: 16px;
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
		padding: 40px;
		max-width: 600px;
		width: 100%;
		margin-bottom: 20px;
		text-align: center;
	}

	.target-url {
		color: #4a9eff;
		font-size: 16px;
		margin-bottom: 25px;
		word-break: break-all;
		font-weight: 500;
	}

	.status-indicator {
		width: 120px;
		height: 120px;
		margin: 0 auto 20px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: all 0.3s ease;
	}

	.status-indicator.checking {
		background: #3a3a3a;
		animation: rotate 1.5s linear infinite;
	}

	.status-indicator.up {
		background: radial-gradient(circle, #2ecc71 0%, #27ae60 100%);
		box-shadow: 0 0 30px rgba(46, 204, 113, 0.5);
		animation: statusPulse 2s ease-in-out infinite;
	}

	.status-indicator.down {
		background: radial-gradient(circle, #e74c3c 0%, #c0392b 100%);
		box-shadow: 0 0 30px rgba(231, 76, 60, 0.5);
		animation: statusPulseRed 2s ease-in-out infinite;
	}

	@keyframes rotate {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	@keyframes statusPulse {
		0%, 100% { 
			transform: scale(1);
			box-shadow: 0 0 30px rgba(46, 204, 113, 0.5);
		}
		50% { 
			transform: scale(1.05);
			box-shadow: 0 0 50px rgba(46, 204, 113, 0.8);
		}
	}

	@keyframes statusPulseRed {
		0%, 100% { 
			transform: scale(1);
			box-shadow: 0 0 30px rgba(231, 76, 60, 0.5);
		}
		50% { 
			transform: scale(1.05);
			box-shadow: 0 0 50px rgba(231, 76, 60, 0.8);
		}
	}

	.status-icon {
		font-size: 50px;
		color: white;
		font-weight: bold;
	}

	.spinner {
		width: 50px;
		height: 50px;
		border: 4px solid #3a3a3a;
		border-top: 4px solid #4a9eff;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.status-text {
		font-size: 24px;
		font-weight: 600;
		margin-bottom: 10px;
		transition: color 0.3s ease;
	}

	.status-text.up {
		color: #2ecc71;
	}

	.status-text.down {
		color: #e74c3c;
	}

	.status-text.checking {
		color: #4a9eff;
	}

	.ping-time {
		color: #888;
		font-size: 14px;
		margin-top: 10px;
	}

	.details-panel {
		background: #282828;
		border: 1px solid #3a3a3a;
		border-radius: 8px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
		padding: 20px;
		max-width: 600px;
		width: 100%;
		margin-bottom: 20px;
	}

	.details-panel.show {
		animation: slideDown 0.3s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			max-height: 0;
		}
		to {
			opacity: 1;
			max-height: 300px;
		}
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		padding: 10px 0;
		border-bottom: 1px solid #2a2a2a;
	}

	.detail-row:last-child {
		border-bottom: none;
	}

	.detail-label {
		color: #888;
		font-size: 14px;
	}

	.detail-value {
		color: #e0e0e0;
		font-size: 14px;
		font-weight: 500;
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
		margin-top: 20px;
		color: #666;
		font-size: 12px;
	}

	.retry-btn {
		background: #4a9eff;
		color: white;
		border: none;
		padding: 10px 24px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		margin-top: 15px;
		transition: background 0.3s ease;
	}

	.retry-btn:hover {
		background: #3a8eef;
	}

	.retry-btn:active {
		transform: scale(0.98);
	}
</style>
