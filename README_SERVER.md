# Sample backend for chat widget

This repository includes a minimal Express server to provide a local `/chat` endpoint for the chat widget.

Prerequisites

- Node.js installed (v14+ recommended)

Install and run

1. Open PowerShell in the project root (where this file lives).
1. Install dependencies:

```powershell
npm install
```

Start the server:

```powershell
npm start
```

The server will listen on `http://localhost:3000` by default and exposes:

- POST /chat
  - Request JSON: { "message": "your text" }
  - Response JSON: { "reply": "..." }

You can replace the reply logic in `server.js` with calls to an actual bot/service later.
