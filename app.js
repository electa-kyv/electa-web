const ELECTION_DATE = new Date('2025-10-18T08:00:00+11:00');

let CANDIDATE_DATA = {};
let CANDIDATE_METADATA = {};

async function loadCandidates() {
  try {
    const response = await fetch('data/candidates.json');
    if (!response.ok) throw new Error('Failed to load candidates');
    const payload = await response.json();
    if (payload && typeof payload === 'object') {
      CANDIDATE_METADATA = payload.metadata || {};
      CANDIDATE_DATA = payload.candidates || payload;
    } else {
      CANDIDATE_METADATA = {};
      CANDIDATE_DATA = {};
    }
  } catch (error) {
    console.error('Error loading candidates:', error);
    CANDIDATE_DATA = {};
    CANDIDATE_METADATA = {};
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await includePartials();
  bindMenuInteractions();
  await loadCandidates();
  renderCandidateMetadata();
  initHomePage();
  renderElectorateCandidates();
  initPartyFilter();
  renderMyVotes();
  bindGlobalActions();
  initProfilePage();
});

function includePartials() {
  const includeElements = document.querySelectorAll('[data-include]');
  const loaders = Array.from(includeElements).map((el) => {
    const file = `${el.getAttribute('data-include')}.html`;
    return fetch(file)
      .then((response) => response.text())
      .then((html) => {
        el.innerHTML = html;
      })
      .catch((error) => console.error(`Failed to load ${file}`, error));
  });
  return Promise.all(loaders);
}

function bindMenuInteractions() {
  const toggleBtn = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!toggleBtn || !mobileMenu) return;
  toggleBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
  });
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

function initHomePage() {
  const findBtn = document.getElementById('findElectorateBtn');
  if (findBtn) findBtn.addEventListener('click', () => {
    window.location.href = 'electorates.html';
  });

  const monthsEl = document.getElementById('countdownMonths');
  const weeksEl = document.getElementById('countdownWeeks');
  const daysEl = document.getElementById('countdownDays');
  const meta = document.getElementById('countdownMeta');
  if (!monthsEl || !weeksEl || !daysEl || !meta) return;

  monthsEl.textContent = '—';
  weeksEl.textContent = '—';
  daysEl.textContent = '—';
  meta.textContent = 'Election day TBC. Come back later for the countdown.';
}

function formatDate(date) {
  return date.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function generateCandidateId(electorate, candidateName) {
  const electorateLower = electorate.toLowerCase();
  const nameKebab = candidateName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${electorateLower}-${nameKebab}`;
}

function normalizePartyName(party) {
  if (!party) return '';
  const partyLower = party.toLowerCase().trim();
  if (partyLower.startsWith('group ') || partyLower.startsWith('group_') || partyLower === 'ungrouped') {
    return 'Independant';
  }
  return party;
}

function getUniquePartiesForElectorate(electorate) {
  const candidates = CANDIDATE_DATA[electorate] || [];
  const partySet = new Set();
  candidates.forEach(candidate => {
    const normalized = normalizePartyName(candidate.party);
    if (normalized) partySet.add(normalized);
  });
  return Array.from(partySet).sort();
}

function renderElectorateCandidates(selectedParty = '') {
  const container = document.querySelector('.candidate-list[data-electorate]');
  if (!container) return;
  const electorate = container.dataset.electorate;
  let candidates = CANDIDATE_DATA[electorate] || [];
  const saved = getSavedVotes();
  
  // Filter by party if selected
  if (selectedParty) {
    candidates = candidates.filter(candidate => {
      const normalized = normalizePartyName(candidate.party);
      return normalized === selectedParty;
    });
  }
  
  if (candidates.length === 0) {
    container.innerHTML = '<p class="empty-state">No candidates available for this electorate.</p>';
    return;
  }
  container.innerHTML = candidates.map((candidate) => {
    const isSaved = saved.some((vote) => vote.name === candidate.name && vote.electorate === electorate);
    const candidateId = generateCandidateId(electorate, candidate.name);
    const displayParty = normalizePartyName(candidate.party);
    return `
      <article class="candidate-card">
        <h3>${candidate.name}</h3>
        <p class="vote-meta">${displayParty}${candidate.profession ? ` · ${candidate.profession}` : ''}</p>
        <p><strong>Bio:</strong> ${candidate.bio}</p>
        <div class="candidate-actions">
          <a
            href="profile.html?candidate=${encodeURIComponent(candidateId)}"
            class="view-profile-btn"
          >
            View Profile
          </a>
          <button
            class="save-btn${isSaved ? ' saved' : ''}"
            data-name="${candidate.name}"
            data-party="${candidate.party}"
            data-electorate="${electorate}"
          >
            ${isSaved ? 'Saved ✓' : 'Save Vote'}
          </button>
        </div>
      </article>
    `;
  }).join('');
}

function populatePartyFilter() {
  const filterSelect = document.getElementById('partyFilter');
  if (!filterSelect) return;
  const electorate = filterSelect.dataset.electorate;
  const parties = getUniquePartiesForElectorate(electorate);
  
  // Clear existing options except "All Parties"
  filterSelect.innerHTML = '<option value="">All Parties</option>';
  
  // Add party options
  parties.forEach(party => {
    const option = document.createElement('option');
    option.value = party;
    option.textContent = party;
    filterSelect.appendChild(option);
  });
}

function initPartyFilter() {
  const filterSelect = document.getElementById('partyFilter');
  if (!filterSelect) return;
  
  populatePartyFilter();
  
  filterSelect.addEventListener('change', (e) => {
    const selectedParty = e.target.value;
    renderElectorateCandidates(selectedParty);
  });
}

function renderCandidateMetadata() {
  const targets = document.querySelectorAll('[data-candidate-meta]');
  if (targets.length === 0) return;
  const pieces = [];
  if (CANDIDATE_METADATA.lastUpdated) pieces.push(`AEC data updated ${CANDIDATE_METADATA.lastUpdated}`);
  const lastChecked = CANDIDATE_METADATA.lastCheckedBy;
  if (lastChecked?.date) {
    const checker = lastChecked.entity || 'Electa';
    pieces.push(`${checker} checked on ${lastChecked.date}`);
  }
  if (CANDIDATE_METADATA.source) pieces.push(`Source: ${CANDIDATE_METADATA.source}`);
  const message = pieces.join(' · ') || 'Candidate information based on public data sources.';
  targets.forEach((target) => target.textContent = message);
}

function bindGlobalActions() {
  document.addEventListener('click', (event) => {
    if (event.target.matches('.save-btn')) {
      event.preventDefault();
      handleSaveVote(event.target);
    }
    if (event.target.matches('.remove-vote-btn')) {
      event.preventDefault();
      handleRemoveVote(event.target);
    }
  });
}

function handleSaveVote(button) {
  const name = button.dataset.name;
  const party = button.dataset.party;
  const electorate = button.dataset.electorate;
  if (!name || !party || !electorate) return;
  const saved = getSavedVotes();
  const alreadySaved = saved.some((vote) => vote.name === name && vote.electorate === electorate);
  if (!alreadySaved) saved.push({ name, party, electorate });
  setSavedVotes(saved);
  button.classList.add('saved');
  button.textContent = 'Saved ✓';
  renderMyVotes();
  // Preserve the current filter when re-rendering
  const filterSelect = document.getElementById('partyFilter');
  const selectedParty = filterSelect ? filterSelect.value : '';
  renderElectorateCandidates(selectedParty);
}

function handleRemoveVote(button) {
  const name = button.dataset.name;
  const electorate = button.dataset.electorate;
  if (!name || !electorate) return;
  const updated = getSavedVotes().filter((vote) => !(vote.name === name && vote.electorate === electorate));
  setSavedVotes(updated);
  renderMyVotes();
  // Preserve the current filter when re-rendering
  const filterSelect = document.getElementById('partyFilter');
  const selectedParty = filterSelect ? filterSelect.value : '';
  renderElectorateCandidates(selectedParty);
}

function renderMyVotes() {
  const list = document.getElementById('myVotesList');
  if (!list) return;
  const votes = getSavedVotes();
  if (votes.length === 0) {
    list.innerHTML = '<p class="empty-state">You have not saved any votes yet.</p>';
    return;
  }
  list.innerHTML = votes.map((vote) => `
    <article class="my-vote-card">
      <h3>${vote.name}</h3>
      <p class="vote-meta">${vote.party} · ${vote.electorate}</p>
      <button
        class="remove-vote-btn"
        data-name="${vote.name}"
        data-electorate="${vote.electorate}"
      >
        Remove
      </button>
    </article>
  `).join('');
}

function getSavedVotes() {
  try {
    const stored = localStorage.getItem('myVotes');
    return stored ? JSON.parse(stored) : [];
  } catch (_error) {
    return [];
  }
}

function setSavedVotes(votes) {
  localStorage.setItem('myVotes', JSON.stringify(votes));
}

function findCandidateById(candidateId) {
  for (const [electorate, candidates] of Object.entries(CANDIDATE_DATA)) {
    for (const candidate of candidates) {
      const id = generateCandidateId(electorate, candidate.name);
      if (id === candidateId) {
        return { ...candidate, electorate };
      }
    }
  }
  return null;
}

function getElectoratePageName(electorate) {
  return `${electorate.toLowerCase()}.html`;
}

async function initProfilePage() {
  const profileContainer = document.getElementById('profileContainer');
  if (!profileContainer) return;

  // Ensure candidates are loaded
  if (Object.keys(CANDIDATE_DATA).length === 0) {
    await loadCandidates();
  }

  const urlParams = new URLSearchParams(window.location.search);
  const candidateId = urlParams.get('candidate');

  if (!candidateId) {
    profileContainer.innerHTML = `
      <div class="page-section">
        <h1>Candidate Not Found</h1>
        <p class="section-intro">No candidate ID was provided in the URL.</p>
        <a href="electorates.html" class="primary-btn">Back to Electorates</a>
      </div>
    `;
    return;
  }

  const candidate = findCandidateById(candidateId);

  if (!candidate) {
    profileContainer.innerHTML = `
      <div class="page-section">
        <h1>Candidate Not Found</h1>
        <p class="section-intro">The requested candidate profile could not be found.</p>
        <a href="electorates.html" class="primary-btn">Back to Electorates</a>
      </div>
    `;
    return;
  }

  const imagePath = `data/candidate-images/${candidateId}.jpg`;
  const defaultImagePath = 'data/candidate-images/default.jpg';
  const electoratePage = getElectoratePageName(candidate.electorate);

  profileContainer.innerHTML = `
    <section class="page-section">
      <div class="profile-header">
        <div class="profile-image-container">
          <img 
            id="profileImage" 
            src="${imagePath}" 
            alt="${candidate.name}"
            onerror="this.src='${defaultImagePath}'"
          >
        </div>
        <div class="profile-basic-info">
          <h1>${candidate.name}</h1>
          <p class="profile-party">${candidate.party}</p>
          <p class="profile-electorate">${candidate.electorate}</p>
        </div>
      </div>

      <div class="profile-content">
        <div class="profile-section">
          <h2>Bio / Key Issues</h2>
          <p>${candidate.bio || 'No biography available for this candidate.'}</p>
        </div>

        ${candidate.profession ? `
        <div class="profile-section">
          <h2>Profession</h2>
          <p>${candidate.profession}</p>
        </div>
        ` : ''}

        ${candidate.policyLinks && candidate.policyLinks.length > 0 ? `
        <div class="profile-section">
          <h2>Policy Links</h2>
          <ul>
            ${candidate.policyLinks.map(link => `
              <li><a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label || link.url}</a></li>
            `).join('')}
          </ul>
        </div>
        ` : ''}

        ${candidate.socialLinks && candidate.socialLinks.length > 0 ? `
        <div class="profile-section">
          <h2>Social Links</h2>
          <ul>
            ${candidate.socialLinks.map(link => `
              <li><a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label || link.url}</a></li>
            `).join('')}
          </ul>
        </div>
        ` : ''}

        ${candidate.contactDetails ? `
        <div class="profile-section">
          <h2>Contact Details</h2>
          <p>${candidate.contactDetails}</p>
        </div>
        ` : ''}
      </div>

      <div class="profile-actions">
        <a href="${electoratePage}" class="primary-btn">Back to Candidates</a>
      </div>

      <div class="profile-disclaimer">
        <p>Information provided by Electa is for general informational purposes only, sourced from publicly available material, and may not fully reflect the views, policies, or positions of any candidate or political party. Electa is an independent, non-partisan platform and does not endorse or promote any candidate or political party. Users should independently verify information before making electoral decisions.</p>
        <p class="profile-disclaimer-link">
          Something incorrect or missing? 
          <a href="contribute.html" class="profile-link">Add or correct info here.</a>
        </p>
      </div>
    </section>
  `;
}
