import destinations from './destinations.js';

document.addEventListener('DOMContentLoaded', () => {
  const mountPoint = document.getElementById('destination-page');
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('id'));
  const destination = destinations.find(item => item.id === id);

  if (!mountPoint) {
    return;
  }

  if (!destination) {
    document.title = 'Destination not found — WanderGuide';
    mountPoint.innerHTML = `
      <section class="detail-empty container">
        <h1>Destination not found</h1>
        <p>We couldn’t find that destination. It may have been moved or the link may be incorrect.</p>
        <a class="cta-button" href="../index.html">Back to home</a>
      </section>
    `;
    return;
  }

  document.title = `${destination.name} — WanderGuide`;

  const similarDestinations = destinations
    .filter(item => item.continent === destination.continent && item.id !== destination.id)
    .slice(0, 3);

  mountPoint.innerHTML = `
    <section class="detail-page__shell">
      <nav class="breadcrumb container" aria-label="Breadcrumb">
        <a href="../index.html">Home</a>
        <span aria-hidden="true">›</span>
        <a href="../index.html#destinations-section">Destinations</a>
        <span aria-hidden="true">›</span>
        <span>${escapeHtml(destination.name)}</span>
      </nav>

      <header class="destination-detail__hero" style="background-image: linear-gradient(rgba(10, 42, 67, 0.45), rgba(10, 42, 67, 0.7)), url('${destination.imageUrl}');">
        <div class="container destination-detail__hero-content">
          <p class="destination-detail__eyebrow">${escapeHtml(destination.continent)}</p>
          <h1>${escapeHtml(destination.name)}</h1>
          <p>${escapeHtml(destination.country)}</p>
        </div>
      </header>

      <section class="container destination-detail__section" aria-labelledby="overview-heading">
        <div class="detail-section-heading">
          <h2 id="overview-heading">Overview</h2>
          <a class="detail-back-link" href="../index.html#destinations-section">View all destinations</a>
        </div>
        <div class="destination-detail__overview">
          <div class="destination-detail__overview-main">
            <p class="destination-detail__description">${escapeHtml(destination.description)}</p>
            <div class="destination-detail__meta">
              <span><strong>Country:</strong> ${escapeHtml(destination.country)}</span>
              <span><strong>Continent:</strong> ${escapeHtml(destination.continent)}</span>
              <span><strong>Rating:</strong> ${destination.rating}</span>
              <span class="budget-badge budget-badge--${destination.budget}">${budgetLabel(destination.budget)}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="container destination-detail__section" aria-labelledby="info-heading">
        <h2 id="info-heading">Travel Info</h2>
        <div class="detail-info-grid">
          ${renderInfoCard('Best time to visit', destinationInfo(destination.id).bestTime)}
          ${renderInfoCard('Currency', destinationInfo(destination.id).currency)}
          ${renderInfoCard('Language', destinationInfo(destination.id).language)}
          ${renderInfoCard('Time zone', destinationInfo(destination.id).timeZone)}
        </div>
      </section>

      <section class="container destination-detail__section" aria-labelledby="tips-heading">
        <h2 id="tips-heading">Travel Tips</h2>
        <ul class="tips-list">
          ${destinationTips(destination).map(tip => `<li>${escapeHtml(tip)}</li>`).join('')}
        </ul>
      </section>

      <section class="container destination-detail__section" aria-labelledby="similar-heading">
        <h2 id="similar-heading">Similar Destinations</h2>
        <div class="similar-destinations-grid">
          ${similarDestinations.length > 0
            ? similarDestinations.map(renderSimilarDestinationCard).join('')
            : '<p class="detail-empty__note">No similar destinations available right now.</p>'}
        </div>
      </section>

      <div class="container destination-detail__back-wrap">
        <a class="cta-button" href="../index.html">Back to home</a>
      </div>
    </section>
  `;
});

function budgetLabel(budget) {
  if (budget === 'low') return 'Budget';
  if (budget === 'mid') return 'Mid-range';
  return 'Luxury';
}

function destinationInfo(id) {
  const infoMap = {
    1: { bestTime: 'April to June', currency: 'Euro (EUR)', language: 'Italian', timeZone: 'Central European Time (CET)' },
    2: { bestTime: 'March to May', currency: 'Japanese Yen (JPY)', language: 'Japanese', timeZone: 'Japan Standard Time (JST)' },
    3: { bestTime: 'May to September', currency: 'Peruvian Sol (PEN)', language: 'Spanish, Quechua', timeZone: 'Peru Time (PET)' },
    4: { bestTime: 'June to August', currency: 'Icelandic Krona (ISK)', language: 'Icelandic', timeZone: 'Greenwich Mean Time (GMT)' },
    5: { bestTime: 'September to November', currency: 'South African Rand (ZAR)', language: 'English, Afrikaans', timeZone: 'South Africa Standard Time (SAST)' },
    6: { bestTime: 'February to April', currency: 'Vietnamese Dong (VND)', language: 'Vietnamese', timeZone: 'Indochina Time (ICT)' }
  };

  return infoMap[id] || { bestTime: 'Year-round', currency: 'Varies', language: 'Local language', timeZone: 'Local time zone' };
}

function destinationTips(destination) {
  return [
    `Book popular stays early when visiting ${destination.name}.`,
    `Keep a flexible schedule to enjoy slower local experiences in ${destination.country}.`,
    `Save offline maps and transit details before you arrive.`,
    `Carry small cash for markets, taxis, or local snacks.`
  ];
}

function renderInfoCard(title, value) {
  return `
    <article class="info-card">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(value)}</p>
    </article>
  `;
}

function renderSimilarDestinationCard(destination) {
  const tagsHtml = destination.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');

  return `
    <article class="destination-card">
      <div class="destination-card__image">
        <img src="${destination.imageUrl}" alt="${escapeHtml(destination.name)}" loading="lazy" />
      </div>
      <div class="destination-card__body">
        <h3 class="destination-card__name">${escapeHtml(destination.name)}</h3>
        <div class="destination-card__location">
          <span aria-hidden="true">📍</span>
          <span>${escapeHtml(destination.country)}</span>
        </div>
        <p class="destination-card__description">${escapeHtml(destination.description)}</p>
        <div class="destination-card__tags">${tagsHtml}</div>
        <div class="destination-card__footer">
          <div class="destination-card__rating">
            <span class="star">★</span>
            <span>${destination.rating}</span>
          </div>
          <a href="destination.html?id=${destination.id}" class="destination-card__link">View details</a>
        </div>
      </div>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
