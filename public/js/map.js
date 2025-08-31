
// 🌍 Advanced Location Management with Google Maps Integration
let googleMap = null;
let currentLocationData = null;

// Enhanced Location Data
const locationData = [
    {
        id: 1,
        name: 'CHQ',
        fullName: 'Corporate Headquarters',
        defaultLat: 6.5514,
        defaultLng: 3.3664,
        kpiCount: 25,
        completed: 20,
        inProgress: 3,
        atRisk: 2,
        performance: 80,
        address: '',
        actualLat: null,
        actualLng: null,
        icon: 'fas fa-building',
        color: '#f59e0b'
    },
    {
        id: 2,
        name: 'Akowonjo BU',
        fullName: 'Akowonjo Business Unit',
        defaultLat: 6.5063,
        defaultLng: 3.2827,
        kpiCount: 15,
        completed: 12,
        inProgress: 2,
        atRisk: 1,
        performance: 75,
        address: '',
        actualLat: null,
        actualLng: null,
        icon: 'fas fa-industry',
        color: '#10b981'
    },
    {
        id: 3,
        name: 'Abule Egba BU',
        fullName: 'Abule Egba Business Unit',
        defaultLat: 6.6180,
        defaultLng: 3.2850,
        kpiCount: 18,
        completed: 15,
        inProgress: 2,
        atRisk: 1,
        performance: 83,
        address: '',
        actualLat: null,
        actualLng: null,
        icon: 'fas fa-bolt',
        color: '#3b82f6'
    },
    {
        id: 4,
        name: 'Ikeja BU',
        fullName: 'Ikeja Business Unit',
        defaultLat: 6.6018,
        defaultLng: 3.3515,
        kpiCount: 22,
        completed: 18,
        inProgress: 3,
        atRisk: 1,
        performance: 82,
        address: '',
        actualLat: null,
        actualLng: null,
        icon: 'fas fa-city',
        color: '#8b5cf6'
    },
    {
        id: 5,
        name: 'Ikorodu BU',
        fullName: 'Ikorodu Business Unit',
        defaultLat: 6.6194,
        defaultLng: 3.5105,
        kpiCount: 16,
        completed: 13,
        inProgress: 2,
        atRisk: 1,
        performance: 81,
        address: '',
        actualLat: null,
        actualLng: null,
        icon: 'fas fa-warehouse',
        color: '#ef4444'
    },
    {
        id: 6,
        name: 'Oshodi BU',
        fullName: 'Oshodi Business Unit',
        defaultLat: 6.5355,
        defaultLng: 3.3087,
        kpiCount: 20,
        completed: 16,
        inProgress: 3,
        atRisk: 1,
        performance: 80,
        address: '',
        actualLat: null,
        actualLng: null,
        icon: 'fas fa-plug',
        color: '#f97316'
    },
    {
        id: 7,
        name: 'Shomolu BU',
        fullName: 'Shomolu Business Unit',
        defaultLat: 6.5392,
        defaultLng: 3.3842,
        kpiCount: 17,
        completed: 14,
        inProgress: 2,
        atRisk: 1,
        performance: 82,
        address: '',
        actualLat: null,
        actualLng: null,
        icon: 'fas fa-zap',
        color: '#06b6d4'
    }
];

// Initialize Location Cards Interface
function initializeMap() {
    // Load saved location data from localStorage
    loadSavedLocationData();
    
    // Generate location cards
    generateLocationCards();
    
    // Initialize Google Maps (but keep it hidden initially)
    initGoogleMaps();
}

// Load saved location data from localStorage
function loadSavedLocationData() {
    const savedData = localStorage.getItem('gis_location_data');
    if (savedData) {
        const parsed = JSON.parse(savedData);
        locationData.forEach(location => {
            const saved = parsed.find(s => s.id === location.id);
            if (saved) {
                location.address = saved.address || '';
                location.actualLat = saved.actualLat || null;
                location.actualLng = saved.actualLng || null;
            }
        });
    }
}

// Save location data to localStorage
function saveLocationData() {
    localStorage.setItem('gis_location_data', JSON.stringify(locationData));
}

// Generate Interactive Location Cards
function generateLocationCards() {
    const container = document.getElementById('locationCardsGrid');
    if (!container) return;
    
    let html = '';
    
    locationData.forEach((location, index) => {
        const hasAddress = location.address && location.actualLat && location.actualLng;
        
        html += `
            <div class="location-card" onclick="openAddressModal(${location.id})" data-location-id="${location.id}">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 rounded-lg flex items-center justify-center" style="background: linear-gradient(45deg, ${location.color}, ${adjustColor(location.color, 20)});">
                            <i class="${location.icon} text-white text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-white font-bold text-lg font-orbitron">${index + 1}. ${location.name}</h3>
                            <p class="text-gray-400 text-sm font-rajdhani">${location.fullName}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-white font-orbitron">${location.performance}%</div>
                        <div class="text-xs text-gray-400">Performance</div>
                    </div>
                </div>
                
                <div class="mb-4">
                    <div class="flex justify-between text-sm text-gray-400 mb-2">
                        <span>KPI Progress</span>
                        <span>${location.completed}/${location.kpiCount}</span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-3">
                        <div class="h-3 rounded-full" style="width: ${location.performance}%; background: linear-gradient(45deg, ${location.color}, ${adjustColor(location.color, 20)});"></div>
                    </div>
                </div>
                
                <div class="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                    <div class="bg-green-500 bg-opacity-20 text-green-400 py-2 rounded-lg font-semibold">
                        <div class="font-bold text-lg font-orbitron">${location.completed}</div>
                        <div>Completed</div>
                    </div>
                    <div class="bg-yellow-500 bg-opacity-20 text-yellow-400 py-2 rounded-lg font-semibold">
                        <div class="font-bold text-lg font-orbitron">${location.inProgress}</div>
                        <div>In Progress</div>
                    </div>
                    <div class="bg-red-500 bg-opacity-20 text-red-400 py-2 rounded-lg font-semibold">
                        <div class="font-bold text-lg font-orbitron">${location.atRisk}</div>
                        <div>At Risk</div>
                    </div>
                </div>
                
                <div class="border-t border-gray-700 pt-3">
                    ${hasAddress ? `
                        <div class="flex items-center text-green-400 text-sm mb-2">
                            <i class="fas fa-map-marker-alt mr-2"></i>
                            <span class="font-semibold">Address Configured</span>
                        </div>
                        <div class="text-xs text-gray-400 mb-2 truncate">${location.address}</div>
                        <div class="flex justify-between text-xs text-gray-500">
                            <span>Lat: ${location.actualLat.toFixed(6)}</span>
                            <span>Lng: ${location.actualLng.toFixed(6)}</span>
                        </div>
                        <button onclick="event.stopPropagation(); viewOnGoogleMaps(${location.id})" class="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-all">
                            <i class="fas fa-map mr-2"></i>View on Google Maps
                        </button>
                    ` : `
                        <div class="flex items-center text-yellow-400 text-sm mb-3">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            <span class="font-semibold">Address Required</span>
                        </div>
                        <button class="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-2 px-4 rounded-lg text-sm font-bold transition-all">
                            <i class="fas fa-plus mr-2"></i>Add Address
                        </button>
                    `}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Adjust color brightness
function adjustColor(color, percent) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const newR = Math.min(255, Math.max(0, r + percent));
    const newG = Math.min(255, Math.max(0, g + percent));
    const newB = Math.min(255, Math.max(0, b + percent));
    
    return `rgb(${newR}, ${newG}, ${newB})`;
}

// Open Address Input Modal
function openAddressModal(locationId) {
    const location = locationData.find(l => l.id === locationId);
    if (!location) return;
    
    currentLocationData = location;
    
    // Update modal content
    document.getElementById('modalLocationName').textContent = `${location.name} - ${location.fullName}`;
    document.getElementById('addressInput').value = location.address || '';
    document.getElementById('latitudeInput').value = location.actualLat || location.defaultLat;
    document.getElementById('longitudeInput').value = location.actualLng || location.defaultLng;
    
    // Show modal
    document.getElementById('addressModal').classList.remove('hidden');
}

// Close Address Modal
function closeAddressModal() {
    document.getElementById('addressModal').classList.add('hidden');
    currentLocationData = null;
}

// Handle Address Form Submission
document.addEventListener('DOMContentLoaded', function() {
    const addressForm = document.getElementById('addressForm');
    if (addressForm) {
        addressForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!currentLocationData) return;
            
            const address = document.getElementById('addressInput').value.trim();
            const lat = parseFloat(document.getElementById('latitudeInput').value);
            const lng = parseFloat(document.getElementById('longitudeInput').value);
            
            if (!address || isNaN(lat) || isNaN(lng)) {
                showNotification('Please fill in all fields with valid data', 'error');
                return;
            }
            
            // Update location data
            currentLocationData.address = address;
            currentLocationData.actualLat = lat;
            currentLocationData.actualLng = lng;
            
            // Save to localStorage
            saveLocationData();
            
            // Refresh cards
            generateLocationCards();
            
            // Close modal
            closeAddressModal();
            
            // Show success message
            showNotification(`Address saved for ${currentLocationData.name}! Opening Google Maps...`, 'success');
            
            // Open Google Maps view
            setTimeout(() => {
                viewOnGoogleMaps(currentLocationData.id);
            }, 1000);
        });
    }
});

// View Location on Google Maps
function viewOnGoogleMaps(locationId) {
    const location = locationData.find(l => l.id === locationId);
    if (!location || !location.actualLat || !location.actualLng) {
        showNotification('Please configure address first', 'error');
        return;
    }
    
    // Show map container
    document.getElementById('locationCardsGrid').style.display = 'none';
    document.getElementById('mapContainer').classList.remove('hidden');
    
    // Initialize Google Map for this location
    initGoogleMapForLocation(location);
}

// Close Map View
function closeMapView() {
    document.getElementById('mapContainer').classList.add('hidden');
    document.getElementById('locationCardsGrid').style.display = 'grid';
}

// Initialize Google Maps
function initGoogleMaps() {
    // This function will be called when Google Maps API loads
    console.log('Google Maps API loaded');
}

// Initialize Google Map for Specific Location
function initGoogleMapForLocation(location) {
    const mapElement = document.getElementById('googleMap');
    if (!mapElement) {
        console.error('Map element not found');
        return;
    }
    
    // Check if Google Maps API is properly loaded
    const hasRealGoogleMaps = window.google && 
                              window.google.maps && 
                              window.google.maps.Map && 
                              typeof window.google.maps.Map === 'function' &&
                              !window.google.maps.Map.toString().includes('Mock');
    
    if (hasRealGoogleMaps) {
        // Use real Google Maps
        initRealGoogleMap(mapElement, location);
    } else {
        // Use enhanced fallback display
        showEnhancedLocationFallback(location);
    }
}

// Initialize Real Google Maps (when API is properly loaded)
function initRealGoogleMap(mapElement, location) {
    const mapOptions = {
        center: { lat: location.actualLat, lng: location.actualLng },
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.HYBRID,
        styles: [
            {
                "featureType": "all",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#ffffff"}]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.stroke",
                "stylers": [{"color": "#000000"}, {"lightness": 13}]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#000000"}]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.stroke",
                "stylers": [{"color": "#144b53"}, {"lightness": 14}, {"weight": 1.4}]
            }
        ]
    };
    
    googleMap = new google.maps.Map(mapElement, mapOptions);
    
    // Create custom marker
    const marker = new google.maps.Marker({
        position: { lat: location.actualLat, lng: location.actualLng },
        map: googleMap,
        title: location.fullName,
        icon: {
            url: createCustomMarkerIcon(location.color),
            scaledSize: new google.maps.Size(40, 40)
        }
    });
    
    // Create info window
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="color: #333; padding: 10px;">
                <h3 style="margin: 0 0 10px; color: ${location.color};">${location.fullName}</h3>
                <p style="margin: 5px 0;"><strong>Address:</strong> ${location.address}</p>
                <p style="margin: 5px 0;"><strong>Performance:</strong> ${location.performance}%</p>
                <p style="margin: 5px 0;"><strong>KPIs:</strong> ${location.completed}/${location.kpiCount} completed</p>
                <p style="margin: 5px 0;"><strong>Coordinates:</strong> ${location.actualLat.toFixed(6)}, ${location.actualLng.toFixed(6)}</p>
            </div>
        `
    });
    
    marker.addListener('click', () => {
        infoWindow.open(googleMap, marker);
    });
    
    // Auto-open info window
    infoWindow.open(googleMap, marker);
}

// Create Custom Marker Icon
function createCustomMarkerIcon(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    
    // Draw marker shape
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(20, 15, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(20, 27);
    ctx.lineTo(15, 35);
    ctx.lineTo(25, 35);
    ctx.closePath();
    ctx.fill();
    
    return canvas.toDataURL();
}

// Enhanced fallback when Google Maps is not available (enhanced version)
function showEnhancedLocationFallback(location) {
    const mapElement = document.getElementById('googleMap');
    mapElement.innerHTML = `
        <div class="flex items-center justify-center h-full network-map-display" style="min-height: 500px;">
            <div class="text-center p-8 z-10 relative max-w-4xl mx-auto">
                <!-- Animated Location Icon -->
                <div class="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl" style="animation: pulse 2s infinite;">
                    <i class="fas fa-map-marked-alt text-white text-5xl"></i>
                </div>
                
                <!-- Location Header -->
                <h3 class="text-3xl font-bold text-white mb-2 font-orbitron glow-text-yellow">${location.fullName}</h3>
                <p class="text-yellow-400 text-lg font-rajdhani mb-8">Interactive Location Dashboard</p>
                
                <!-- Main Info Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div class="glow-container p-4">
                        <div class="text-sm text-gray-400 mb-1">Address</div>
                        <div class="text-white font-semibold break-words">${location.address}</div>
                    </div>
                    <div class="glow-container p-4">
                        <div class="text-sm text-gray-400 mb-1">Performance</div>
                        <div class="text-2xl font-bold font-orbitron ${
                            location.performance >= 80 ? 'text-green-400' :
                            location.performance >= 60 ? 'text-yellow-400' : 'text-red-400'
                        }">${location.performance}%</div>
                    </div>
                    <div class="glow-container p-4">
                        <div class="text-sm text-gray-400 mb-1">Latitude</div>
                        <div class="text-blue-400 font-mono text-sm">${location.actualLat.toFixed(6)}</div>
                    </div>
                    <div class="glow-container p-4">
                        <div class="text-sm text-gray-400 mb-1">Longitude</div>
                        <div class="text-purple-400 font-mono text-sm">${location.actualLng.toFixed(6)}</div>
                    </div>
                </div>
                
                <!-- KPI Status Grid -->
                <div class="grid grid-cols-3 gap-6 mb-8">
                    <div class="glow-container p-6 text-center">
                        <div class="text-3xl font-bold text-green-400 font-orbitron mb-2">${location.completed}</div>
                        <div class="text-green-400 font-semibold">Completed KPIs</div>
                        <div class="text-xs text-gray-400 mt-1">Tasks finished</div>
                    </div>
                    <div class="glow-container p-6 text-center">
                        <div class="text-3xl font-bold text-yellow-400 font-orbitron mb-2">${location.inProgress}</div>
                        <div class="text-yellow-400 font-semibold">In Progress</div>
                        <div class="text-xs text-gray-400 mt-1">Active tasks</div>
                    </div>
                    <div class="glow-container p-6 text-center">
                        <div class="text-3xl font-bold text-red-400 font-orbitron mb-2">${location.atRisk}</div>
                        <div class="text-red-400 font-semibold">At Risk</div>
                        <div class="text-xs text-gray-400 mt-1">Needs attention</div>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex flex-wrap gap-4 justify-center mb-6">
                    <a href="https://www.google.com/maps?q=${location.actualLat},${location.actualLng}" 
                       target="_blank" 
                       class="glow-button flex items-center">
                        <i class="fas fa-external-link-alt mr-2"></i>Open in Google Maps
                    </a>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${location.actualLat},${location.actualLng}" 
                       target="_blank" 
                       class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center">
                        <i class="fas fa-route mr-2"></i>Get Directions
                    </a>
                    <button onclick="copyCoordinates('${location.actualLat}', '${location.actualLng}')" 
                            class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center">
                        <i class="fas fa-copy mr-2"></i>Copy Coordinates
                    </button>
                </div>
                
                <!-- Status Message -->
                <div class="glow-container p-4 max-w-md mx-auto">
                    <div class="flex items-center justify-center text-yellow-400 mb-2">
                        <i class="fas fa-info-circle mr-2"></i>
                        <span class="font-semibold">Map Integration Status</span>
                    </div>
                    <p class="text-gray-300 text-sm">
                        Interactive map view ready. Google Maps API integration available with proper API key configuration.
                    </p>
                </div>
            </div>
        </div>
    `;
}

// Copy coordinates to clipboard
function copyCoordinates(lat, lng) {
    const coordinates = `${lat}, ${lng}`;
    navigator.clipboard.writeText(coordinates).then(() => {
        showNotification('Coordinates copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Could not copy coordinates', 'error');
    });
}

// Legacy fallback function (keeping for backward compatibility)
function showLocationFallback(location) {
    showEnhancedLocationFallback(location);
}

// Show notification (reuse from existing code)
function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.map-notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `map-notification fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all transform translate-x-0 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    } text-white max-w-md`;
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${
                type === 'success' ? 'fa-check-circle' : 
                type === 'error' ? 'fa-exclamation-circle' : 
                'fa-info-circle'
            } mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Export functions
window.initializeMap = initializeMap;
window.openAddressModal = openAddressModal;
window.closeAddressModal = closeAddressModal;
window.viewOnGoogleMaps = viewOnGoogleMaps;
window.closeMapView = closeMapView;
window.initGoogleMaps = initGoogleMaps;
window.copyCoordinates = copyCoordinates;
