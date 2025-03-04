// Constants
const INITIAL_CONTENT = `
    <h1>Explore Dream Destinations</h1>
    <p>Whether you're dreaming of pristine beaches, bustling cities, or serene countryside escapes, we've got you covered. Explore expertly curated itineraries, hidden gems, and travel tips to make your next journey unforgettable. Let's embark on an adventure together and create memories that will last a lifetime!</p>
    <button>Book Now</button>
`;

// Data fetching
async function fetchTravelData() {
    try {
        const response = await fetch('./travel_recommendation_api.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching travel data:', error);
        return null;
    }
}

// Search functionality
function normalizeSearchTerm(term) {
    return term?.toLowerCase().trim() || '';
}

function getCategoryFromSearch(searchTerm) {
    const normalized = normalizeSearchTerm(searchTerm);
    const categoryMap = {
        'beach': 'beaches',
        'beaches': 'beaches',
        'temple': 'temples',
        'temples': 'temples',
        'country': 'countries',
        'countries': 'countries'
    };
    
    return categoryMap[normalized] || null;
}

async function handleSearch() {
    const searchInput = document.querySelector('input[type="text"]');
    if (!searchInput) return;

    const searchTerm = searchInput.value;
    if (!searchTerm) {
        displayResults([]);
        return;
    }

    try {
        const data = await fetchTravelData();
        if (!data) throw new Error('No data available');

        const results = searchData(data, searchTerm);
        displayResults(results);
    } catch (error) {
        console.error('Error during search:', error);
        displayResults([]);
    }
}

function searchData(data, searchTerm) {
    const category = getCategoryFromSearch(searchTerm);
    const normalizedSearch = normalizeSearchTerm(searchTerm);

    if (category) {
        return data[category] || [];
    }

    return [
        ...searchCountries(data.countries, normalizedSearch),
        ...searchCategory(data.temples, normalizedSearch),
        ...searchCategory(data.beaches, normalizedSearch)
    ];
}

function searchCountries(countries = [], searchTerm) {
    return countries.filter(country => 
        country.name.toLowerCase().includes(searchTerm) ||
        country.cities.some(city => 
            city.name.toLowerCase().includes(searchTerm)
        )
    );
}

function searchCategory(items = [], searchTerm) {
    return items.filter(item =>
        item.name.toLowerCase().includes(searchTerm)
    );
}

// Display functionality
function displayResults(results) {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;

    if (!results.length) {
        mainContent.innerHTML = '<h2>No results found</h2>';
        return;
    }

    const resultsHTML = results.map(item => {
        if (item.cities) {
            return createCountryHTML(item);
        }
        return createItemHTML(item);
    }).join('');

    mainContent.innerHTML = `
        <h2>Search Results</h2>
        <div class="results-container">
            ${resultsHTML}
        </div>
    `;
}

function createCountryHTML(country) {
    return `
        <div class="result-item">
            <h3>${country.name}</h3>
            <h4>Cities:</h4>
            ${country.cities.map(city => `
                <div class="city-item">
                    <h5>${city.name}</h5>
                    <p>${city.description}</p>
                    <img src="${city.imageUrl}" alt="${city.name}">
                </div>
            `).join('')}
        </div>
    `;
}

function createItemHTML(item) {
    return `
        <div class="result-item">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <img src="${item.imageUrl}" alt="${item.name}">
        </div>
    `;
}

// Clear functionality
function clearResults() {
    const searchInput = document.querySelector('input[type="text"]');
    const mainContent = document.querySelector('main');
    
    if (!searchInput || !mainContent) return;
    
    searchInput.value = '';
    mainContent.innerHTML = INITIAL_CONTENT;
}

function handleFormSubmit(event) {
    event.preventDefault();
    alert('Message sent successfully!');
    event.target.reset();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[type="text"]');
    
    // Add keyboard event listener for search input if it exists
    if (searchInput) {
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSearch();
            }
        });
    }

    const searchButton = document.querySelector('.search-button');
    const clearButton = document.querySelector('.clear-button');
    
    if (searchButton && clearButton) {
        searchButton.addEventListener('click', handleSearch);
        clearButton.addEventListener('click', clearResults);
        
        const mainContent = document.querySelector('main');
        if (mainContent && !mainContent.innerHTML.trim()) {
            clearResults();
        }
    }
});
