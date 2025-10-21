const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// serve static files (برای تست محلی)
app.use(express.static(path.join(__dirname)));

// in-memory stores (برای توسعه اولیه — در تولید از DB استفاده کنید)
const users = new Map(); // key: email -> { password }
const carts = new Map(); // key: email -> [items]

// simple helper to create a demo token (base64(email)) — در تولید از JWT استفاده کنید
function makeToken(email) {
    return Buffer.from(email).toString('base64');
}
function tokenToEmail(token) {
    try { return Buffer.from(token, 'base64').toString('utf8'); } catch { return null; }
}

// Chat endpoint: expects { message } and returns { reply }
app.post('/chat', async (req, res) => {
    const { message } = req.body || {};
    // very simple reply; replace with AI integration later
    const reply = message ? `سرور پاسخ: ${message}` : 'سلام! چگونه کمک کنم؟';
    // simulate latency
    setTimeout(() => res.json({ reply }), 400 + Math.random() * 500);
});

// Auth: register
app.post('/api/auth/register', (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });
    if (users.has(email)) return res.status(409).json({ message: 'user already exists' });
    users.set(email, { password });
    carts.set(email, []);
    const token = makeToken(email);
    return res.json({ token, user: { email } });
});

// Auth: login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });
    const u = users.get(email);
    if (!u || u.password !== password) return res.status(401).json({ message: 'invalid credentials' });
    const token = makeToken(email);
    return res.json({ token, user: { email } });
});

// Cart: add item for authenticated user
app.post('/api/cart/me', (req, res) => {
    const auth = req.headers.authorization || '';
    const match = auth.match(/^Bearer\s+(.+)$/i);
    if (!match) return res.status(401).json({ message: 'missing auth' });
    const token = match[1];
    const email = tokenToEmail(token);
    if (!email || !users.has(email)) return res.status(401).json({ message: 'invalid token' });
    const item = req.body && req.body.item;
    if (!item) return res.status(400).json({ message: 'item required' });
    const list = carts.get(email) || [];
    list.push(item);
    carts.set(email, list);
    return res.json({ ok: true, cart: list });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
