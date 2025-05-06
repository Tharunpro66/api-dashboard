document.addEventListener('DOMContentLoaded', () => {
    console.log("Public API Dashboard script loaded!");

    // --- Constants for API URLs ---
    const API_URL_POSTS = 'https://jsonplaceholder.typicode.com/posts';
    const API_URL_COINGECKO_TOP10 = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false';

    // --- DOM Elements ---
    const refreshAllBtn = document.getElementById('refreshAllBtn');

    // Item 1 (JSONPlaceholder)
    const item1Container = document.getElementById('item1-container');
    const item1ChartCanvas = document.getElementById('item1Chart');
    const item1Status = document.getElementById('item1-status');
    const item1Title = item1Container.querySelector('h2');
    const item1Loader = document.getElementById('item1-loader');
    let item1ChartInstance = null;

    // Item 2 (CoinGecko)
    const item2Container = document.getElementById('item2-container');
    const item2ChartCanvas = document.getElementById('item2Chart');
    const item2Status = document.getElementById('item2-status');
    const item2Title = item2Container.querySelector('h2');
    const item2Loader = document.getElementById('item2-loader');
    let item2ChartInstance = null;

    // --- Helper: Toggle Loader Visibility ---
    function showLoader(loaderElement, show) {
        if (loaderElement) {
            loaderElement.style.display = show ? 'block' : 'none';
        }
    }

    // --- Helper: Set Status Message ---
    function setStatusMessage(statusElement, message, isError = false) {
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = 'status-message'; // Reset classes
            if (isError) {
                statusElement.classList.add('error'); // 'error' class isn't styled yet, but can be
            } else if (message) { // Only add success if there's a non-error message
                // statusElement.classList.add('success'); // Optional success styling
            }
        }
    }


    // --- Generic Fetch Function ---
    async function fetchData(apiUrl) {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                // Try to get error message from API response if available
                let errorMsg = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorData.error || errorMsg;
                } catch (e) { /* Ignore if error response isn't JSON */ }
                throw new Error(errorMsg);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching data from ${apiUrl}:`, error.message);
            throw error; // Re-throw to be caught by the caller
        }
    }

    // --- Generic Chart Rendering Function ---
    function renderChart(canvasElement, chartInstanceVarSetter, existingChartInstance, chartConfig, chartTitleElement, titleText) {
        if (existingChartInstance) {
            existingChartInstance.destroy();
        }
        if (!canvasElement) {
            console.error("Canvas element not found for chart:", titleText);
            return;
        }
        const ctx = canvasElement.getContext('2d');
        const newChartInstance = new Chart(ctx, chartConfig);
        chartInstanceVarSetter(newChartInstance);
        if (chartTitleElement) chartTitleElement.textContent = titleText;
    }


    // --- Item 1: JSONPlaceholder Posts ---
    function processPostsData(posts) {
        if (!posts || posts.length === 0) return { labels: [], data: [] };
        const userPostCounts = posts.reduce((acc, post) => {
            acc[post.userId] = (acc[post.userId] || 0) + 1;
            return acc;
        }, {});
        return { labels: Object.keys(userPostCounts).map(id => `User ${id}`), data: Object.values(userPostCounts) };
    }

    async function loadItem1Data() {
        showLoader(item1Loader, true);
        setStatusMessage(item1Status, ''); // Clear previous status
        item1Title.textContent = 'JSONPlaceholder Posts'; // Default title

        try {
            const posts = await fetchData(API_URL_POSTS);
            const { labels, data } = processPostsData(posts);

            if (labels.length > 0) {
                const chartConfig = {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: '# of Posts',
                            data: data,
                            backgroundColor: 'rgba(54, 162, 235, 0.7)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        scales: { y: { beginAtZero: true, title: { display: true, text: 'Number of Posts' } }, x: { title: { display: true, text: 'User ID' } } },
                        plugins: { legend: { display: true, position: 'top' }, title: { display: true, text: 'Posts per User (JSONPlaceholder)' } }
                    }
                };
                renderChart(item1ChartCanvas, (inst) => item1ChartInstance = inst, item1ChartInstance, chartConfig, item1Title, 'Posts per User (JSONPlaceholder)');
                item1ChartCanvas.style.display = 'block';
            } else {
                setStatusMessage(item1Status, 'No post data to display.', true);
                if (item1ChartInstance) item1ChartInstance.destroy();
                item1ChartCanvas.style.display = 'none';
            }
        } catch (error) {
            setStatusMessage(item1Status, `Error: ${error.message}`, true);
            if (item1ChartInstance) item1ChartInstance.destroy();
            item1ChartCanvas.style.display = 'none';
        } finally {
            showLoader(item1Loader, false);
        }
    }

    // --- Item 2: CoinGecko Top 10 Cryptocurrencies ---
    function processCoinGeckoData(coins) {
        if (!coins || coins.length === 0) return { labels: [], data: [] };
        const labels = coins.map(coin => coin.name);
        const data = coins.map(coin => coin.current_price);
        return { labels, data };
    }

    async function loadItem2Data() {
        showLoader(item2Loader, true);
        setStatusMessage(item2Status, '');
        item2Title.textContent = 'CoinGecko Crypto Prices';

        try {
            const coins = await fetchData(API_URL_COINGECKO_TOP10);
            const { labels, data } = processCoinGeckoData(coins);

            if (labels.length > 0) {
                const chartConfig = {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Price (USD)',
                            data: data,
                            backgroundColor: 'rgba(75, 192, 192, 0.7)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: false, // Prices might not start at zero
                                title: { display: true, text: 'Price in USD' },
                                ticks: { // Format Y-axis ticks as currency
                                    callback: function(value, index, values) {
                                        return '$' + value.toLocaleString();
                                    }
                                }
                            },
                            x: { title: { display: true, text: 'Cryptocurrency' } }
                        },
                        plugins: {
                            legend: { display: true, position: 'top' },
                            title: { display: true, text: 'Top 10 Crypto Prices (CoinGecko)' },
                            tooltip: { // Format tooltips as currency
                                callbacks: {
                                    label: function(context) {
                                        let label = context.dataset.label || '';
                                        if (label) {
                                            label += ': ';
                                        }
                                        if (context.parsed.y !== null) {
                                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                                        }
                                        return label;
                                    }
                                }
                            }
                        }
                    }
                };
                renderChart(item2ChartCanvas, (inst) => item2ChartInstance = inst, item2ChartInstance, chartConfig, item2Title, 'Top 10 Crypto Prices (CoinGecko)');
                item2ChartCanvas.style.display = 'block';
            } else {
                setStatusMessage(item2Status, 'No crypto data to display.', true);
                if (item2ChartInstance) item2ChartInstance.destroy();
                item2ChartCanvas.style.display = 'none';
            }
        } catch (error) {
            setStatusMessage(item2Status, `Error: ${error.message}`, true);
            if (item2ChartInstance) item2ChartInstance.destroy();
            item2ChartCanvas.style.display = 'none';
        } finally {
            showLoader(item2Loader, false);
        }
    }

    // --- Load All Data Function ---
    function loadAllData() {
        loadItem1Data();
        loadItem2Data();
    }

    // --- Event Listeners ---
    refreshAllBtn.addEventListener('click', loadAllData);

    // --- Initial Load ---
    loadAllData();

});