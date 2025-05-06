document.addEventListener('DOMContentLoaded', () => {
    console.log("Public API Dashboard script loaded!");

    const API_URL_POSTS = 'https://jsonplaceholder.typicode.com/posts';
    const item1Container = document.getElementById('item1-container');
    const item1ChartCanvas = document.getElementById('item1Chart');
    const item1Status = document.getElementById('item1-status');
    const item1Title = item1Container.querySelector('h2');

    let item1ChartInstance = null; // To store the chart instance

    async function fetchData(apiUrl) {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching data:", error);
            return null; // Or throw the error to be caught by the caller
        }
    }

    function processPostsData(posts) {
        // For this initial step, let's count posts per userId
        // We'll make a simple bar chart: userId vs. number of posts
        if (!posts || posts.length === 0) {
            return { labels: [], data: [] };
        }

        const userPostCounts = posts.reduce((acc, post) => {
            acc[post.userId] = (acc[post.userId] || 0) + 1;
            return acc;
        }, {});

        const labels = Object.keys(userPostCounts);
        const data = Object.values(userPostCounts);

        return { labels, data };
    }

    function renderBarChart(canvasElement, labels, data, chartLabel, chartTitleElement, titleText) {
        if (item1ChartInstance) {
            item1ChartInstance.destroy(); // Destroy previous chart instance if exists
        }

        if (!canvasElement) {
            console.error("Canvas element not found for chart");
            return;
        }
        const ctx = canvasElement.getContext('2d');

        item1ChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: chartLabel,
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)', // Blue
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Posts'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'User ID'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: titleText
                    }
                }
            }
        });
        if (chartTitleElement) chartTitleElement.textContent = titleText;
    }


    async function loadItem1Data() {
        item1Status.textContent = 'Fetching posts data...';
        item1Title.textContent = 'JSONPlaceholder: Posts Analysis'; // Update title

        const posts = await fetchData(API_URL_POSTS);

        if (posts) {
            const { labels, data } = processPostsData(posts);
            if (labels.length > 0) {
                renderBarChart(item1ChartCanvas, labels, data, '# of Posts by User ID', item1Title, 'Posts per User ID (JSONPlaceholder)');
                item1Status.textContent = `Displaying ${posts.length} posts.`;
                item1Status.style.display = 'none'; // Hide status if successful
            } else {
                item1Status.textContent = 'No data to display in chart.';
            }
        } else {
            item1Status.textContent = 'Failed to load posts data.';
            // Optionally, clear or hide the chart canvas
            if (item1ChartInstance) item1ChartInstance.destroy();
            item1ChartCanvas.style.display = 'none';
        }
    }

    // Load data for item 1 when the page loads
    loadItem1Data();

});