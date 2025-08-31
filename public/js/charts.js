
'use strict';

(function() {
    let categoryChartInstance = null;
    let trendChartInstance = null;
    let performanceGaugeInstance = null;
    let roleDistributionChartInstance = null;
    let comparisonChartInstance = null;
    let currentCategoryChartType = 'bar';
    let currentTrendChartType = 'line';

    // Debounce function to limit how often a function can run.
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    const defaultChartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: '#fff',
                    font: {
                        family: "'Space Grotesk', sans-serif",
                    }
                }
            },
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#f59e0b',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 8,
                titleFont: {
                    family: "'Orbitron', monospace",
                    size: 14,
                    weight: 'bold',
                },
                bodyFont: {
                    family: "'Rajdhani', sans-serif",
                    size: 12,
                },
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#a0a0a0',
                    font: {
                       family: "'Space Grotesk', sans-serif",
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                }
            },
            y: {
                ticks: {
                    color: '#a0a0a0',
                     font: {
                        family: "'Space Grotesk', sans-serif",
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                     borderColor: 'rgba(255, 255, 255, 0.1)'
                }
            }
        }
    };

    function initializeCategoryChart() {
        const ctx = document.getElementById('categoryChart')?.getContext('2d');
        if (!ctx) return;
        if (categoryChartInstance) categoryChartInstance.destroy();

        categoryChartInstance = new Chart(ctx, {
            type: currentCategoryChartType, // can be 'bar' or 'pie'
            data: {
                labels: ['Business Growth', 'People Development', 'Operational Process', 'Customer'],
                datasets: [{
                    label: 'KPIs by Category',
                    data: [5, 5, 10, 5],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.6)',
                        'rgba(16, 185, 129, 0.6)',
                        'rgba(245, 158, 11, 0.6)',
                        'rgba(239, 68, 68, 0.6)',
                    ],
                    borderColor: [
                        '#3b82f6',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                    ],
                    borderWidth: 2,
                }]
            },
            options: defaultChartOptions
        });
    }

    function initializeTrendChart() {
        const ctx = document.getElementById('trendChart')?.getContext('2d');
        if (!ctx) return;
        if (trendChartInstance) trendChartInstance.destroy();

        const completedData = [12, 15, 18, 20, 22, 18];
        const inProgressData = [8, 7, 6, 5, 4, 5];
        const atRiskData = [5, 3, 2, 0, 1, 2];

        const completedGradient = ctx.createLinearGradient(0, 0, 0, 400);
        completedGradient.addColorStop(0, 'rgba(16, 185, 129, 0.5)');
        completedGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
        
        const inProgressGradient = ctx.createLinearGradient(0, 0, 0, 400);
        inProgressGradient.addColorStop(0, 'rgba(245, 158, 11, 0.5)');
        inProgressGradient.addColorStop(1, 'rgba(245, 158, 11, 0)');

        const atRiskGradient = ctx.createLinearGradient(0, 0, 0, 400);
        atRiskGradient.addColorStop(0, 'rgba(239, 68, 68, 0.5)');
        atRiskGradient.addColorStop(1, 'rgba(239, 68, 68, 0)');

        trendChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Completed',
                    data: completedData,
                    borderColor: '#10b981',
                    backgroundColor: completedGradient,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#10b981',
                },
                {
                    label: 'In Progress',
                    data: inProgressData,
                    borderColor: '#f59e0b',
                    backgroundColor: inProgressGradient,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#f59e0b',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#f59e0b',
                },
                {
                    label: 'At Risk',
                    data: atRiskData,
                    borderColor: '#ef4444',
                    backgroundColor: atRiskGradient,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#ef4444',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#ef4444',
                }]
            },
            options: {
                ...defaultChartOptions,
                plugins: {
                    ...defaultChartOptions.plugins,
                    legend: {
                        position: 'top',
                        align: 'center',
                        labels: {
                            color: '#fff',
                            boxWidth: 20,
                            padding: 20,
                        }
                    }
                },
                scales: {
                    ...defaultChartOptions.scales,
                    y: {
                        ...defaultChartOptions.scales.y,
                         suggestedMax: 25,
                    }
                }
            }
        });
    }

    function initializePerformanceGauge() {
        const ctx = document.getElementById('performanceGauge')?.getContext('2d');
        if (!ctx) return;
        if (performanceGaugeInstance) performanceGaugeInstance.destroy();

        performanceGaugeInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Performance', 'Remaining'],
                datasets: [{
                    data: [84, 16],
                    backgroundColor: ['#f59e0b', '#374151'],
                    borderColor: ['#f59e0b', '#374151'],
                    borderWidth: 1,
                    circumference: 180,
                    rotation: 270,
                }]
            },
            options: {
                ...defaultChartOptions,
                plugins: {
                    ...defaultChartOptions.plugins,
                    legend: { display: false },
                     tooltip: { enabled: false }
                },
                responsive: true,
                maintainAspectRatio: true,
                cutout: '70%',
            }
        });
    }

    function initializeRoleDistributionChart() {
        const ctx = document.getElementById('roleDistributionChart')?.getContext('2d');
        if (!ctx) return;
        if (roleDistributionChartInstance) roleDistributionChartInstance.destroy();

        roleDistributionChartInstance = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: ['GIS Coordinator', 'GIS Lead', 'GIS Specialist', 'Geodatabase Specialist', 'GIS Analyst'],
                datasets: [{
                    data: [5, 5, 5, 5, 5],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(139, 92, 246, 0.7)'
                    ],
                }]
            },
            options: {
                 ...defaultChartOptions,
                plugins: {
                    ...defaultChartOptions.plugins,
                    legend: {
                        position: 'bottom',
                    }
                },
                 scales: {
                    r: {
                        ticks: {
                           display: false,
                           backdropColor: 'transparent'
                        },
                         grid: {
                           color: 'rgba(255, 255, 255, 0.1)',
                        }
                    }
                }
            }
        });
    }
    
    function initializeComparisonChart() {
        const ctx = document.getElementById('comparisonChart')?.getContext('2d');
        if (!ctx) return;
        if (comparisonChartInstance) comparisonChartInstance.destroy();
        
        comparisonChartInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Data Accuracy', 'Project Timelines', 'Training Sessions', 'New Tech', 'Issue Resolution'],
                datasets: [{
                    label: 'GIS Coordinator',
                    data: [95, 85, 90, 75, 88],
                    backgroundColor: 'rgba(59, 130, 246, 0.4)',
                    borderColor: '#3b82f6',
                    pointBackgroundColor: '#3b82f6',
                }, {
                    label: 'GIS Lead',
                    data: [88, 92, 85, 80, 90],
                    backgroundColor: 'rgba(16, 185, 129, 0.4)',
                    borderColor: '#10b981',
                    pointBackgroundColor: '#10b981',
                }, {
                    label: 'GIS Analyst',
                    data: [92, 80, 70, 65, 95],
                    backgroundColor: 'rgba(245, 158, 11, 0.4)',
                    borderColor: '#f59e0b',
                    pointBackgroundColor: '#f59e0b',
                }]
            },
            options: {
                ...defaultChartOptions,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' },
                        pointLabels: { 
                            color: '#fff',
                             font: {
                                family: "'Space Grotesk', sans-serif",
                                size: 12,
                            }
                        },
                        ticks: {
                            color: '#fff',
                            backdropColor: 'rgba(0,0,0,0.5)',
                            backdropPadding: 4,
                            font: {
                                family: "'Orbitron', monospace",
                            }
                        }
                    }
                }
            }
        });
    }

    const debouncedInitializeCharts = debounce(function() {
        if (document.getElementById('categoryChart')) initializeCategoryChart();
        if (document.getElementById('trendChart')) initializeTrendChart();
        if (document.getElementById('performanceGauge')) initializePerformanceGauge();
        if (document.getElementById('roleDistributionChart')) initializeRoleDistributionChart();
    }, 250);

    const debouncedInitializeComparisonChart = debounce(function() {
        if (document.getElementById('comparisonChart')) initializeComparisonChart();
    }, 250);


    window.initializeCharts = function() {
        debouncedInitializeCharts();
    };

    window.initializeComparisonChart = function() {
        debouncedInitializeComparisonChart();
    };

    window.toggleChartType = function(chartName) {
        if (chartName === 'category') {
            currentCategoryChartType = currentCategoryChartType === 'bar' ? 'pie' : 'bar';
            initializeCategoryChart();
        } else if (chartName === 'trend') {
            currentTrendChartType = currentTrendChartType === 'line' ? 'bar' : 'line';
            initializeTrendChart();
        }
    }

    // Initialize charts on first load if elements are present
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(window.initializeCharts, 1);
    } else {
        document.addEventListener("DOMContentLoaded", window.initializeCharts);
    }
})();
