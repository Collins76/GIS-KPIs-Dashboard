
document.addEventListener('DOMContentLoaded', () => {
  const satelliteBtn = document.getElementById('satellite-btn');
  const terrainBtn = document.getElementById('terrain-btn');
  const refreshBtn = document.getElementById('refresh-btn');
  const mapDisplay = document.querySelector('.network-map-display');

  const showToast = (message) => {
    // This is a placeholder. In a real app, you'd integrate with your toast notification system.
    alert(message);
  };
  
  if (satelliteBtn) {
    satelliteBtn.addEventListener('click', () => {
      showToast('Switching to Satellite View...');
      // In a real Google Maps integration, you would call map.setMapTypeId('satellite');
      mapDisplay.style.background = "url('https://picsum.photos/seed/satellite/1200/800') no-repeat center center / cover";
    });
  }

  if (terrainBtn) {
    terrainBtn.addEventListener('click', () => {
      showToast('Switching to Terrain View...');
      // In a real Google Maps integration, you would call map.setMapTypeId('terrain');
       mapDisplay.style.background = "url('https://picsum.photos/seed/terrain/1200/800') no-repeat center center / cover";
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      showToast('Refreshing map data...');
      // Add a little animation to show something is happening
      refreshBtn.querySelector('svg')?.classList.add('animate-spin');
      setTimeout(() => {
        refreshBtn.querySelector('svg')?.classList.remove('animate-spin');
        mapDisplay.style.background = "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)";
        showToast('Map data refreshed!');
      }, 1500);
    });
  }
});

    