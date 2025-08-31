
// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Make functions globally available
    window.initializeCharts = initializeCharts;
    window.initializeComparisonChart = initializeComparisonChart;
    window.changeTrendView = changeTrendView;
    window.toggleChartType = toggleChartType;

    // Initial chart rendering if the overview tab is active
    if (document.querySelector('.tab-active')?.innerText.includes('Overview')) {
        initializeCharts();
    }
});

let categoryChart, trendChart, performanceGauge, roleDistributionChart, comparisonChart;

const trendData = {
    daily: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            { label: 'Completed', data: [0, 0, 0, 0, 0, 0, 0], borderColor: '#10b981', tension: 0.4, fill: false, pointBackgroundColor: '#10b981', pointBorderColor: '#fff', pointHoverBackgroundColor: '#fff', pointHoverBorderColor: '#10b981' },
            { label: 'In Progress', data: [0, 0, 0, 0, 0, 0, 0], borderColor: '#f59e0b', tension: 0.4, fill: false, pointBackgroundColor: '#f59e0b', pointBorderColor: '#fff', pointHoverBackgroundColor: '#fff', pointHoverBorderColor: '#f59e0b' },
            { label: 'At Risk', data: [0, 0, 0, 0, 0, 0, 0], borderColor: '#ef4444', tension: 0.4, fill: false, pointBackgroundColor: '#ef4444', pointBorderColor: '#fff', pointHoverBackgroundColor: '#fff', pointHoverBorderColor: '#ef4444' }
        ]
    },
    monthly: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            { label: 'Completed', data: [0, 0, 0, 0, 0, 0], borderColor: '#10b981', tension: 0.4, fill: false, pointBackgroundColor: '#10b981', pointBorderColor: '#fff', pointHoverBackgroundColor: '#fff', pointHoverBorderColor: '#10b981' },
            { label: 'In Progress', data: [0, 0, 0, 0, 0, 0], borderColor: '#f59e0b', tension: 0.4, fill: false, pointBackgroundColor: '#f59e0b', pointBorderColor: '#fff', pointHoverBackgroundColor: '#fff', pointHoverBorderColor: '#f59e0b' },
            { label: 'At Risk', data: [0, 0, 0, 0, 0, 0], borderColor: '#ef4444', tension: 0.4, fill: false, pointBackgroundColor: '#ef4444', pointBorderColor: '#fff', pointHoverBackgroundColor: '#fff', pointHoverBorderColor: '#ef4444' }
        ]
    },
    quarterly: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
            { label: 'Completed', data: [0, 0, 0, 0], borderColor: '#10b981', tension: 0.4, fill: false, pointBackgroundColor: '#10b981', pointBorderColor: '#fff', pointHoverBackgroundColor: '#fff', pointHoverBorderColor: '#10b981' },
            { label: 'In Progress', data: [0, 0, 0, 0], borderColor: '#f59e0b', tension: 0.4, fill: false, pointBackgroundColor: '#f59e0b', pointBorderColor: '#fff', pointHoverBackgroundColor: '#fff', pointHoverBorderColor: '#f59e0b' },
            { label: 'At Risk', data: [0, 0, 0, 0], borderColor: '#ef4444', tension: 0.4, fill: false, pointBackgroundColor: '#ef4444', pointBorderColor: '#fff', pointHoverBackgroundColor: '#fff', pointHoverBorderColor: '#ef4444' }
        ]
    }
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: true, position: 'bottom', labels: { color: '#ccc', boxWidth: 15, padding: 20 } },
        tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#f59e0b',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8
        },
    },
    scales: {
        x: { 
            ticks: { color: '#9ca3af' }, 
            grid: { color: 'rgba(255, 255, 255, 0.1)', borderDash: [5, 5] } 
        },
        y: { 
            ticks: { color: '#9ca3af' }, 
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            beginAtZero: true
        }
    },
    animation: {
        duration: 1000,
        easing: 'easeInOutCubic'
    }
};

function initializeCharts() {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded.');
        return;
    }

    destroyChart(categoryChart);
    destroyChart(trendChart);
    destroyChart(performanceGauge);
    destroyChart(roleDistributionChart);

    const commonOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            legend: { ...chartOptions.plugins.legend, labels: { ...chartOptions.plugins.legend.labels, color: '#e5e7eb' } }
        },
        scales: {
            x: { ...chartOptions.scales.x, ticks: { ...chartOptions.scales.x.ticks, color: '#9ca3af' }, grid: { ...chartOptions.scales.x.grid, color: 'rgba(255,255,255,0.1)' } },
            y: { ...chartOptions.scales.y, ticks: { ...chartOptions.scales.y.ticks, color: '#9ca3af' }, grid: { ...chartOptions.scales.y.grid, color: 'rgba(255,255,255,0.1)' } }
        }
    };

    // KPI Performance by Category
    const categoryCtx = document.getElementById('categoryChart')?.getContext('2d');
    if (categoryCtx) {
        categoryChart = new Chart(categoryCtx, {
            type: 'bar',
            data: {
                labels: ['Business Growth', 'People Dev', 'Ops Process', 'Customer'],
                datasets: [{
                    label: 'Average Progress',
                    data: [68, 80, 75, 90],
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
                    borderRadius: 5,
                    borderWidth: 0,
                }]
            },
            options: { ...commonOptions, indexAxis: 'y' }
        });
    }

    // Progress Trend
    const trendCtx = document.getElementById('trendChart')?.getContext('2d');
    if (trendCtx) {
        trendChart = new Chart(trendCtx, {
            type: 'line',
            data: trendData.monthly,
            options: {
                ...commonOptions,
                elements: {
                    line: {
                        tension: 0.4
                    },
                    point: {
                        radius: 5,
                        hoverRadius: 7
                    }
                }
            }
        });
    }

    // Performance Gauge
    const gaugeCtx = document.getElementById('performanceGauge')?.getContext('2d');
    if (gaugeCtx) {
        performanceGauge = new Chart(gaugeCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [84, 16],
                    backgroundColor: ['#f59e0b', '#374151'],
                    borderWidth: 0,
                    circumference: 180,
                    rotation: 270,
                }]
            },
            options: { ...commonOptions, cutout: '70%', plugins: { ...commonOptions.plugins, legend: { display: false } } }
        });
    }

    // Role Distribution
    const roleCtx = document.getElementById('roleDistributionChart')?.getContext('2d');
    if (roleCtx) {
        roleDistributionChart = new Chart(roleCtx, {
            type: 'polarArea',
            data: {
                labels: ['Coordinator', 'Lead', 'Specialist', 'Analyst', 'Geodatabase'],
                datasets: [{
                    data: [10, 15, 25, 35, 15],
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                }]
            },
            options: { ...commonOptions, plugins: { ...commonOptions.plugins, legend: { display: true, position: 'right' } } }
        });
    }
}

function initializeComparisonChart() {
    destroyChart(comparisonChart);
    const comparisonCtx = document.getElementById('comparisonChart')?.getContext('2d');
    if (comparisonCtx) {
        comparisonChart = new Chart(comparisonCtx, {
            type: 'radar',
            data: {
                labels: ['Data Accuracy', 'Project Timeliness', 'Team Training', 'Innovation', 'System Uptime'],
                datasets: [
                    { label: 'GIS Coordinator', data: [8, 7, 9, 8, 7], fill: true, backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: '#3b82f6', pointBackgroundColor: '#3b82f6' },
                    { label: 'GIS Lead', data: [7, 9, 8, 6, 8], fill: true, backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: '#10b981', pointBackgroundColor: '#10b981' },
                    { label: 'GIS Analyst', data: [9, 6, 7, 5, 9], fill: true, backgroundColor: 'rgba(245, 158, 11, 0.2)', borderColor: '#f59e0b', pointBackgroundColor: '#f59e0b' }
                ]
            },
            options: {
                ...chartOptions,
                plugins: { ...chartOptions.plugins, legend: { display: true, position: 'top' } },
                scales: { r: { angleLines: { color: 'rgba(255,255,255,0.2)' }, grid: { color: 'rgba(255,255,255,0.2)' }, pointLabels: { color: '#e5e7eb', font: { size: 12 } }, ticks: { backdropColor: 'transparent', color: '#9ca3af' } } }
            }
        });
    }
}

function changeTrendView(view) {
    if (trendChart && trendData[view]) {
        trendChart.data = trendData[view];
        trendChart.update();
    }
}

function toggleChartType(chartName) {
    let chartInstance;
    let newType;

    if (chartName === 'category') {
        chartInstance = categoryChart;
        newType = chartInstance.config.type === 'bar' ? 'line' : 'bar';
    } else {
        return;
    }

    if (chartInstance) {
        const oldOptions = chartInstance.options;
        const isLine = newType === 'line';

        // Swap indexAxis for bar/line charts
        if (newType === 'bar' && oldOptions.indexAxis !== 'y') {
            oldOptions.indexAxis = 'y';
        } else if (newType === 'line' && oldOptions.indexAxis) {
            delete oldOptions.indexAxis;
        }

        chartInstance.config.type = newType;
        chartInstance.update();
    }
}

function destroyChart(chart) {
    if (chart) {
        chart.destroy();
    }
}

// Dummy function to simulate KPI updates
function handleKpiUpdate(kpi) {
    console.log("KPI Updated:", kpi);
    // In a real app, this would trigger a recalculation of chart data
    // For now, we can add some random data to the trend chart to show it's working
    if (trendChart) {
        trendChart.data.datasets.forEach(dataset => {
            dataset.data = dataset.data.map(() => Math.floor(Math.random() * 100));
        });
        trendChart.update();
    }
}
