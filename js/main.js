import { destinations } from './destinations.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const searchInput = document.getElementById('search-input');
  const searchForm = document.getElementById('hero-search-form');
  const searchButton = searchForm ? searchForm.querySelector('button[type="submit"]') : null;
  const menuToggle = document.getElementById('menu-toggle');
  const siteNavigation = document.getElementById('site-navigation');
  const destinationsGrid = document.getElementById('destinations-grid');
  const continentButtons = document.querySelectorAll('[data-continent]');
  const budgetButtons = document.querySelectorAll('[data-budget]');
  
  const filterCountEl = document.getElementById('filter-count');
  const clearFiltersBtn = document.getElementById('clear-filters');
  const ariaLiveRegion = document.getElementById('aria-live-region');
  const backToTopBtn = document.getElementById('back-to-top');

  // Load state from URL
  const queryParams = new URLSearchParams(window.location.search);
  let activeContinent = queryParams.get('continent') || 'all';
  let activeBudget = queryParams.get('budget') || 'all';
  let searchQuery = queryParams.get('search') || '';

  if (searchInput) {
    searchInput.value = searchQuery;
    if (searchButton) {
      searchButton.disabled = searchQuery.trim() === '';
    }
  }

  // Initialize UI state
  function updateURL() {
    const params = new URLSearchParams();
    if (activeContinent !== 'all') params.set('continent', activeContinent);
    if (activeBudget !== 'all') params.set('budget', activeBudget);
    if (searchQuery.trim() !== '') params.set('search', searchQuery);
    
    const newRelativePathQuery = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState(null, '', newRelativePathQuery);
  }

  function updateFilterUI() {
    continentButtons.forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.continent === activeContinent);
      btn.setAttribute('aria-checked', btn.dataset.continent === activeContinent);
    });
    budgetButtons.forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.budget === activeBudget);
      btn.setAttribute('aria-checked', btn.dataset.budget === activeBudget);
    });

    let activeFilterCount = 0;
    if (activeContinent !== 'all') activeFilterCount++;
    if (activeBudget !== 'all') activeFilterCount++;
    if (searchQuery.trim() !== '') activeFilterCount++;

    if (filterCountEl) {
      filterCountEl.textContent = `Filters (${activeFilterCount})`;
    }
    
    if (clearFiltersBtn) {
      clearFiltersBtn.hidden = activeFilterCount === 0;
    }
  }

  function highlightText(text, query) {
    if (!query) return escapeHtml(text);
    const regex = new RegExp(`(${query.replace(/[.*+?^$\/{}()|[\\]\\\\]/g, '\\\\$&')})`, 'gi');
    return escapeHtml(text).replace(regex, '<mark>$1</mark>');
  }

  // Lazy loading setup
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '50px 0px', threshold: 0.1 });

  function renderDestinations(items) {
    if (!destinationsGrid) return;
    
    // Fade out old items
    const oldCards = destinationsGrid.querySelectorAll('.destination-card');
    oldCards.forEach(card => card.classList.add('fade-out'));
    
    setTimeout(() => {
      destinationsGrid.innerHTML = '';

      if (items.length === 0) {
        destinationsGrid.innerHTML = '<p class="no-results" tabindex="0">No destinations found. Try adjusting your filters.</p>';
        if (ariaLiveRegion) ariaLiveRegion.textContent = 'No destinations found.';
        return;
      }

      items.forEach((dest, index) => {
        const tagsHtml = dest.tags
          .map(tag => `<span class="tag">${highlightText(tag, searchQuery)}</span>`)
          .join('');

        const card = document.createElement('article');
        card.className = 'destination-card fade-in';
        card.style.animationDelay = `${index * 50}ms`;

        // Using a tiny transparent gif as a placeholder
        const placeholderImg = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

        card.innerHTML = `
          <div class="destination-card__image">
            <img src="${placeholderImg}" data-src="${dest.imageUrl}" alt="${escapeHtml(dest.name)}" />
          </div>
          <div class="destination-card__body">
            <h3 class="destination-card__name">${highlightText(dest.name, searchQuery)}</h3>
            <div class="destination-card__location">
              <span aria-hidden="true">📍</span>
              <span>${highlightText(dest.country, searchQuery)}</span>
            </div>
            <p class="destination-card__description">${escapeHtml(dest.description)}</p>
            <div class="destination-card__tags">${tagsHtml}</div>
            <div class="destination-card__footer">
              <div class="destination-card__rating">
                <span class="star">★</span>
                <span>${dest.rating}</span>
              </div>
              <a href="pages/destination.html?id=${dest.id}" class="destination-card__link">View details</a>
            </div>
          </div>
        `;

        destinationsGrid.appendChild(card);
        
        // Observe image for lazy loading
        const img = card.querySelector('img');
        if (img) imageObserver.observe(img);
      });
      
      if (ariaLiveRegion) {
        ariaLiveRegion.textContent = `Showing ${items.length} destination${items.length === 1 ? '' : 's'}.`;
      }
    }, oldCards.length ? 300 : 0);
  }

  function filterDestinations() {
    const filtered = destinations.filter(dest => {
      const continentMatch = activeContinent === 'all' || dest.continent === activeContinent;
      const budgetMatch = activeBudget === 'all' || dest.budget === activeBudget;
      const searchMatch = !searchQuery || 
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return continentMatch && budgetMatch && searchMatch;
    });

    updateURL();
    updateFilterUI();
    renderDestinations(filtered);
    const resultsContainer = document.getElementById('destinations-section');
    if (resultsContainer && filtered.length > 0 && !!searchQuery) {
      console.log(filtered)
      resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const handleSearch = debounce((event) => {
    const query = typeof event === 'string'
      ? event.toLowerCase()
      : String(event.target.value || '').toLowerCase();

    searchQuery = query;
    filterDestinations();
  }, 300);

  function toggleMenu() {
    if (!menuToggle || !siteNavigation) return;
    const isOpen = siteNavigation.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }

  function handleContinentFilter(event) {
    activeContinent = event.target.dataset.continent;
    filterDestinations();
  }

  function handleBudgetFilter(event) {
    activeBudget = event.target.dataset.budget;
    filterDestinations();
  }

  function handleClearFilters() {
    activeContinent = 'all';
    activeBudget = 'all';
    searchQuery = '';
    if (searchInput) {
      searchInput.value = '';
      if (searchButton) {
        searchButton.disabled = true;
      }
    }
    filterDestinations();
  }

  // Setup Back To Top Observer
  if (backToTopBtn) {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Event listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      if (searchButton) {
        searchButton.disabled = e.target.value.trim() === '';
      }
      handleSearch(e);
    });
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
  }

  continentButtons.forEach(btn => {
    btn.addEventListener('click', handleContinentFilter);
  });

  budgetButtons.forEach(btn => {
    btn.addEventListener('click', handleBudgetFilter);
  });
  
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', handleClearFilters);
  }

  // Keyboard accessibility on filter buttons
  const allFilters = [...continentButtons, ...budgetButtons];
  allFilters.forEach(btn => {
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', btn.classList.contains('is-active'));
    
    // It's a button, so natively accessible with keyboard Space/Enter, but we ensure it works nicely
    btn.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // Initial render setup
  updateFilterUI();
  filterDestinations();
});
