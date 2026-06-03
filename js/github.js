/* ============================================================
   GITHUB API INTEGRATION — Bento Card Format
   Fetches repos, stats, and languages from GitHub
   ============================================================ */

const GITHUB_USERNAME = 'KunjanMinama';
const GITHUB_API = 'https://api.github.com';
const CACHE_KEY = 'github_data_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Language colors
const LANG_COLORS = {
  Python: '#3572A5',
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Java: '#b07219',
  Jupyter: '#DA5B0B',
  'Jupyter Notebook': '#DA5B0B',
  Shell: '#89e051',
  Dockerfile: '#384d54',
  Makefile: '#427819',
  default: '#818cf8',
};

function getLanguageColor(lang) {
  return LANG_COLORS[lang] || LANG_COLORS.default;
}

function getCachedData() {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < CACHE_DURATION) {
        return data.payload;
      }
    }
  } catch (e) { /* ignore */ }
  return null;
}

function setCachedData(payload) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      payload,
    }));
  } catch (e) { /* ignore */ }
}

async function fetchGitHubData() {
  const cached = getCachedData();
  if (cached) return cached;

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`${GITHUB_API}/users/${GITHUB_USERNAME}`),
      fetch(`${GITHUB_API}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30`),
    ]);

    if (!userRes.ok || !reposRes.ok) throw new Error('API rate limited');

    const user = await userRes.json();
    const repos = await reposRes.json();

    const payload = { user, repos };
    setCachedData(payload);
    return payload;
  } catch (error) {
    console.warn('GitHub API error, using fallback:', error);
    return null;
  }
}

function computeLanguageStats(repos) {
  const langCounts = {};
  repos.forEach((repo) => {
    if (repo.language && !repo.fork) {
      langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
    }
  });

  const total = Object.values(langCounts).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, count]) => ({
      lang,
      count,
      pct: ((count / total) * 100).toFixed(1),
      color: getLanguageColor(lang),
    }));

  return sorted;
}

/* ---- Render GitHub Stats (mini bento format) ---- */
function renderGitHubStats(user, repos) {
  const container = document.getElementById('github-stats');
  if (!container) return;

  const ownRepos = repos.filter((r) => !r.fork);
  const totalStars = ownRepos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const totalForks = ownRepos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
  const languages = new Set(ownRepos.map((r) => r.language).filter(Boolean));

  const stats = [
    { value: user.public_repos, label: 'Repos' },
    { value: totalStars, label: 'Stars' },
    { value: totalForks, label: 'Forks' },
    { value: languages.size, label: 'Langs' },
  ];

  container.innerHTML = stats
    .map(
      (s) => `
      <div class="github-stat-card glass-card">
        <div class="github-stat-value">${s.value}</div>
        <div class="github-stat-label">${s.label}</div>
      </div>
    `
    )
    .join('');
}

/* ---- Render GitHub Repos (mini cards) ---- */
function renderGitHubRepos(repos) {
  const container = document.getElementById('github-repos');
  if (!container) return;

  const featured = repos
    .filter((r) => !r.fork)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 6);

  container.innerHTML = featured
    .map(
      (repo) => `
      <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="github-repo-card glass-card">
        <div class="repo-name">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z"/>
          </svg>
          ${repo.name}
        </div>
        <div class="repo-description">${repo.description || 'No description.'}</div>
        <div class="repo-meta">
          ${
            repo.language
              ? `<span class="repo-meta-item">
                  <span class="repo-lang-dot" style="background: ${getLanguageColor(repo.language)}"></span>
                  ${repo.language}
                </span>`
              : ''
          }
          <span class="repo-meta-item">⭐ ${repo.stargazers_count}</span>
        </div>
      </a>
    `
    )
    .join('');
}

/* ---- Render Language Bar ---- */
function renderLanguageBar(repos) {
  const container = document.getElementById('github-languages');
  if (!container) return;

  const langStats = computeLanguageStats(repos);
  if (langStats.length === 0) return;

  const barSegments = langStats
    .map((l) => `<div class="lang-bar-segment" style="width: ${l.pct}%; background: ${l.color};"></div>`)
    .join('');

  const legendItems = langStats
    .map(
      (l) => `
      <span class="lang-legend-item">
        <span class="repo-lang-dot" style="background: ${l.color}"></span>
        ${l.lang} <span style="color: var(--text-muted);">${l.pct}%</span>
      </span>
    `
    )
    .join('');

  // Preserve the existing label
  const existingLabel = container.querySelector('.bento-label');
  const labelHTML = existingLabel ? existingLabel.outerHTML : '';

  container.innerHTML = `
    ${labelHTML}
    <div class="lang-bar-track">${barSegments}</div>
    <div class="lang-bar-legend">${legendItems}</div>
  `;
}

/* ---- Fallback ---- */
function renderFallback() {
  const statsContainer = document.getElementById('github-stats');
  const reposContainer = document.getElementById('github-repos');
  const langContainer = document.getElementById('github-languages');

  if (statsContainer) {
    const fallbackStats = [
      { value: '10+', label: 'Repos' },
      { value: '—', label: 'Stars' },
      { value: '—', label: 'Forks' },
      { value: '5+', label: 'Langs' },
    ];
    statsContainer.innerHTML = fallbackStats
      .map(
        (s) => `
        <div class="github-stat-card glass-card">
          <div class="github-stat-value">${s.value}</div>
          <div class="github-stat-label">${s.label}</div>
        </div>
      `
      )
      .join('');
  }

  if (reposContainer) {
    reposContainer.innerHTML = `
      <a href="https://github.com/${GITHUB_USERNAME}" target="_blank" rel="noopener noreferrer" class="github-repo-card glass-card" style="grid-column: 1 / -1; text-align: center; padding: 32px;">
        <div class="repo-name" style="justify-content: center;">Visit GitHub Profile →</div>
        <div class="repo-description" style="max-width: 300px; margin: 6px auto 0;">View all repositories and activity on GitHub.</div>
      </a>
    `;
  }

  if (langContainer) {
    const existingLabel = langContainer.querySelector('.bento-label');
    langContainer.innerHTML = existingLabel ? existingLabel.outerHTML : '';
  }
}

// Initialize
async function initGitHub() {
  const data = await fetchGitHubData();
  if (data) {
    renderGitHubStats(data.user, data.repos);
    renderGitHubRepos(data.repos);
    renderLanguageBar(data.repos);
  } else {
    renderFallback();
  }
}

document.addEventListener('DOMContentLoaded', initGitHub);
