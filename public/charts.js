
// Charts Configuration and Initialization
let categoryChart = null;
let trendChart = null;
let comparisonChart = null;
let performanceGauge = null;
let roleDistributionChart = null;

// Initialize all charts
function initializeCharts() {
    initializeCategoryChart();
    initializeTrendChart();
    initializePerformanceGauge();
    initializeRoleDistributionChart();
}

// Initialize Category Chart
function initializeCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Business Growth', 'People Development', 'Operational Process', 'Customer'],
            datasets: [{
                data: [8, 5, 7, 5],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',  // Blue
                    'rgba(16, 185, 129, 0.8)',  // Green
                    'rgba(245, 158, 11, 0.8)',  // Yellow
                    'rgba(139, 92, 246, 0.8)',  // Purple
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(139, 92, 246, 1)',
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#fff',
                        padding: 15,
                        font: {
                            size: 11,
                            family: 'Inter'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return label + ': ' + value + ' KPIs (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

// Initialize Trend Chart
function initializeTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    if (trendChart) {
        trendChart.destroy();
    }
    
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'On Track',
                    data: [12, 15, 18, 20, 22, 18],
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'At Risk',
                    data: [8, 7, 6, 5, 4, 5],
                    borderColor: 'rgba(245, 158, 11, 1)',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Off Track',
                    data: [5, 3, 1, 0, 1, 2],
                    borderColor: 'rgba(239, 68, 68, 1)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#fff',
                        padding: 10,
                        font: {
                            size: 11,
                            family: 'Inter'
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                    },
                    ticks: {
                        color: '#9ca3af'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                    },
                    ticks: {
                        color: '#9ca3af',
                        stepSize: 5
                    }
                }
            }
        }
    });
}

// Initialize Comparison Chart
function initializeComparisonChart() {
    const ctx = document.getElementById('comparisonChart');
    if (!ctx) return;
    
    if (comparisonChart) {
        comparisonChart.destroy();
    }
    
    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['GIS Coordinator', 'GIS Lead', 'GIS Specialist', 'Geodatabase Specialist', 'GIS Analyst'],
            datasets: [
                {
                    label: 'Target',
                    data: [5, 5, 5, 5, 5],
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Achieved',
                    data: [4, 4, 3, 5, 4],
                    backgroundColor: 'rgba(16, 185, 129, 0.5)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#fff',
                        padding: 15,
                        font: {
                            size: 12,
                            family: 'Inter'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y || 0;
                            return label + ': ' + value + ' KPIs';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                    },
                    ticks: {
                        color: '#9ca3af',
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                    },
                    ticks: {
                        color: '#9ca3af',
                        stepSize: 1
                    },
                    beginAtZero: true
                }
            }
        }
    });
}


function initializePerformanceGauge() {
    const ctx = document.getElementById('performanceGauge');
    if (!ctx) return;
    
    if (performanceGauge) {
        performanceGauge.destroy();
    }
    
    performanceGauge = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [84, 16],
                backgroundColor: [
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(75, 85, 99, 0.3)'
                ],
                borderWidth: 0,
                cutout: '75%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            rotation: -90,
            circumference: 180,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
}

function initializeRoleDistributionChart() {
    const ctx = document.getElementById('roleDistributionChart');
    if (!ctx) return;
    
    if (roleDistributionChart) {
        roleDistributionChart.destroy();
    }
    
    roleDistributionChart = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: ['Coordinator', 'Lead', 'Specialist', 'DB Specialist', 'Analyst'],
            datasets: [{
                data: [5, 5, 5, 5, 5],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.6)',
                    'rgba(16, 185, 129, 0.6)',
                    'rgba(245, 158, 11, 0.6)',
                    'rgba(139, 92, 246, 0.6)',
                    'rgba(239, 68, 68, 0.6)'
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                r: {
                    ticks: {
                        display: false
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

function toggleChartType(chartName) {
    switch(chartName) {
        case 'category':
            if (!categoryChart) return;
            if (categoryChart.config.type === 'doughnut') {
                categoryChart.config.type = 'bar';
                categoryChart.config.options.plugins.legend.display = false;
                categoryChart.config.options.scales = {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#9ca3af' }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#9ca3af' }
                    }
                };
            } else {
                categoryChart.config.type = 'doughnut';
                categoryChart.config.options.plugins.legend.display = true;
                delete categoryChart.config.options.scales;
            }
            categoryChart.update();
            break;
        case 'trend':
            if (!trendChart) return;
            if (trendChart.config.type === 'line') {
                trendChart.config.type = 'bar';
            } else {
                trendChart.config.type = 'line';
            }
            trendChart.update();
            break;
    }
}

if (typeof window !== 'undefined') {
    window.initializeCharts = initializeCharts;
    window.initializeComparisonChart = initializeComparisonChart;
    window.toggleChartType = toggleChartType;
}
