// Pricing data (per 1M tokens) - Updated 2026
const PRICING = {
    openai: {
        'GPT-5.2 Pro': { input: 21.00, output: 168.00, cache: true, batch: true, desc: 'Maximum capability flagship' },
        'GPT-5.2': { input: 1.75, output: 14.00, cache: true, batch: true, desc: 'Standard advanced model' },
        'GPT-5 mini': { input: 0.25, output: 2.00, cache: true, batch: true, desc: 'Fast, everyday tasks' },
        'GPT-5 nano': { input: 0.05, output: 0.40, cache: true, batch: true, desc: 'Budget tier efficiency' },
        'GPT-4o': { input: 2.5, output: 10, cache: true, batch: true, desc: 'Legacy flagship' },
        'GPT-4o Mini': { input: 0.15, output: 0.6, cache: true, batch: true, desc: 'Fast legacy model' },
        'GPT-4 Turbo': { input: 10, output: 30, cache: false, batch: false, desc: 'Previous flagship' }
    },
    anthropic: {
        'Claude 4.6 Opus': { input: 5.00, output: 25.00, cache: true, batch: true, desc: 'Most intelligent & capable' },
        'Claude 4.5 Sonnet': { input: 3.00, output: 15.00, cache: true, batch: true, desc: 'Best balance of speed/iq' },
        'Claude 4.5 Haiku': { input: 1.00, output: 5.00, cache: true, batch: true, desc: 'Fastest and most efficient' },
        'Claude 3.5 Sonnet': { input: 3, output: 15, cache: true, batch: false, desc: 'Legacy fast capability' },
        'Claude 3 Opus': { input: 15, output: 75, cache: true, batch: false, desc: 'Legacy flagship' }
    },
    google: {
        'Gemini 3 Pro': { input: 2.00, output: 12.00, cache: false, batch: false, desc: 'Next-gen flagship' },
        'Gemini 3 Flash': { input: 0.50, output: 3.00, cache: false, batch: false, desc: 'Speed and efficiency' },
        'Gemini 2.5 Flash': { input: 0.30, output: 2.50, cache: false, batch: false, desc: 'Legacy fast model' },
        'Gemini 2.5 Flash-Lite': { input: 0.10, output: 0.40, cache: false, batch: false, desc: 'Ultra-budget model' },
        'Gemini 1.5 Pro': { input: 1.25, output: 5, cache: false, batch: false, desc: 'Large context legacy' }
    },
    mistral: {
        'Mistral Large 2': { input: 3, output: 9, cache: false, batch: false, desc: 'Latest reasoning' },
        'Mistral Large': { input: 2, output: 6, cache: false, batch: false, desc: 'Top reasoning' },
        'Mistral Medium': { input: 0.7, output: 2.1, cache: false, batch: false, desc: 'Balanced' },
        'Mistral Small': { input: 0.2, output: 0.6, cache: false, batch: false, desc: 'Efficient' }
    },
    cohere: {
        'Command R+': { input: 3, output: 15, cache: false, batch: false, desc: 'Advanced RAG' },
        'Command R': { input: 0.5, output: 1.5, cache: false, batch: false, desc: 'Long context' },
        'Command': { input: 1, output: 2, cache: false, batch: false, desc: 'General' }
    },
    meta: {
        'Llama 3.1 405B': { input: 3.0, output: 3.0, cache: false, batch: false, desc: 'Frontier Open Source' },
        'Llama 3 70B': { input: 0.59, output: 0.79, cache: false, batch: false, desc: 'Open Source Powerhouse' },
        'Llama 3 8B': { input: 0.05, output: 0.08, cache: false, batch: false, desc: 'Fast & Efficient' }
    },
    xai: {
        'Grok-2': { input: 2, output: 5, cache: false, batch: false, desc: 'Latest advanced Rebel AI' },
        'Grok-1.5': { input: 3, output: 10, cache: false, batch: false, desc: 'Rebel AI' }
    },
    perplexity: {
        'Sonar Huge Online': { input: 5, output: 15, cache: false, batch: false, desc: 'Web Search API' },
        'Sonar Large Online': { input: 1, output: 3, cache: false, batch: false, desc: 'Fast Search' }
    },
    together: {
        'Llama 3 70B Turbo': { input: 0.9, output: 0.9, cache: false, batch: false, desc: 'Fast Llama 3' },
        'Mixtral 8x22B': { input: 1.2, output: 1.2, cache: false, batch: false, desc: 'MoE Architecture' }
    },
    groq: {
        'Llama 3 70B': { input: 0.59, output: 0.79, cache: false, batch: false, desc: 'Lightning Fast' },
        'Mixtral 8x7B': { input: 0.24, output: 0.24, cache: false, batch: false, desc: 'High Speed MoE' }
    }
};

const PRESETS = {
    chatbot: { requests: 1000, input: 100, output: 150 },
    content: { requests: 50, input: 200, output: 800 },
    support: { requests: 500, input: 300, output: 200 },
    code: { requests: 20, input: 500, output: 1000 }
};

const app = {
    period: 'custom',
    multiplier: 1,
    chart: null,

    init() {
        // Set default dates (today to +30 days)
        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setDate(today.getDate() + 30);
        
        document.getElementById('startDate').value = today.toISOString().split('T')[0];
        document.getElementById('endDate').value = nextMonth.toISOString().split('T')[0];

        this.updateModels();
        this.loadFromURL();
        this.calculatePeriod();
    },

    updateModels() {
        const provider = document.getElementById('provider').value;
        const select = document.getElementById('model');
        select.innerHTML = '';

        Object.keys(PRICING[provider]).forEach(model => {
            const opt = document.createElement('option');
            opt.value = model;
            opt.textContent = model;
            select.appendChild(opt);
        });

        // Trigger comparison highlight animation
        const compCard = document.getElementById('comparisonCard');
        if (compCard) {
            compCard.classList.remove('highlight-card');
            // Trigger reflow to restart animation
            void compCard.offsetWidth;
            compCard.classList.add('highlight-card');
        }

        this.calculate();
    },

    calculatePeriod() {
        const start = document.getElementById('startDate').value;
        const end = document.getElementById('endDate').value;
        
        if (start && end) {
            const startDate = new Date(start);
            const endDate = new Date(end);
            
            // Calculate days diff (min 1 day to avoid 0 multiplier)
            let diffTime = endDate - startDate;
            let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 1) {
                diffDays = 1;
                // Auto adjust end date if same or earlier
                const newEnd = new Date(startDate);
                newEnd.setDate(startDate.getDate() + 1);
                document.getElementById('endDate').value = newEnd.toISOString().split('T')[0];
            }
            
            this.multiplier = diffDays;
            document.getElementById('daysCount').textContent = `${this.multiplier} day${this.multiplier > 1 ? 's' : ''} selected`;
            document.getElementById('period').textContent = `per ${this.multiplier} days`;
        }
        
        this.calculate();
    },

    preset(type) {
        const p = PRESETS[type];
        // Presets are defined as 'per day', so we multiply by the selected range days
        document.getElementById('requests').value = p.requests * this.multiplier;
        document.getElementById('inputTokens').value = p.input;
        document.getElementById('outputTokens').value = p.output;
        this.calculate();
    },

    calculate() {
        const provider = document.getElementById('provider').value;
        const model = document.getElementById('model').value;
        const pricing = PRICING[provider][model];

        const requests = parseInt(document.getElementById('requests').value);
        const inputTokens = parseInt(document.getElementById('inputTokens').value);
        const outputTokens = parseInt(document.getElementById('outputTokens').value);
        const growth = parseFloat(document.getElementById('growth').value) / 100;
        const discount = parseFloat(document.getElementById('discount').value) / 100;
        const enterprise = parseFloat(document.getElementById('enterprise').value) / 100;
        const useCache = document.getElementById('cache').checked;
        const useBatch = document.getElementById('batch').checked;

        // Update slider displays
        document.getElementById('reqValue').textContent = requests.toLocaleString();
        document.getElementById('inValue').textContent = inputTokens.toLocaleString();
        document.getElementById('outValue').textContent = outputTokens.toLocaleString();

        // Calculate costs
        let inputPrice = pricing.input;
        let outputPrice = pricing.output;

        // Apply caching (assume 70% can be cached, 90% discount on cached)
        if (useCache && pricing.cache) {
            inputPrice = inputPrice * 0.3 + (inputPrice * 0.1 * 0.7);
        }

        // Apply batch discount
        if (useBatch && pricing.batch) {
            inputPrice *= 0.5;
            outputPrice *= 0.5;
        }

        const totalInput = requests * inputTokens * this.multiplier;
        const totalOutput = requests * outputTokens * this.multiplier;

        let inputCostVal = (totalInput / 1000000) * inputPrice;
        let outputCostVal = (totalOutput / 1000000) * outputPrice;
        let total = inputCostVal + outputCostVal;

        // Apply discounts
        total *= (1 - discount);
        total *= (1 - enterprise);

        const perRequestCost = total / (requests * this.multiplier);
        const daily = total / this.multiplier;

        // Update UI
        document.getElementById('totalCost').textContent = '$' + total.toFixed(2);
        document.getElementById('inputCost').textContent = '$' + inputCostVal.toFixed(2);
        document.getElementById('outputCost').textContent = '$' + outputCostVal.toFixed(2);
        document.getElementById('perRequest').textContent = '$' + perRequestCost.toFixed(4);
        document.getElementById('monthly').textContent = '$' + (daily * 30).toFixed(2);
        document.getElementById('yearly').textContent = '$' + (daily * 365).toFixed(2);

        // Model info
        document.getElementById('modelInfo').innerHTML = `
            <strong>${model}</strong> - ${pricing.desc}<br>
            <span style="color: #667eea;">Input: $${pricing.input}/1M • Output: $${pricing.output}/1M</span><br>
            ${pricing.cache ? '✅ Caching' : '❌ No caching'} | ${pricing.batch ? '✅ Batch' : '❌ No batch'}
        `;

        this.updateChart(daily, growth);
        this.updateComparison(requests, inputTokens, outputTokens);
        this.renderInsights(pricing, inputCostVal, outputCostVal, total, useCache, useBatch);
    },

    distributionChart: null,

    renderInsights(pricing, inputCost, outputCost, totalCost, useCache, useBatch) {
        try {
            // Render Pie Chart
            const ctx = document.getElementById('distributionChart').getContext('2d');
            if (this.distributionChart) this.distributionChart.destroy();
        
        this.distributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Input Prompts', 'Output Completions'],
                datasets: [{
                    data: [inputCost, outputCost],
                    backgroundColor: ['#f5576c', '#00f2fe'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: (context) => ` $${context.raw.toFixed(2)} (${Math.round((context.raw / totalCost) * 100)}%)`
                        }
                    }
                }
            }
        });

        // Render Optimization text
        const optBox = document.getElementById('optimizationContent');
        let html = '<ul style="padding-left: 20px; color: #555; font-size: 14px; line-height: 1.6;">';
        let foundOptimization = false;

        if (pricing.cache && !useCache) {
            html += `<li><strong>Enable Prompt Caching!</strong> This model supports caching. If your requests share >70% prefix tokens, enabling this can drastically reduce your input costs by up to 90%.</li>`;
            foundOptimization = true;
        }

        if (pricing.batch && !useBatch) {
            html += `<li><strong>Use Batch APIs!</strong> If your workload isn't time-sensitive (e.g., bulk processing within 24 hours), switching to the Batch API will instantly reduce this bill by <strong>50%</strong>.</li>`;
            foundOptimization = true;
        }
        
        if (!pricing.cache && !pricing.batch) {
            html += `<li>This specific model doesn't support Caching or Batching. Consider exploring <strong>Anthropic Claude</strong> or <strong>OpenAI GPT</strong> models if you have high-volume batch workloads to unlock massive savings.</li>`;
            foundOptimization = true;
        }

        if (inputCost > outputCost * 2) {
            html += `<li>Your costs are heavily skewed towards strict <strong>Input</strong> processing. Focus exclusively on reducing prompt size or applying RAG context filtering rather than output limits.</li>`;
        } else if (outputCost > inputCost * 2) {
            html += `<li>Your costs are dominated by <strong>Output</strong> lengths. Try instructing the model to be extremely concise or write in bullet points to save massive amounts of money.</li>`;
        }

        html += '</ul>';
        if (!foundOptimization) html = `<p style="color: #43e97b; font-weight: 600;">✅ Excellent! You are utilizing all major cost-saving features for this model.</p>` + html;
        optBox.innerHTML = html;
        } catch (error) {
            document.getElementById('optimizationContent').innerHTML = `<p style="color: red;">DEBUG ERROR: ${error.message} \n\n ${error.stack}</p>`;
        }
    },

    updateChart(dailyCost, growth) {
        const months = [];
        const costs = [];

        for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() + i);
            months.push(date.toLocaleString('default', { month: 'short' }));
            costs.push(dailyCost * 30 * Math.pow(1 + growth, i));
        }

        if (this.chart) this.chart.destroy();

        const ctx = document.getElementById('chart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Monthly Cost Projection',
                    data: costs,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return 'Cost: $' + context.parsed.y.toFixed(2);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    },

    updateComparison(requests, inputTokens, outputTokens) {
        const tbody = document.getElementById('comparisonBody');
        tbody.innerHTML = '';

        const currentProvider = document.getElementById('provider').value;
        const currentModel = document.getElementById('model').value;
        let comparisons = [];

        // Calculate for all providers
        Object.keys(PRICING).forEach(provider => {
            Object.keys(PRICING[provider]).forEach(model => {
                const p = PRICING[provider][model];
                const totalIn = requests * inputTokens;
                const totalOut = requests * outputTokens;
                const cost = (totalIn / 1000000) * p.input + (totalOut / 1000000) * p.output;

                comparisons.push({
                    provider: provider.charAt(0).toUpperCase() + provider.slice(1),
                    model,
                    perRequest: cost / requests,
                    daily: cost,
                    monthly: cost * 30,
                    isCurrent: provider === currentProvider && model === currentModel
                });
            });
        });

        // Sort by daily cost
        comparisons.sort((a, b) => a.daily - b.daily);

        const currentCost = comparisons.find(c => c.isCurrent)?.daily || 0;

        // Display top 10
        comparisons.slice(0, 10).forEach((c, i) => {
            const row = tbody.insertRow();
            if (i === 0) row.classList.add('cheapest');
            if (c.isCurrent) row.style.background = '#e3f2fd';

            const savings = currentCost - c.daily;
            const savingsPercent = currentCost > 0 ? ((savings / currentCost) * 100).toFixed(1) : 0;

            row.innerHTML = `
                <td><strong>${c.provider}</strong></td>
                <td>${c.model}</td>
                <td style="color: #667eea; font-weight: 600;">$${c.perRequest.toFixed(4)}</td>
                <td>$${c.daily.toFixed(2)}</td>
                <td>$${c.monthly.toFixed(2)}</td>
                <td>
                    ${savings > 0 ?
                    `<span style="color: #43e97b; font-weight: 600;">💰 Save $${savings.toFixed(2)} (${savingsPercent}%)</span>` :
                    savings < 0 ?
                        `<span style="color: #f5576c;">+$${Math.abs(savings).toFixed(2)}</span>` :
                        '<span style="color: #999;">✓ Current</span>'}
                </td>
            `;
        });
    },

    loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('provider')) {
            document.getElementById('provider').value = params.get('provider');
            this.updateModels();
            document.getElementById('model').value = params.get('model');
            document.getElementById('requests').value = params.get('requests');
            document.getElementById('inputTokens').value = params.get('input');
            document.getElementById('outputTokens').value = params.get('output');
        }
    }
};

// Utility Functions
function saveCalculation() {
    const name = prompt('Enter a name for this calculation:') || 'Unnamed';
    const calc = {
        name,
        date: new Date().toISOString(),
        provider: document.getElementById('provider').value,
        model: document.getElementById('model').value,
        requests: document.getElementById('requests').value,
        input: document.getElementById('inputTokens').value,
        output: document.getElementById('outputTokens').value,
        cost: document.getElementById('totalCost').textContent,
        monthly: document.getElementById('monthly').textContent,
        period: app.period
    };

    let saved = JSON.parse(localStorage.getItem('calculations') || '[]');
    saved.unshift(calc);
    saved = saved.slice(0, 50); // Keep last 50
    localStorage.setItem('calculations', JSON.stringify(saved));

    alert('✅ Calculation saved successfully!');
}

function shareCalculation() {
        const params = new URLSearchParams({
            provider: document.getElementById('provider').value,
            model: document.getElementById('model').value,
            requests: document.getElementById('requests').value,
            input: document.getElementById('inputTokens').value,
            output: document.getElementById('outputTokens').value
        });

        const url = window.location.origin + window.location.pathname + '?' + params.toString();

        try {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(url).then(() => {
                    alert('✅ Share link copied to clipboard!\n\n' + url);
                });
            } else {
                throw new Error("Clipboard unavailable");
            }
        } catch (e) {
            // Fallback for insecure contexts or failed clipboards
            prompt('Copy this share link below:', url);
        }
}

function exportPDF() {
    // Hide UI elements we don't want in the PDF
    const actionBar = document.querySelector('.action-bar');
    const advancedSettings = document.querySelectorAll('.card')[2]; // Advanced settings card
    
    // Backup original styles
    const originalDisplayBar = actionBar.style.display;
    const originalDisplaySettings = advancedSettings.style.display;
    
    actionBar.style.display = 'none';
    advancedSettings.style.display = 'none';
    
    window.print();
    
    // Restore
    actionBar.style.display = originalDisplayBar;
    advancedSettings.style.display = originalDisplaySettings;
}

function exportCSV() {
    const rows = [
        ['AI API Cost Calculation Report'],
        ['Generated', new Date().toLocaleString()],
        [''],
        ['Configuration'],
        ['Provider', document.getElementById('provider').value],
        ['Model', document.getElementById('model').value],
        ['Requests', document.getElementById('requests').value],
        ['Input Tokens per Request', document.getElementById('inputTokens').value],
        ['Output Tokens per Request', document.getElementById('outputTokens').value],
        ['Period', app.period],
        [''],
        ['Cost Summary'],
        ['Total Cost', document.getElementById('totalCost').textContent],
        ['Cost per Request', document.getElementById('perRequest').textContent],
        ['Monthly Cost', document.getElementById('monthly').textContent],
        ['Yearly Cost', document.getElementById('yearly').textContent],
        [''],
        ['Provider Comparison'],
        ['Provider', 'Model', 'Daily Cost', 'Monthly Cost']
    ];

    // Add comparison data
    const tbody = document.getElementById('comparisonBody');
    Array.from(tbody.rows).forEach(row => {
        const cells = Array.from(row.cells);
        rows.push([
            cells[0].textContent,
            cells[1].textContent,
            cells[3].textContent,
            cells[4].textContent
        ]);
    });

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'api-cost-calculation.csv';
    link.click();
    URL.revokeObjectURL(url);
}

function loadSaved() {
    const saved = JSON.parse(localStorage.getItem('calculations') || '[]');

    if (saved.length === 0) {
        alert('No saved calculations found.');
        return;
    }

    const list = saved.map((c, i) =>
        `${i + 1}. ${c.name} - ${c.cost} ${c.period} (${new Date(c.date).toLocaleDateString()})`
    ).join('\n');

    const choice = prompt('Select a calculation to load:\n\n' + list + '\n\nEnter number:');

    if (choice && !isNaN(choice)) {
        const index = parseInt(choice) - 1;
        if (index >= 0 && index < saved.length) {
            const calc = saved[index];
            document.getElementById('provider').value = calc.provider;
            app.updateModels();
            document.getElementById('model').value = calc.model;
            document.getElementById('requests').value = calc.requests;
            document.getElementById('inputTokens').value = calc.input;
            document.getElementById('outputTokens').value = calc.output;
            app.calculate();
            alert('✅ Calculation loaded!');
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}