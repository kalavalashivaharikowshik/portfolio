/* ==========================================================
   FEATURES
   1. Toast helper
   2. Live GitHub repos (home page)
   3. Project filters (projects page)
   4. Contact form (contact page)
   5. Command menu: Ctrl/Cmd + K (all pages)
   ========================================================== */

(() => {
    'use strict';

    const EMAIL = 'kalavalakowshik1616@gmail.com';
    const GITHUB_USER = 'kalavalashivaharikowshik';

    /* ---------- 1. Toast ---------- */
    let toastEl;
    let toastTimer;
    function toast(message) {
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.className = 'toast';
            toastEl.setAttribute('role', 'status');
            document.body.appendChild(toastEl);
        }
        toastEl.textContent = message;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
    }

    async function copyText(text, okMessage) {
        try {
            await navigator.clipboard.writeText(text);
            toast(okMessage);
        } catch (e) {
            toast(text);
        }
    }

    const escapeHtml = (str) => String(str ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));


    /* ---------- 2. Live GitHub repos ---------- */
    const LANG_COLORS = {
        Python: '#3572A5', TypeScript: '#3178c6', JavaScript: '#f1e05a', HTML: '#e34c26',
        CSS: '#563d7c', 'Jupyter Notebook': '#DA5B0B', Java: '#b07219', C: '#555555',
        'C++': '#f34b7d', Solidity: '#AA6746', Go: '#00ADD8', Shell: '#89e051'
    };

    function timeAgo(iso) {
        const diff = (Date.now() - new Date(iso).getTime()) / 1000;
        const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600]];
        for (const [name, secs] of units) {
            const n = Math.floor(diff / secs);
            if (n >= 1) return `${n} ${name}${n > 1 ? 's' : ''} ago`;
        }
        return 'just now';
    }

    function prettyName(name) {
        const ACRONYMS = { ai: 'AI', nlp: 'NLP', dr: 'DR', api: 'API', ml: 'ML', llm: 'LLM' };
        return name.replace(/[-_]+/g, ' ').split(' ')
            .map((w) => ACRONYMS[w.toLowerCase()] || (w === w.toLowerCase() ? w.charAt(0).toUpperCase() + w.slice(1) : w))
            .join(' ');
    }

    async function loadGitHub() {
        const grid = document.getElementById('ghGrid');
        if (!grid) return;
        const user = grid.dataset.user || GITHUB_USER;
        const CACHE_KEY = 'gh-repos-v1';

        const render = (repos) => {
            const list = repos
                .filter((r) => !r.fork && !r.archived && r.name !== user && r.name !== 'portfolio')
                .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
                .slice(0, 6);
            if (!list.length) throw new Error('no repos');
            grid.innerHTML = list.map((r) => `
                <a class="gh-card" href="${escapeHtml(r.html_url)}" target="_blank" rel="noopener">
                    <h3>${escapeHtml(prettyName(r.name))}</h3>
                    <p>${escapeHtml(r.description || 'Source code and documentation on GitHub.')}</p>
                    <div class="gh-meta">
                        ${r.language ? `<span class="gh-lang" style="--lang-color:${LANG_COLORS[r.language] || 'var(--accent)'}">${escapeHtml(r.language)}</span>` : ''}
                        ${r.stargazers_count ? `<span>★ ${r.stargazers_count}</span>` : ''}
                        <span>Updated ${timeAgo(r.pushed_at)}</span>
                    </div>
                </a>`).join('');
        };

        // Show cached data instantly (if fresh), then refresh
        try {
            const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
            if (cached && Date.now() - cached.t < 30 * 60 * 1000) {
                render(cached.data);
                return;
            }
        } catch (e) { /* storage unavailable */ }

        try {
            const res = await fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`, {
                headers: { Accept: 'application/vnd.github+json' }
            });
            if (!res.ok) throw new Error(res.status);
            const data = await res.json();
            render(data);
            try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data })); } catch (e) { /* ignore */ }
        } catch (err) {
            grid.innerHTML = `
                <a class="gh-card" href="https://github.com/${user}?tab=repositories" target="_blank" rel="noopener" style="grid-column:1/-1;align-items:center;justify-content:center;text-align:center;min-height:auto">
                    <h3>Browse all my repositories on GitHub ↗</h3>
                    <p>Live activity couldn't load right now.</p>
                </a>`;
        }
    }


    /* ---------- 3. Project filters ---------- */
    function initProjectFilters() {
        const buttons = document.querySelectorAll('[data-pfilter]');
        const cards = document.querySelectorAll('.project-card[data-tags]');
        if (!buttons.length || !cards.length) return;

        // Show how many projects each filter has
        buttons.forEach((btn) => {
            const f = btn.dataset.pfilter;
            const n = f === 'all' ? cards.length
                : [...cards].filter((c) => c.dataset.tags.split(' ').includes(f)).length;
            btn.insertAdjacentHTML('beforeend', `<span class="filter-count">${n}</span>`);
            if (n === 0) btn.remove();
        });

        const apply = (f) => {
            document.querySelectorAll('[data-pfilter]').forEach((b) => {
                const on = b.dataset.pfilter === f;
                b.classList.toggle('active', on);
                b.setAttribute('aria-pressed', on);
            });
            cards.forEach((card) => {
                const show = f === 'all' || card.dataset.tags.split(' ').includes(f);
                card.classList.toggle('is-hidden', !show);
                if (show) card.classList.add('visible');
            });
        };

        document.querySelectorAll('[data-pfilter]').forEach((btn) => {
            btn.addEventListener('click', () => {
                apply(btn.dataset.pfilter);
                const url = new URL(location.href);
                if (btn.dataset.pfilter === 'all') url.searchParams.delete('filter');
                else url.searchParams.set('filter', btn.dataset.pfilter);
                history.replaceState(null, '', url);
            });
        });

        const initial = new URLSearchParams(location.search).get('filter');
        if (initial && document.querySelector(`[data-pfilter="${CSS.escape(initial)}"]`)) apply(initial);
    }


    /* ---------- 4. Contact form ---------- */
    function initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;
        const status = document.getElementById('formStatus');
        const button = form.querySelector('button[type="submit"]');

        const setStatus = (msg, type) => {
            status.textContent = msg;
            status.className = 'form-status' + (type ? ' ' + type : '');
        };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = new FormData(form);
            const name = (data.get('name') || '').trim();
            const email = (data.get('email') || '').trim();
            const message = (data.get('message') || '').trim();

            if (!name || !email || !message) {
                setStatus('Please fill in your name, email and message.', 'err');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                setStatus('Please enter a valid email address.', 'err');
                return;
            }
            if (data.get('_honey')) return; // bot

            data.set('_replyto', email);
            data.set('_subject', `Portfolio: ${data.get('reason')} (from ${name})`);
            button.disabled = true;
            button.textContent = 'Sending…';
            setStatus('');

            try {
                const res = await fetch(`https://formsubmit.co/ajax/${EMAIL}`, {
                    method: 'POST',
                    headers: { Accept: 'application/json' },
                    body: data
                });
                const json = await res.json().catch(() => ({}));
                if (!res.ok || json.success === 'false' || json.success === false) throw new Error(json.message || res.status);
                form.reset();
                setStatus('Thanks! Your message was sent. I usually reply within 24 hours.', 'ok');
            } catch (err) {
                const body = encodeURIComponent(`${message}\n\n${name}\n${email}`);
                const subject = encodeURIComponent(`Portfolio: ${data.get('reason')}`);
                status.className = 'form-status err';
                status.innerHTML = `Couldn't send right now. <a href="mailto:${EMAIL}?subject=${subject}&body=${body}" style="text-decoration:underline">Email me directly instead</a>.`;
            } finally {
                button.disabled = false;
                button.textContent = 'Send message';
            }
        });
    }


    /* ---------- 5. Command menu ---------- */
    function initCommandMenu() {
        const actions = document.querySelector('.nav-actions');
        if (!actions) return;

        const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
        const trigger = document.createElement('button');
        trigger.className = 'cmdk-trigger';
        trigger.type = 'button';
        trigger.setAttribute('aria-label', 'Open quick search');
        trigger.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <kbd>${isMac ? '⌘' : 'Ctrl'} K</kbd>`;
        actions.insertBefore(trigger, actions.firstChild);

        const go = (href) => () => { location.href = href; };
        const open = (href) => () => { window.open(href, '_blank', 'noopener'); };
        const items = [
            { g: 'Pages', t: 'Home', run: go('index.html') },
            { g: 'Pages', t: 'About', run: go('about.html') },
            { g: 'Pages', t: 'Projects', run: go('projects.html') },
            { g: 'Pages', t: 'Publications', run: go('publications.html') },
            { g: 'Pages', t: 'Skills', run: go('skills.html') },
            { g: 'Pages', t: 'Certificates', run: go('certificates.html') },
            { g: 'Pages', t: 'Contact', run: go('contact.html') },
            { g: 'Projects', t: 'PharmaGuard AI', k: 'blockchain pharma recall agents nestjs', run: open('https://github.com/kalavalashivaharikowshik/pharmaguard-ai') , s: 'GitHub' },
            { g: 'Projects', t: 'YieldSense AI', k: 'crop yield agriculture azure fastapi', run: open('https://github.com/kalavalashivaharikowshik/YieldSense-AI'), s: 'GitHub' },
            { g: 'Projects', t: 'DR Explainable AI System', k: 'diabetic retinopathy grad-cam vision', run: open('https://github.com/kalavalashivaharikowshik/DR-Explainable-AI-System'), s: 'GitHub' },
            { g: 'Projects', t: 'MIMIC NLP Explainable AI', k: 'icu biobert shap lime nlp', run: open('https://github.com/kalavalashivaharikowshik/mimic-nlp-explainable-ai'), s: 'GitHub' },
            { g: 'Projects', t: 'Plant Disease Detection', k: 'triton llm ollama agriculture', run: open('https://github.com/kalavalashivaharikowshik/plant-disease-detection-triton'), s: 'GitHub' },
            { g: 'Research', t: 'TamilNews Inspector (IEEE)', k: 'paper fake news publication', run: open('https://ieeexplore.ieee.org/document/11308027'), s: 'IEEE Xplore' },
            { g: 'Actions', t: 'Copy email address', k: 'mail contact', run: () => copyText(EMAIL, 'Email copied to clipboard'), s: EMAIL },
            { g: 'Actions', t: 'Download resume', k: 'cv pdf', run: go('assets/resume.pdf') },
            { g: 'Actions', t: 'Toggle dark / light mode', k: 'theme', run: () => document.getElementById('themeToggle')?.click() },
            { g: 'Links', t: 'LinkedIn', run: open('https://www.linkedin.com/in/kalavala-shiva-hari-kowshik-22b60b290'), s: '↗' },
            { g: 'Links', t: 'GitHub', run: open(`https://github.com/${GITHUB_USER}`), s: '↗' }
        ];

        const backdrop = document.createElement('div');
        backdrop.className = 'cmdk-backdrop';
        backdrop.innerHTML = `
            <div class="cmdk-panel" role="dialog" aria-modal="true" aria-label="Quick search">
                <input class="cmdk-input" type="text" placeholder="Search pages, projects, actions…" aria-label="Search" autocomplete="off" spellcheck="false">
                <ul class="cmdk-list" role="listbox"></ul>
                <div class="cmdk-footer"><span>↑↓ to move</span><span>↵ to open</span><span>Esc to close</span></div>
            </div>`;
        document.body.appendChild(backdrop);

        const input = backdrop.querySelector('.cmdk-input');
        const list = backdrop.querySelector('.cmdk-list');
        let filtered = items;
        let active = 0;

        const draw = () => {
            const q = input.value.trim().toLowerCase();
            filtered = items.filter((it) => !q || `${it.t} ${it.g} ${it.k || ''}`.toLowerCase().includes(q));
            active = Math.min(active, Math.max(filtered.length - 1, 0));
            if (!filtered.length) {
                list.innerHTML = '<li class="cmdk-empty">No results</li>';
                return;
            }
            let html = '';
            let lastGroup = '';
            filtered.forEach((it, i) => {
                if (it.g !== lastGroup) {
                    html += `<li class="cmdk-group" role="presentation">${it.g}</li>`;
                    lastGroup = it.g;
                }
                html += `<li class="cmdk-item${i === active ? ' active' : ''}" role="option" aria-selected="${i === active}" data-i="${i}">
                    <span>${escapeHtml(it.t)}</span>${it.s ? `<small>${escapeHtml(it.s)}</small>` : ''}</li>`;
            });
            list.innerHTML = html;
            list.querySelector('.cmdk-item.active')?.scrollIntoView({ block: 'nearest' });
        };

        let lastFocus = null;
        const show = () => {
            lastFocus = document.activeElement;
            backdrop.classList.add('open');
            input.value = '';
            active = 0;
            draw();
            setTimeout(() => input.focus(), 10);
        };
        const hide = () => {
            backdrop.classList.remove('open');
            lastFocus?.focus?.();
        };
        const runActive = () => {
            const it = filtered[active];
            if (!it) return;
            hide();
            it.run();
        };

        trigger.addEventListener('click', show);
        backdrop.addEventListener('click', (e) => { if (e.target === backdrop) hide(); });
        input.addEventListener('input', () => { active = 0; draw(); });
        list.addEventListener('mousemove', (e) => {
            const li = e.target.closest('.cmdk-item');
            if (li && +li.dataset.i !== active) { active = +li.dataset.i; draw(); }
        });
        list.addEventListener('click', (e) => {
            const li = e.target.closest('.cmdk-item');
            if (li) { active = +li.dataset.i; runActive(); }
        });

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                backdrop.classList.contains('open') ? hide() : show();
                return;
            }
            if (!backdrop.classList.contains('open')) return;
            if (e.key === 'Escape') { e.preventDefault(); hide(); }
            else if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % Math.max(filtered.length, 1); draw(); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + filtered.length) % Math.max(filtered.length, 1); draw(); }
            else if (e.key === 'Enter') { e.preventDefault(); runActive(); }
        });
    }


    document.addEventListener('DOMContentLoaded', () => {
        loadGitHub();
        initProjectFilters();
        initContactForm();
        initCommandMenu();
    });
})();
