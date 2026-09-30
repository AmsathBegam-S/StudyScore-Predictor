document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('prediction-form');
    const resultSection = document.getElementById('result-section');
    const scoreElement = document.getElementById('predicted-score');
    const btnText = form.querySelector('button span');
    const btnSpinner = document.getElementById('btn-spinner');
    const btn = form.querySelector('button');
    let progressChart = null;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Show loading state
        btnText.style.display = 'none';
        btnSpinner.style.display = 'block';
        btn.disabled = true;

        const studyHours = document.getElementById('study_hours').value;
        const attendance = document.getElementById('attendance').value;

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    study_hours: studyHours,
                    attendance: attendance
                })
            });

            const data = await response.json();

            if (data.success) {
                // Animate score count up
                animateValue(scoreElement, 0, data.predicted_score, 1000);
                
                // Show result section if hidden
                resultSection.style.display = 'flex';
                
                // Update chart
                updateChart(data.trend_x, data.trend_y, parseFloat(studyHours), data.predicted_score);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Error fetching prediction:', error);
            alert('Failed to get prediction. Ensure the backend is running.');
        } finally {
            // Restore button state
            btnText.style.display = 'block';
            btnSpinner.style.display = 'none';
            btn.disabled = false;
        }
    });

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = (progress * (end - start) + start).toFixed(2);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function updateChart(labels, dataPoints, currentX, currentY) {
        const ctx = document.getElementById('progressChart').getContext('2d');
        
        if (progressChart) {
            progressChart.destroy();
        }

        // Create a point radius array to highlight the user's current prediction
        const pointRadius = labels.map(x => x === Math.round(currentX) ? 6 : 0);
        const pointColors = labels.map(x => x === Math.round(currentX) ? '#ec4899' : '#6366f1');

        // gradient for line
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

        Chart.defaults.color = 'rgba(255, 255, 255, 0.7)';
        Chart.defaults.font.family = "'Outfit', sans-serif";

        progressChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Score Trend vs Study Hours',
                    data: dataPoints,
                    borderColor: '#6366f1',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: pointRadius,
                    pointBackgroundColor: pointColors,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Score: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        title: {
                            display: true,
                            text: 'Study Hours'
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }
});
