function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    const icon = document.getElementById('theme-icon');
    
    html.setAttribute('data-theme', newTheme);
    icon.textContent = newTheme === 'dark' ? 'Dark Mode' : 'Light Mode';
    
    localStorage.setItem('theme', newTheme);
}

// Load saved theme or default to dark
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
document.getElementById('theme-icon').textContent = 
    savedTheme === 'dark' ? 'Dark Mode' : 'Light Mode';

// Binary rain generator (random falling 1s and 0s)
(function () {
    function createBinaryRain(containerId = 'binary-bg', count = 90) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Clear existing bits
        container.innerHTML = '';

        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        for (let i = 0; i < count; i++) {
            const bit = document.createElement('div');
            bit.className = 'bit';
            bit.textContent = Math.random() < 0.5 ? '0' : '1';

            // random horizontal position (0 - 100vw)
            const left = Math.random() * 100;
            bit.style.left = left + 'vw';

            // random font size
            const size = 10 + Math.random() * 26; // px
            bit.style.fontSize = size + 'px';

            // random animation duration and delay (negative delay to stagger)
            const duration = 6 + Math.random() * 12; // seconds
            const delay = -Math.random() * duration;
            bit.style.animationDuration = `${duration}s, ${duration}s`;
            bit.style.animationDelay = `${delay}s, ${delay}s`;

            // slight rotation for variety
            const rot = (Math.random() - 0.5) * 20;
            bit.style.transform = `rotate(${rot}deg)`;

            container.appendChild(bit);
        }
    }

    // init on load
    document.addEventListener('DOMContentLoaded', function () {
        createBinaryRain('binary-bg', 100);
    });

    // rebuild on resize (throttle short)
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            createBinaryRain('binary-bg', Math.min(180, Math.floor((window.innerWidth / 8))));
        }, 200);
    });
})();

/*
  SPA-style article loader:
  - fetches an article fragment (full HTML file under /articles/)
  - extracts the <main> content, strips <link>/<script>/<header> and #binary-bg
  - rewrites relative ../ paths for images/links so they resolve from index.html root
  - injects into #article-view, hides #articles-view, and updates history
*/
async function openArticle(path) {
    const articlesView = document.getElementById('articles-view');
    const articleView = document.getElementById('article-view');
    if (!articlesView || !articleView) return;

    // fetch article file (must be served over HTTP(S) — see note below)
    let res;
    try {
        res = await fetch(path, { cache: 'no-store' });
    } catch (err) {
        console.error('fetch failed', err);
        alert('Unable to load article. If you are opening index.html from the file system, run a local HTTP server (Live Server, python -m http.server, or npx http-server).');
        return;
    }
    if (!res.ok) {
        console.error('fetch returned not ok', res.status, path);
        alert('Unable to load article: ' + res.status);
        return;
    }

    try {
        const text = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        // find main content (article pages use <main class="article-container">)
        const main = doc.querySelector('main.article-container') || doc.querySelector('main') || doc.body;
        if (!main) throw new Error('Article main not found');

        // clone and sanitize fetched content
        const contentClone = main.cloneNode(true);
        contentClone.querySelectorAll('link, script, header, #binary-bg').forEach(n => n.remove());

        // rewrite relative asset paths (../something -> something) so images/styles referenced in article resolve
        Array.from(contentClone.querySelectorAll('[src], [href]')).forEach(el => {
            if (el.hasAttribute('src')) {
                const v = el.getAttribute('src');
                if (v && v.startsWith('../')) el.setAttribute('src', v.replace(/^(\.\.\/)+/, ''));
            }
            if (el.hasAttribute('href')) {
                const v = el.getAttribute('href');
                if (v && v.startsWith('../')) el.setAttribute('href', v.replace(/^(\.\.\/)+/, ''));
            }
        });

        // build wrapper with Return Home button
        const wrapper = document.createElement('div');
        wrapper.className = 'article-container';
        const backBtn = document.createElement('button');
        backBtn.className = 'back-link';
        backBtn.textContent = '← Return Home';
        backBtn.onclick = closeArticle;
        wrapper.appendChild(backBtn);
        wrapper.appendChild(contentClone);

        // inject and toggle views
        articleView.innerHTML = '';
        articleView.appendChild(wrapper);
        articlesView.style.display = 'none';
        articleView.style.display = 'block';

        // update history so browser back works and direct links are possible
        history.pushState({ article: path }, '', '?article=' + encodeURIComponent(path));

        // scroll to top of content area
        window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (err) {
        console.error(err);
        alert('Unable to parse article content.');
    }
}

function closeArticle() {
    const articlesView = document.getElementById('articles-view');
    const articleView = document.getElementById('article-view');
    if (!articlesView || !articleView) return;
    articleView.style.display = 'none';
    articleView.innerHTML = '';
    articlesView.style.display = 'block';
    history.pushState({}, '', location.pathname); // clear query
    window.scrollTo({ top: 0, behavior: 'instant' });
}

// handle back/forward navigation
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.article) {
        openArticle(e.state.article);
    } else {
        // no article state -> ensure main view is visible
        const articleView = document.getElementById('article-view');
        const articlesView = document.getElementById('articles-view');
        if (articleView && articlesView) {
            articleView.style.display = 'none';
            articleView.innerHTML = '';
            articlesView.style.display = 'block';
        }
    }
});

// on initial load, open article if ?article=... present
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    const a = params.get('article');
    if (a) openArticle(a);
});