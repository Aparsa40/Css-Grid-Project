document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    const openRegister = document.getElementById('open-register');
    const openCart = document.getElementById('open-cart');
    const showRegister = document.getElementById('show-register');
    const authModal = document.getElementById('auth-modal');
    const authClose = document.getElementById('auth-close');
    const authForm = document.getElementById('auth-form');
    const authTitle = document.getElementById('auth-title');
    const authError = document.getElementById('auth-error');
    const oauthGitHub = document.getElementById('oauth-github');
    const oauthGoogle = document.getElementById('oauth-google');

    // defensive selectors (در صورتی که فرم‌ها وجود نداشته باشند، اسکریپت شکست نمی‌خورد)
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const statusEl = document.getElementById('auth-status');

    function showModal(mode = 'register') {
        authModal.setAttribute('aria-hidden', 'false');
        authModal.style.display = 'block';
        authTitle.textContent = mode === 'register' ? 'ثبت نام' : 'ورود';
        authForm.dataset.mode = mode;
    }

    function hideModal() {
        authModal.setAttribute('aria-hidden', 'true');
        authModal.style.display = 'none';
        authError.textContent = '';
    }

    if (openRegister) openRegister.addEventListener('click', () => showModal('register'));
    if (showRegister) showRegister.addEventListener('click', () => showModal('register'));
    if (authClose) authClose.addEventListener('click', hideModal);

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const mode = authForm.dataset.mode || 'register';
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Password rules must match server
        if (password.length < 8 || password.length > 64) {
            authError.textContent = 'رمز عبور باید بین 8 تا 64 کاراکتر باشد.';
            return;
        }

        try {
            const url = mode === 'register' ? '/api/register' : '/api/login';
            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.error || 'خطا');
            if (mode === 'login' && data.token) {
                // store token for API calls
                localStorage.setItem('authToken', data.token);
            }
            hideModal();
            alert(mode === 'register' ? 'ثبت نام انجام شد' : 'ورود موفق');
        } catch (err) {
            authError.textContent = err.message || 'خطا در عملیات';
        }
    });

    // Placeholder OAuth flows
    if (oauthGitHub) oauthGitHub.addEventListener('click', () => {
        // Replace URL with real OAuth flow under your control
        window.location.href = '/auth/github';
    });
    if (oauthGoogle) oauthGoogle.addEventListener('click', () => {
        window.location.href = '/auth/google';
    });

    async function postJson(url, body) {
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return resp;
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = new FormData(registerForm);
            const email = (form.get('email') || '').toString().trim();
            const password = (form.get('password') || '').toString().trim();
            if (!email || !password) {
                if (statusEl) statusEl.textContent = 'لطفا ایمیل و رمز عبور را وارد کنید.';
                return;
            }
            try {
                const resp = await postJson('/api/auth/register', { email, password });
                if (resp.ok) {
                    const data = await resp.json();
                    localStorage.setItem('authToken', data.token);
                    if (statusEl) statusEl.textContent = 'ثبت نام موفق، وارد شدید.';
                    window.location.href = '/';
                } else {
                    const err = await resp.json().catch(()=>({message:'خطا'}));
                    if (statusEl) statusEl.textContent = err.message || 'ثبت نام ناموفق';
                }
            } catch (err) {
                console.error(err);
                if (statusEl) statusEl.textContent = 'خطا در ارتباط با سرور.';
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = new FormData(loginForm);
            const email = (form.get('email') || '').toString().trim();
            const password = (form.get('password') || '').toString().trim();
            if (!email || !password) {
                if (statusEl) statusEl.textContent = 'لطفا ایمیل و رمز عبور را وارد کنید.';
                return;
            }
            try {
                const resp = await postJson('/api/auth/login', { email, password });
                if (resp.ok) {
                    const data = await resp.json();
                    localStorage.setItem('authToken', data.token);
                    if (statusEl) statusEl.textContent = 'ورود موفق.';
                    window.location.href = '/';
                } else {
                    const err = await resp.json().catch(()=>({message:'مشکل'}));
                    if (statusEl) statusEl.textContent = err.message || 'ورود ناموفق';
                }
            } catch (err) {
                console.error(err);
                if (statusEl) statusEl.textContent = 'خطا در ارتباط با سرور.';
            }
        });
    }
});
