const navbar = document.querySelector("#nav");
const navBtn = document.querySelector("#nav-btn");
const closeBtn = document.querySelector("#close-btn");
const sidebar = document.querySelector("#sidebar");
const date = document.querySelector("#date");

// add fixed class to navbar
if (navbar) {
    // add fixed class to navbar
    window.addEventListener("scroll", function () {
        if (window.scrollY > 80) {
            navbar.classList.add("navbar-fixed");
        } else {
            navbar.classList.remove("navbar-fixed");
        }
    });
}

// show sidebar
if (navBtn && sidebar) {
    // show sidebar
    navBtn.addEventListener("click", function () {
        sidebar.classList.add("show-sidebar");
    });
}

// close sidebar
if (closeBtn && sidebar) {
    closeBtn.addEventListener("click", function () {
        sidebar.classList.remove("show-sidebar");
    });
}

// set year
if (date) {
    date.textContent = new Date().getFullYear();
}

/* Chat widget behavior */
function appendMessage(text, who = 'bot') {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    const div = document.createElement('div');
    div.className = `chat-bubble ${who}`;
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function simulateBotReply(userText) {
    // Try calling local API first
    const apiUrl = 'http://localhost:3000/chat';
    try {
        const resp = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userText }),
        });
        if (!resp.ok) throw new Error('Non-200 response');
        const data = await resp.json();
        if (data && data.reply) return data.reply;
    } catch (err) {
        // fallback simulated reply when the server isn't available
        // keep a small delay to mimic network latency
        await new Promise(r => setTimeout(r, 700 + Math.random() * 800));
        return 'متشکرم! پیام شما دریافت شد. ما در اسرع وقت پاسخ می‌دهیم.';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    try {
        const chatToggle = document.getElementById('chat-toggle');
        const chatPanel = document.getElementById('chat-panel');
        const chatClose = document.getElementById('chat-close');
        const chatForm = document.getElementById('chat-form');
        const chatInput = document.getElementById('chat-input');
        const chatMessages = document.getElementById('chat-messages');

        // Ensure initial visibility matches aria-hidden
        if (chatPanel) {
            const hidden = chatPanel.getAttribute('aria-hidden') === 'true';
            chatPanel.style.display = hidden ? 'none' : 'block';
            // keep CSS-focused visibility if possible (class 'open' controls open state)
            if (!hidden) chatPanel.classList.add('open');
        }

        if (chatToggle && chatPanel) {
            chatToggle.addEventListener('click', function () {
                // Toggle an 'open' class and keep aria attributes in sync
                const isOpen = chatPanel.classList.toggle('open');
                this.setAttribute('aria-expanded', String(isOpen));
                chatPanel.setAttribute('aria-hidden', String(!isOpen));
                chatPanel.style.display = isOpen ? 'block' : 'none';
            });
        }

        if (chatClose && chatPanel) {
            chatClose.addEventListener('click', function () {
                chatPanel.classList.remove('open');
                if (chatToggle) chatToggle.setAttribute('aria-expanded', 'false');
                chatPanel.setAttribute('aria-hidden', 'true');
                chatPanel.style.display = 'none';
                if (chatToggle) chatToggle.focus();
            });
        }

        if (chatForm && chatInput && chatMessages) {
            chatForm.addEventListener('submit', async function (e) {
                e.preventDefault();
                const val = chatInput.value && chatInput.value.trim();
                if (!val) return;
                appendMessage(val, 'user');
                if (chatInput) chatInput.value = '';
                // simulate typing indicator
                appendMessage('در حال تایپ...', 'bot');
                // replace typing indicator with real reply
                const reply = await simulateBotReply(val);
                // remove last bot typing bubble if it was the indicator
                const bubbles = chatMessages.querySelectorAll('.chat-bubble.bot');
                const last = bubbles[bubbles.length - 1];
                if (last && last.textContent === 'در حال تایپ...') {
                    last.textContent = reply;
                } else {
                    appendMessage(reply, 'bot');
                }
            });
        }
    } catch (err) {
        // خطاهای اجرا لاگ میشه ولی صفحه شکسته نمیشه
        console.error('init error:', err);
    }
});

// close panel on ESC (keeps logic consistent with open class + aria-hidden)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
        const chatPanel = document.getElementById('chat-panel');
        const chatToggle = document.getElementById('chat-toggle');
        const isOpen = chatPanel && (chatPanel.classList.contains('open') || chatPanel.getAttribute('aria-hidden') === 'false');
        if (isOpen && chatPanel) {
            chatPanel.classList.remove('open');
            chatPanel.setAttribute('aria-hidden', 'true');
            chatPanel.style.display = 'none';
            if (chatToggle) {
                chatToggle.setAttribute('aria-expanded', 'false');
                chatToggle.focus();
            }
        }
    }
});

// Simple cart demo: clicking header-cart increases count and optionally stores on server
const headerCart = document.getElementById('header-cart');
const cartCountEl = document.getElementById('cart-count');
let cartCount = 0;
if (headerCart && cartCountEl) {
    headerCart.addEventListener('click', async () => {
        cartCount += 1;
        cartCountEl.textContent = cartCount;

        // if user logged in, attempt to send item to server cart (demo item)
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                await fetch(`/api/cart/me`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ item: { id: Date.now(), name: 'Demo item', price: 0 } }),
                });
            } catch (err) {
                console.warn('Failed to sync cart to server', err);
            }
        }
    });
}