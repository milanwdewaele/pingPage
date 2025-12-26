# pingPage

A modern ping monitoring application with a Proxmox-inspired UI, designed to be embedded in iframes. Monitor website response times from Brussels, Belgium in real-time.

## Features

- 🎯 **Large, clear ping display** - Response time in huge, easy-to-read text
- 🎨 **Color-coded status** - Green for UP, Red for DOWN
- 🌍 **Brussels-based monitoring** - Pings from Brussels, Belgium
- 🔄 **Auto-refresh** - Automatically checks every 30 seconds
- 🖼️ **Iframe-optimized** - Perfect for embedding in other websites
- 🎭 **Modern UI** - Proxmox-style dark theme with smooth animations
- ⚡ **Serverless** - Runs on Vercel's edge functions

## Usage

### Direct Access

Simply add a `url` query parameter:

```
https://your-domain.vercel.app?url=example.com
https://your-domain.vercel.app?url=https://google.com
```

### Embed in Iframe

```html
<iframe 
  src="https://your-domain.vercel.app?url=example.com" 
  width="800" 
  height="600" 
  frameborder="0">
</iframe>
```

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173?url=example.com` to test.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/milanwdewaele/pingPage)

Or manually:

1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel`
3. Follow the prompts

The application will automatically use the Vercel adapter for optimal performance.

## Technology Stack

- **Framework**: SvelteKit 2.x
- **Deployment**: Vercel (serverless functions)
- **Runtime**: Node.js 20.x
- **Styling**: Component-scoped CSS

## API Endpoint

The application includes a serverless API endpoint for pinging:

```
GET /api/ping?url=example.com
```

Response:
```json
{
  "status": "up",
  "pingTime": 45,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "statusCode": 200
}
```

## License

ISC

