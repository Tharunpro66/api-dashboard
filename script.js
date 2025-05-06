document.addEventListener('DOMContentLoaded', () => {
    console.log("Public API Dashboard script loaded!");

    // --- Constants for API URLs ---
    const API_URL_POSTS = 'https://jsonplaceholder.typicode.com/posts';
    const API_URL_COINGECKO_TOP10 = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false';

    // --- DOM Elements for Item 1 (JSONPlaceholder) ---
    const item1Container = document.getElementById('item1-container');
    const item1ChartCanvas = document.getElementById('item1Chart');
    const item1Status = document.getElementById('item1-status');
    const item1Title = item1Container.querySelector('h2');
    let item1ChartInstance = null;

    // --- DOM Elements for Item 2 (CoinGecko) ---
    const item2Container = document.getElementById('item2-container');
    const item2ChartCanvas = document.getElementById('item2Chart');
    const item2Status = document.getElementById('item2-status');
    const item2Title = item2Container.querySelector('h2');
    let item2ChartInstance = null;


    // --- Generic Fetch Function ---
    async function fetchData(apiUrl) {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching data from ${apiUrl}:`, error);
            return null;
        }
    }

    // --- Generic Chart Rendering Function (Example for Bar Chart) ---
    // If charts become very different, you might have renderBarChart, renderLineChart etc.
    function renderChart(canvasElement, chartInstanceVarSetter, existingChartInstance, chartType, labels, dataPoints, datasetLabel, chartTitleElement, titleText, yAxisLabel = 'Value', xAxisLabel = 'Category') {
        if (existingChartInstance) {
            existingChartInstance.destroy();
        }

        if (!canvasElement) {
            console.error("Canvas element not found for chart:", titleText);
            return;
        }
        const ctx = canvasElement.getContext('2d');

        const newChartInstance = new Chart(ctx, {
            type: chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: datasetLabel,
                    data: dataPoints,
                    backgroundColor: chartType === 'bar' ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)', // Example colors
                    borderColor: chartType === 'bar' ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: yAxisLabel }
                    },
                    x: {
                        title: { display: true, text: xAxisLabel }
                    }
                },
                plugins: {
                    legend: { display: true, position: 'top' },
                    title: { display: true, text: titleText }
                }
            }
        });
        chartInstanceVarSetter(newChartInstance); // Use the setter to update the correct chart instance variable
        if (chartTitleElement) chartTitleElement.textContent = titleText;
    }


    // --- Item 1: JSONPlaceholder Posts ---
    function processPostsData(posts) {
        if (!posts || posts.length === 0) return { labels: [], data: [] };
        const userPostCounts = posts.reduce((acc, post) => {
            acc[post.userId] = (acc[post.userId] || 0) + 1;
            return acc;
        }, {});
        return { labels: Object.keys(userPostCounts), data: Object.values(userPostCounts) };
    }

    async function loadItem1Data() {
        item1Status.textContent = 'Fetching posts data...';
        item1Title.textContent = 'JSONPlaceholder Posts Analysis';

        const posts = await fetchData(API_URL_POSTS);

        if (posts) {
            const { labels, data } = processPostsData(posts);
            if (labels.length > 0) {
                renderChart(
                    item1ChartCanvas,
                    (inst) => item1ChartInstance = inst, // Setter function
                    item1ChartInstance,
                    'bar',
                    labels,
                    data,
                    '# of Posts by User ID',
                    item1Title,
                    'Posts per User ID (JSONPlaceholder)',
                    'Number of Posts',
                    'User ID'
                );
                item1Status.style.display = 'none';
            } else {
                item1Status.textContent = 'No data to display in chart.';
            }
        } else {
            item1Status.textContent = 'Failed to load posts data.';
            if (item1ChartInstance) item1ChartInstance.destroy();
            item1ChartCanvas.style.display = 'none';
        }
    }

    // --- Item 2: CoinGecko Top 10 Cryptocurrencies ---
    function processCoinGeckoData(coins) {
        if (!coins || coins.length === 0) return { labels: [], data: [] };
        const labels = coins.map(coin => coin.name); // Coin names for labels
        const data = coins.map(coin => coin.current_price); // Current prices for data
        return { labels, data };
    }

    async function loadItem2Data() {
        item2Status.textContent = 'Fetching crypto data...';
        item2Title.textContent = 'CoinGecko Crypto Prices';

        const coins = await fetchData(API_URL_COINGECKO_TOP10);

        if (coins) {
            const { labels, data } = processCoinGeckoData(coins);
            if (labels.length > 0) {
                renderChart(
                    item2ChartCanvas,
                    (inst) => item2ChartInstance = inst, // Setter function
                    item2ChartInstance,
                    'bar', // We'll use a bar chart for prices
                    labels,
                    data,
                    'Price (USD)',
                    item2Title,
                    'Top 10 Crypto Prices (CoinGecko)',
                    'Price in USD',
                    'Cryptocurrency'
                );
                item2Status.style.display = 'none';
            } else {
                item2Status.textContent = 'No crypto data to display in chart.';
            }
        } else {
            item2Status.textContent = 'Failed to load crypto data.';
            if (item2ChartInstance) item2ChartInstance.destroy();
            item2ChartCanvas.style.display = 'none';
        }
    }

    // --- Load All Data on Page Load ---
    loadItem1Data();
    loadItem2Data(); // Call to load the second item's data

});