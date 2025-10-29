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

    // ensure absolute URL resolution relative to site root
    const base = new URL('.', location.origin + location.pathname).href;
    const url = new URL(path, base).href;
    console.log('openArticle -> fetch', path, 'resolved to', url);

    let res;
    try {
        res = await fetch(url, { cache: 'no-store' });
    } catch (err) {
        console.error('fetch failed', err);
        alert('Unable to load article. If opening from the filesystem, run a local HTTP server (Live Server, python -m http.server, or npx http-server).');
        return;
    }

    if (!res.ok) {
        console.error('fetch returned', res.status, res.statusText, url);
        alert('Unable to load article: ' + res.status);
        return;
    }

    try {
        const text = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        // prefer a main.article-container, fall back to entire body
        const main = doc.querySelector('main.article-container') || doc.querySelector('main') || null;

        const wrapper = document.createElement('div');
        // don't use .article-container here (inner fetched content already has that)
        wrapper.className = 'article-frame';

        // Return Home button
        const returnBtn = document.createElement('button');
        returnBtn.className = 'back-link';
        returnBtn.textContent = '← Return Home';
        returnBtn.onclick = closeArticle;

        if (main) {
            const contentClone = main.cloneNode(true);
            contentClone.querySelectorAll('link, script, header, #binary-bg').forEach(n => n.remove());
            // fix ../ asset paths
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
            // insert the Return Home button *inside* the article container so it aligns with the article's left edge
            // (the CSS .article-container > .back-link will style/position it correctly)
            contentClone.insertBefore(returnBtn, contentClone.firstChild);
            
            wrapper.appendChild(contentClone);
        } else {
            // fallback: inject the raw body so you can see what was returned
            console.warn('main not found in fetched doc, injecting raw response for debugging');
            const temp = document.createElement('div');
            temp.innerHTML = text;
            // remove unsafe elements
            temp.querySelectorAll('script, link, header, #binary-bg').forEach(n => n.remove());
            wrapper.appendChild(temp);
        }

        articleView.innerHTML = '';
        articleView.appendChild(wrapper);
        articlesView.style.display = 'none';
        articleView.style.display = 'block';
    // mark body so CSS can hide sidebar elements reliably when an article is open
    document.body.classList.add('article-open');
    // show scroll-to-top button when article is open and update CSS placement
    const st = document.getElementById('scroll-top');
    if (st) {
        st.style.display = 'flex';
        positionScrollButton();
    }

        history.pushState({ article: path }, '', '?article=' + encodeURIComponent(path));
        window.scrollTo({ top: 0, behavior: 'instant' });

    } catch (err) {
        console.error('parse/inject failed', err);
        alert('Unable to parse article content. See console for details.');
    }
}

function closeArticle() {
    const articlesView = document.getElementById('articles-view');
    const articleView = document.getElementById('article-view');
    if (!articlesView || !articleView) return;
    articleView.style.display = 'none';
    articleView.innerHTML = '';
    articlesView.style.display = 'block';
    // show the sidebar tag filter when returning to the articles list
    document.body.classList.remove('article-open');
    // hide scroll-to-top when returning to articles list
    const st = document.getElementById('scroll-top');
    if (st) st.style.display = 'none';
    // clear any CSS variables used for placement
    if (st) {
        st.style.removeProperty('--scroll-left');
        st.style.removeProperty('--scroll-right');
    }
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
                document.body.classList.remove('article-open');
        }
    }
});

// on initial load, open article if ?article=... present
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    const a = params.get('article');
    // ensure scroll-top is hidden by default
    const st = document.getElementById('scroll-top');
    if (st) st.style.display = 'none';
    // initialize tag filters UI
    try{ initTagFilters(); }catch(e){console.warn('initTagFilters failed', e)}
    // show/hide tag filter depending on whether an article is opened via query
    const tagFilter = document.getElementById('tag-filter');
    if (tagFilter) {
        if (a) document.body.classList.add('article-open'); else document.body.classList.remove('article-open');
    }
    if (a) openArticle(a);
});

// smooth scroll helper used by the floating button
function scrollToTop(){
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Position the scroll-top button 20px to the right of the article's right edge.
// Position the scroll-top button 40px to the right of the element at
// '#article-view > div > main > article'. If that would place the button off-screen,
// fall back to a fixed right offset.
function positionScrollButton(){
    const btn = document.getElementById('scroll-top');
    if (!btn) return;
    const selector = '#article-view > div > main > article';
    const article = document.querySelector(selector);
    const fallbackRight = 20;

    if (!article) {
        // No article found: use fallback right offset
        btn.style.removeProperty('--scroll-left');
        btn.style.setProperty('--scroll-right', fallbackRight + 'px');
        return;
    }

    const rect = article.getBoundingClientRect();
    const desiredLeft = Math.round(rect.right + 50); // 50px to the right of the <article> (was 40)
    const btnWidth = btn.offsetWidth || 44;

    // if placing at desiredLeft would overflow the viewport, fall back to right offset
    if (desiredLeft + btnWidth > window.innerWidth - 8) {
        btn.style.removeProperty('--scroll-left');
        btn.style.setProperty('--scroll-right', fallbackRight + 'px');
    } else {
        btn.style.setProperty('--scroll-left', desiredLeft + 'px');
        btn.style.removeProperty('--scroll-right');
    }
}

// Reposition on resize so the button stays 40px to the right of the article
window.addEventListener('resize', function(){
    // only reposition when article view is open
    const articleView = document.getElementById('article-view');
    if (articleView && articleView.style.display !== 'none') positionScrollButton();
});


// Tag filter helpers
let currentTagFilter = null;
function initTagFilters(){
    const listEl = document.getElementById('tag-filter-list');
    if (!listEl) return;

    // gather unique tags from article cards
    const tagEls = Array.from(document.querySelectorAll('.article-card .tag'));
    const tags = Array.from(new Set(tagEls.map(t => t.textContent.trim()).filter(Boolean)));
    tags.sort((a,b)=>a.localeCompare(b));

    // clear any existing
    listEl.innerHTML = '';
    tags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.type = 'button';
        btn.textContent = tag;
        btn.setAttribute('data-tag', tag);
        btn.onclick = () => {
            // single-select: if clicking same tag, clear; otherwise set
            if (currentTagFilter === tag) {
                clearFilter();
            } else {
                applyFilter(tag);
            }
        };
        listEl.appendChild(btn);
    });
}

function applyFilter(tag){
    currentTagFilter = tag;
    // mark active button
    document.querySelectorAll('#tag-filter-list .filter-btn').forEach(b=>{
        if (b.getAttribute('data-tag')===tag) b.classList.add('active'); else b.classList.remove('active');
    });

    // show/hide article cards
    document.querySelectorAll('.articles-grid .article-card').forEach(card => {
        const cardTags = Array.from(card.querySelectorAll('.tag')).map(t=>t.textContent.trim());
        const match = cardTags.some(t=>t.toLowerCase() === tag.toLowerCase());
        card.style.display = match ? '' : 'none';
    });

    // ensure main articles view visible (in case an article was open)
    const articlesView = document.getElementById('articles-view');
    const articleView = document.getElementById('article-view');
    if (articlesView){ articlesView.style.display = 'block'; }
    if (articleView){ articleView.style.display = 'none'; articleView.innerHTML = ''; }
    history.pushState({}, '', location.pathname); // clear query
    window.scrollTo({ top: 0, behavior: 'instant' });
}

function clearFilter(){
    currentTagFilter = null;
    document.querySelectorAll('#tag-filter-list .filter-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.articles-grid .article-card').forEach(card => card.style.display = '');
}