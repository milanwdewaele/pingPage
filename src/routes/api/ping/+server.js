import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const targetUrl = url.searchParams.get('url');
	
	if (!targetUrl) {
		return json({ error: 'No URL provided' }, { status: 400 });
	}
	
	// Format URL properly
	let formattedUrl = targetUrl;
	if (!formattedUrl.match(/^https?:\/\//i)) {
		formattedUrl = 'https://' + formattedUrl;
	}
	
	const startTime = Date.now();
	
	try {
		// Validate URL
		new URL(formattedUrl);
		
		// Perform the ping using fetch with timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
		
		const response = await fetch(formattedUrl, {
			method: 'HEAD',
			signal: controller.signal,
			headers: {
				'User-Agent': 'PingMonitor/1.0 (Brussels)'
			}
		});
		
		clearTimeout(timeoutId);
		const endTime = Date.now();
		const pingTime = endTime - startTime;
		
		// Check if response is successful (2xx or 3xx status codes)
		const isUp = response.ok || (response.status >= 300 && response.status < 400);
		
		return json({
			status: isUp ? 'up' : 'down',
			pingTime: Math.round(pingTime),
			timestamp: new Date().toISOString(),
			statusCode: response.status
		});
	} catch (error) {
		const endTime = Date.now();
		const pingTime = endTime - startTime;
		
		let errorMessage = 'Unknown error';
		
		if (error.name === 'AbortError') {
			errorMessage = 'Request timeout (10s)';
		} else if (error.message.includes('fetch')) {
			errorMessage = 'Network error or unreachable';
		} else {
			errorMessage = error.message;
		}
		
		return json({
			status: 'down',
			pingTime: Math.round(pingTime),
			timestamp: new Date().toISOString(),
			error: errorMessage
		});
	}
}
