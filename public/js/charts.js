// 📊 Advanced Charting Engine for GIS KPI Dashboard
let categoryChart = null;
let trendChart = null;
let performanceGauge = null;
let roleDistributionChart = null;
let comparisonChart = null;
let categoryChartType = 'bar'; // 'bar' or 'doughnut'
let trendChartType = 'line'; // 'line' or 'bar'

// Initialize Charts
function initializeCharts() {
    if (document.getElementById('categoryChart')) {
        createCategoryChart();
    }
    if (document.getElementById('trendChart')) {
        createTrendChart();
    }
    if (document.getElementById('performanceGauge')) {
        createPerformanceGauge();
    }
    if (document.getElementById('roleDistributionChart')) {
        createRoleDistributionChart();
    }
}

// Toggle Chart Type
function toggleChartType(chartName) {
    if (chartName === 'category') {
        categoryChartType = categoryChartType === 'bar' ? 'doughnut' : 'bar';
        if (categoryChart) categoryChart.destroy();
        createCategoryChart();
    } else if (chartName === 'trend') {
        trendChartType = trendChartType === 'line' ? 'bar' : 'line';
        if (trendChart) trendChart.destroy();
        createTrendChart();
    }
}

// 1. Category Performance Chart
function createCategoryChart() {
    const ctx = document.getElementById('categoryChart')?.getContext('2d');
    if (!ctx) return;
    
    if (categoryChart) categoryChart.destroy();

    const data = {
        labels: ['Business Growth', 'People Development', 'Operational Process', 'Customer'],
        datasets: [{
            label: 'Average KPI Performance',
            data: [78, 85, 92, 88], // Sample data
            backgroundColor: [
                'rgba(245, 158, 11, 0.6)',
                'rgba(16, 185, 129, 0.6)',
                'rgba(59, 130, 246, 0.6)',
                'rgba(139, 92, 246, 0.6)'
            ],
            borderColor: [
                '#f59e0b',
                '#10b981',
                '#3b82f6',
                '#8b5cf6'
            ],
            borderWidth: 2,
            hoverOffset: 4
        }]
    };
    
    categoryChart = new Chart(ctx, {
        type: categoryChartType,
        data: data,
        options: getChartOptions('KPI Performance by Category', categoryChartType === 'bar' ? 'y' : undefined)
    });
}

// 2. Monthly Progress Trend Chart
function createTrendChart() {
    const ctx = document.getElementById('trendChart')?.getContext('2d');
    if (!ctx) return;

    if (trendChart) trendChart.destroy();

    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Overall Progress (%)',
            data: [65, 70, 72, 78, 82, 84], // Sample data
            fill: trendChartType === 'line',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            borderColor: '#f59e0b',
            pointBackgroundColor: '#f59e0b',
            pointBorderColor: '#fff',
            pointHoverRadius: 7,
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#f59e0b',
            tension: 0.4
        }]
    };
    
    trendChart = new Chart(ctx, {
        type: trendChartType,
        data: data,
        options: getChartOptions('Monthly Progress Trend', 'y')
    });
}

// 3. Performance Gauge
function createPerformanceGauge() {
    const ctx = document.getElementById('performanceGauge')?.getContext('2d');
    if (!ctx) return;

    if (performanceGauge) performanceGauge.destroy();

    const data = {
        labels: ['Performance', 'Remaining'],
        datasets: [{
            data: [84, 16], // 84% performance
            backgroundColor: ['#10b981', '#374151'],
            borderColor: '#0a0a0a',
            borderWidth: 4,
            circumference: 180,
            rotation: 270,
            cutout: '70%'
        }]
    };
    
    performanceGauge = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

// 4. Role Distribution Chart
function createRoleDistributionChart() {
    const ctx = document.getElementById('roleDistributionChart')?.getContext('2d');
    if (!ctx) return;

    if (roleDistributionChart) roleDistributionChart.destroy();

    const data = {
        labels: ['GIS Coordinator', 'GIS Lead', 'GIS Specialist', 'Geodatabase Specialist', 'GIS Analyst'],
        datasets: [{
            label: 'Number of KPIs',
            data: [5, 5, 5, 5, 5], // Sample data
            backgroundColor: [
                '#3b82f6',
                '#10b981',
                '#f59e0b',
                '#ef4444',
                '#8b5cf6'
            ],
            hoverOffset: 4
        }]
    };
    
    roleDistributionChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: getChartOptions('KPI Distribution by Role', undefined, true)
    });
}

// 5. Comparison Chart
function initializeComparisonChart() {
    const ctx = document.getElementById('comparisonChart')?.getContext('2d');
    if (!ctx) return;

    if (comparisonChart) comparisonChart.destroy();
    
    const data = {
        labels: ['Network Accuracy', 'Project Timelines', 'Data Integration', 'User Training', 'Tech Adoption', 'Issue Resolution'],
        datasets: [
            {
                label: 'GIS Coordinator',
                data: [90, 85, 95, 88, 75, 92],
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: '#3b82f6',
                borderWidth: 2,
            },
            {
                label: 'GIS Lead',
                data: [88, 92, 90, 85, 80, 89],
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                borderColor: '#10b981',
                borderWidth: 2,
            },
            {
                label: 'GIS Analyst',
                data: [95, 80, 88, 78, 82, 94],
                backgroundColor: 'rgba(245, 158, 11, 0.5)',
                borderColor: '#f59e0b',
                borderWidth: 2,
            }
        ]
    };

    comparisonChart = new Chart(ctx, {
        type: 'radar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
                    grid: { color: 'rgba(255, 255, 255, 0.2)' },
                    pointLabels: {
                        font: { size: 12, family: "'Space Grotesk', sans-serif" },
                        color: '#f59e0b'
                    },
                    ticks: {
                        color: '#fff',
                        backdropColor: 'rgba(0,0,0,0.5)',
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#fff',
                        font: { size: 14, family: "'Rajdhani', sans-serif" }
                    }
                },
                title: {
                    display: true,
                    text: 'Role Performance Comparison',
                    color: '#fff',
                    font: { size: 20, family: "'Orbitron', monospace" }
                }
            }
        }
    });
}


// Shared Chart Options
function getChartOptions(title, indexAxis, legendDisplay = false) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: indexAxis,
        scales: {
            x: {
                ticks: { color: '#9ca3af', font: { family: "'Space Grotesk', sans-serif" } },
                grid: { color: 'rgba(255, 255, 255, 0.1)', borderDash: [5, 5] }
            },
            y: {
                beginAtZero: true,
                ticks: { color: '#9ca3af', font: { family: "'Space Grotesk', sans-serif" } },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            }
        },
        plugins: {
            legend: {
                display: legendDisplay,
                position: 'right',
                labels: {
                    color: '#fff',
                    font: { size: 12, family: "'Rajdhani', sans-serif" },
                    boxWidth: 20,
                    padding: 20
                }
            },
            title: {
                display: false,
                text: title,
                color: '#fff',
                font: { size: 18, family: "'Orbitron', monospace" }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#f59e0b',
                bodyColor: '#fff',
                titleFont: { size: 14, weight: 'bold', family: "'Orbitron', monospace" },
                bodyFont: { size: 12, family: "'Space Grotesk', sans-serif" },
                padding: 12,
                cornerRadius: 8,
                borderColor: '#f59e0b',
                borderWidth: 1
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
    };
}


// Expose functions to the window object
window.initializeCharts = initializeCharts;
window.initializeComparisonChart = initializeComparisonChart;
window.toggleChartType = toggleChartType;
