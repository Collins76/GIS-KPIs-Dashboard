
let categoryChart = null;
let trendChart = null;
let performanceGauge = null;
let roleDistributionChart = null;
let comparisonChart = null;

const CHART_DEFAULTS = {
    color: 'rgba(255, 255, 255, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    grid: {
        color: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    ticks: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
            family: "'Space Grotesk', sans-serif",
        },
    },
    legend: {
        labels: {
            color: 'rgba(255, 255, 255, 0.9)',
            font: {
                family: "'Space Grotesk', sans-serif",
                size: 14,
            },
        },
    },
    title: {
        display: true,
        color: 'rgba(255, 255, 255, 0.9)',
        font: {
            family: "'Orbitron', monospace",
            size: 18,
        },
    },
    tooltip: {
        enabled: true,
        backgroundColor: 'rgba(10, 10, 10, 0.8)',
        titleColor: '#f59e0b',
        bodyColor: '#ffffff',
        borderColor: '#f59e0b',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        titleFont: { family: "'Orbitron', monospace", size: 16 },
        bodyFont: { family: "'Space Grotesk', sans-serif", size: 12 },
    },
};

const CHART_CONFIG = {
    category: {
        type: 'bar',
        data: {
            labels: ['Business Growth', 'People Development', 'Operational Process', 'Customer'],
            datasets: [{
                label: 'Average Progress',
                data: [75, 60, 85, 90],
                backgroundColor: 'rgba(245, 158, 11, 0.6)',
                borderColor: 'rgba(245, 158, 11, 1)',
                borderWidth: 2,
                borderRadius: 8,
                hoverBackgroundColor: 'rgba(251, 146, 60, 0.8)',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { ...CHART_DEFAULTS.title, text: 'KPI Performance by Category' },
                tooltip: CHART_DEFAULTS.tooltip,
            },
            scales: {
                y: {
                    beginAtZero: true, max: 100, grid: { color: CHART_DEFAULTS.grid.color },
                    ticks: { ...CHART_DEFAULTS.ticks, callback: (value) => value + '%' }
                },
                x: { grid: { display: false }, ticks: CHART_DEFAULTS.ticks }
            }
        }
    },
    trend: {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Completed',
                    data: [10, 12, 15, 20, 25, 28, 30, 35, 40, 45, 50, 55],
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 7,
                    pointRadius: 5
                },
                {
                    label: 'In Progress',
                    data: [30, 32, 35, 40, 42, 45, 48, 50, 52, 55, 58, 60],
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 7,
                    pointRadius: 5
                },
                {
                    label: 'At Risk',
                    data: [5, 4, 6, 8, 7, 5, 4, 3, 5, 6, 4, 3],
                    borderColor: 'rgba(239, 68, 68, 1)',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(239, 68, 68, 1)',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 7,
                    pointRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { ...CHART_DEFAULTS.legend, position: 'top' },
                title: { ...CHART_DEFAULTS.title, text: 'Monthly Progress Trend' },
                tooltip: CHART_DEFAULTS.tooltip,
            },
            scales: {
                y: { beginAtZero: true, grid: { color: CHART_DEFAULTS.grid.color }, ticks: CHART_DEFAULTS.ticks },
                x: { grid: { color: CHART_DEFAULTS.grid.color }, ticks: CHART_DEFAULTS.ticks }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutCubic'
            }
        }
    },
    performance: {
        type: 'doughnut',
        data: {
            labels: ['Performance', 'Remaining'],
            datasets: [{
                data: [84, 16],
                backgroundColor: ['rgba(245, 158, 11, 1)', 'rgba(255, 255, 255, 0.1)'],
                borderColor: ['rgba(245, 158, 11, 1)', 'rgba(255, 255, 255, 0.1)'],
                borderWidth: 1,
                circumference: 270,
                rotation: 225,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '80%',
            plugins: {
                legend: { display: false },
                title: { display: false },
                tooltip: { enabled: false },
            },
        }
    },
    roleDistribution: {
        type: 'polarArea',
        data: {
            labels: ['GIS Coordinator', 'GIS Lead', 'GIS Specialist', 'Geodatabase Specialist', 'GIS Analyst'],
            datasets: [{
                data: [5, 5, 5, 5, 5],
                backgroundColor: [
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(239, 68, 68, 0.7)'
                ],
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { ...CHART_DEFAULTS.legend, position: 'right' },
                title: { display: false },
                tooltip: CHART_DEFAULTS.tooltip,
            },
            scales: {
                r: {
                    grid: { color: CHART_DEFAULTS.grid.color },
                    ticks: { display: false },
                    pointLabels: {
                        display: true,
                        centerPointLabels: true,
                        color: CHART_DEFAULTS.ticks.color,
                        font: {
                            size: 10,
                            family: "'Space Grotesk', sans-serif",
                        }
                    }
                }
            }
        }
    },
    comparison: {
        type: 'line',
        data: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [
                {
                    label: 'Business Growth',
                    data: [65, 70, 78, 85],
                    borderColor: 'rgba(245, 158, 11, 1)',
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(245, 158, 11, 1)'
                },
                {
                    label: 'People Development',
                    data: [55, 62, 68, 75],
                    borderColor: 'rgba(59, 130, 246, 1)',
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(59, 130, 246, 1)'
                },
                {
                    label: 'Operational Process',
                    data: [70, 75, 82, 90],
                    borderColor: 'rgba(16, 185, 129, 1)',
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(16, 185, 129, 1)'
                },
                {
                    label: 'Customer',
                    data: [80, 85, 88, 92],
                    borderColor: 'rgba(239, 68, 68, 1)',
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(239, 68, 68, 1)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { ...CHART_DEFAULTS.legend, position: 'bottom' },
                title: { ...CHART_DEFAULTS.title, text: 'Quarterly KPI Category Comparison' },
                tooltip: CHART_DEFAULTS.tooltip,
            },
            scales: {
                y: { beginAtZero: true, max: 100, grid: { color: CHART_DEFAULTS.grid.color }, ticks: { ...CHART_DEFAULTS.ticks, callback: (value) => value + '%' } },
                x: { grid: { color: CHART_DEFAULTS.grid.color }, ticks: CHART_DEFAULTS.ticks }
            }
        }
    }
};

const DAILY_DATA = {
    labels: Array.from({length: 30}, (_, i) => `Day ${i + 1}`),
    datasets: [
        { ...CHART_CONFIG.trend.data.datasets[0], data: Array.from({length: 30}, () => Math.floor(Math.random() * 5) + 5) },
        { ...CHART_CONFIG.trend.data.datasets[1], data: Array.from({length: 30}, () => Math.floor(Math.random() * 10) + 20) },
        { ...CHART_CONFIG.trend.data.datasets[2], data: Array.from({length: 30}, () => Math.floor(Math.random() * 3)) }
    ]
};

const MONTHLY_DATA = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
        { ...CHART_CONFIG.trend.data.datasets[0], data: [10, 12, 15, 20, 25, 28, 30, 35, 40, 45, 50, 55] },
        { ...CHART_CONFIG.trend.data.datasets[1], data: [30, 32, 35, 40, 42, 45, 48, 50, 52, 55, 58, 60] },
        { ...CHART_CONFIG.trend.data.datasets[2], data: [5, 4, 6, 8, 7, 5, 4, 3, 5, 6, 4, 3] }
    ]
};

const QUARTERLY_DATA = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
        { ...CHART_CONFIG.trend.data.datasets[0], data: [47, 83, 115, 150] }, // Cumulative
        { ...CHART_CONFIG.trend.data.datasets[1], data: [107, 135, 155, 173] }, // Cumulative
        { ...CHART_CONFIG.trend.data.datasets[2], data: [15, 10, 12, 13] } // Cumulative
    ]
};

function createChart(ctx, config) {
    if (!ctx) return null;
    return new Chart(ctx, config);
}

function destroyChart(chart) {
    if (chart) {
        chart.destroy();
    }
}

window.initializeCharts = function () {
    if (typeof Chart === 'undefined') {
      setTimeout(window.initializeCharts, 100);
      return;
    }
    
    destroyChart(categoryChart);
    destroyChart(trendChart);
    destroyChart(performanceGauge);
    destroyChart(roleDistributionChart);

    categoryChart = createChart(document.getElementById('categoryChart')?.getContext('2d'), CHART_CONFIG.category);
    trendChart = createChart(document.getElementById('trendChart')?.getContext('2d'), CHART_CONFIG.trend);
    performanceGauge = createChart(document.getElementById('performanceGauge')?.getContext('2d'), CHART_CONFIG.performance);
    roleDistributionChart = createChart(document.getElementById('roleDistributionChart')?.getContext('d'), CHART_CONFIG.roleDistribution);
}

window.initializeComparisonChart = function() {
    if (typeof Chart === 'undefined') {
      setTimeout(window.initializeComparisonChart, 100);
      return;
    }
    destroyChart(comparisonChart);
    comparisonChart = createChart(document.getElementById('comparisonChart')?.getContext('2d'), CHART_CONFIG.comparison);
}

window.toggleChartType = function(chartName) {
    let chart, config;
    if (chartName === 'category') {
        chart = categoryChart;
        config = CHART_CONFIG.category;
    } else {
        return;
    }

    if (!chart) return;

    const currentType = chart.config.type;
    const newType = currentType === 'bar' ? 'line' : 'bar';
    
    // Create new config object for the new chart type
    const newConfig = {
        ...config, // Keep original data and other options
        type: newType,
        options: {
            ...config.options,
            // Specific options changes for line chart if needed
            ...(newType === 'line' && {
                datasets: {
                    line: {
                        tension: 0.4,
                        fill: true,
                    }
                }
            })
        },
        data: {
             ...config.data,
             datasets: config.data.datasets.map(dataset => ({
                ...dataset,
                ...(newType === 'line' && { 
                    tension: 0.4, 
                    fill: true, 
                    backgroundColor: dataset.borderColor.replace('1)', '0.2)'),
                }),
             }))
        }
    };
    
    destroyChart(chart);

    const ctx = document.getElementById(chartName + 'Chart').getContext('2d');
    
    if (chartName === 'category') {
      categoryChart = createChart(ctx, newConfig);
    }
}

window.changeTrendView = function(view) {
    if (!trendChart) return;
    
    let newData;
    let newTitle;
    let newType = 'line'; // Default to line

    switch(view) {
        case 'daily':
            newData = DAILY_DATA;
            newTitle = 'Daily Progress Trend';
            break;
        case 'quarterly':
            newData = QUARTERLY_DATA;
            newTitle = 'Quarterly Progress Trend';
            newType = 'bar'; // Use bar chart for quarterly
            break;
        case 'monthly':
        default:
            newData = MONTHLY_DATA;
            newTitle = 'Monthly Progress Trend';
            break;
    }

    // Check if chart type needs to be changed
    if (trendChart.config.type !== newType) {
        destroyChart(trendChart);
        const newConfig = {
            ...CHART_CONFIG.trend, // Base config
            type: newType,
            data: newData,
            options: {
                ...CHART_CONFIG.trend.options,
                plugins: {
                    ...CHART_CONFIG.trend.options.plugins,
                    title: {
                        ...CHART_CONFIG.trend.options.plugins.title,
                        text: newTitle
                    }
                },
                // Reset scales for bar chart if needed
                ...(newType === 'bar' && {
                    scales: {
                         y: { beginAtZero: true, grid: { color: CHART_DEFAULTS.grid.color }, ticks: CHART_DEFAULTS.ticks },
                         x: { grid: { color: CHART_DEFAULTS.grid.color }, ticks: CHART_DEFAULTS.ticks }
                    }
                })
            }
        };
        const ctx = document.getElementById('trendChart').getContext('2d');
        trendChart = createChart(ctx, newConfig);
    } else {
        trendChart.data = newData;
        trendChart.options.plugins.title.text = newTitle;
        trendChart.update('smooth');
    }
};

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('categoryChart')) {
        window.initializeCharts();
    }
    if (document.getElementById('comparisonChart')) {
        window.initializeComparisonChart();
    }
});
