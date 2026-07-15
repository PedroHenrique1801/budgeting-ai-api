const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const categories = ['AUTO', 'GROCERIES', 'PHARMA'];
let chartInstance = null;

async function loadDashboard() {
    const totals = [];
    let allTransactions = [];

    for (const cat of categories) {
        try {
            const sumRes = await fetch(`/transactions/sum/${cat}`);
            const sumData = await sumRes.json();
            const realValue = sumData.totalAmount / 100;
            totals.push(realValue);

            document.getElementById(`total-${cat.toLowerCase()}`).innerText = formatter.format(realValue);
        } catch (e) {
            totals.push(0);
        }

        try {
            const listRes = await fetch(`/transactions/${cat}`);
            const listData = await listRes.json();
            allTransactions = allTransactions.concat(listData);
        } catch (e) {}
    }

    renderChart(totals);
    renderTable(allTransactions);
}

function renderChart(totals) {
    const ctx = document.getElementById('expensesChart').getContext('2d');

    if (chartInstance) chartInstance.destroy();

    const sum = totals.reduce((a, b) => a + b, 0);

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        plugins: [ChartDataLabels],
        data: {
            labels: ['Automóvel', 'Mercado', 'Farmácia'],
            datasets: [{
                data: totals,
                backgroundColor: ['#2a5298', '#ff4b2b', '#11998e'],
                borderWidth: 3,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 20,
                        font: {
                            size: 13,
                            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                        }
                    }
                },
                datalabels: {
                    color: '#ffffff',
                    font: {
                        weight: 'bold',
                        size: 14
                    },
                    formatter: (value) => {
                        if (value === 0 || sum === 0) return null;
                        return ((value / sum) * 100).toFixed(0) + '%';
                    }
                }
            }
        }
    });
}

function renderTable(transactions) {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Nenhuma transação registrada.</td></tr>';
        return;
    }

    transactions.forEach(tx => {
        const tr = document.createElement('tr');
        const shortId = tx.id ? tx.id.substring(0, 8) : 'N/A';

        tr.innerHTML = `
            <td style="font-family: monospace; color: #a2a3b7;">#${shortId}</td>
            <td><span class="tag tag-${tx.category.toLowerCase()}">${tx.category}</span></td>
            <td style="font-weight: 600;">${formatter.format(tx.amount / 100)}</td>
        `;
        tbody.appendChild(tr);
    });
}

let mediaRecorder;
let audioChunks = [];
let isRecording = false;

const recordBtn = document.getElementById('recordBtn');
const recordStatus = document.getElementById('recordStatus');

recordBtn.addEventListener('click', async () => {
    if (!isRecording) {
        await startRecording();
    } else {
        stopRecording();
    }
});

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            recordStatus.innerText = "Processando dados com Inteligência Artificial...";

            const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
            const formData = new FormData();
            formData.append("file", audioBlob, "gravacao.mp3");

            try {
                const response = await fetch('/transactions/ai', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    recordStatus.innerText = "Transação salva e classificada com sucesso.";
                    loadDashboard();
                } else {
                    recordStatus.innerText = "Falha ao classificar a transação.";
                }
            } catch (error) {
                recordStatus.innerText = "Erro de comunicação com o servidor web.";
            }

            audioChunks = [];
            setTimeout(() => recordStatus.innerText = "", 5000);
        };

        audioChunks = [];
        mediaRecorder.start();
        isRecording = true;

        document.getElementById('recordText').innerText = "Parar Gravação";
        recordBtn.classList.add("recording-pulse");
        recordStatus.innerText = "Gravando áudio...";

    } catch (err) {
        recordStatus.innerText = "Acesso ao microfone negado.";
    }
}

function stopRecording() {
    mediaRecorder.stop();
    isRecording = false;

    document.getElementById('recordText').innerText = "Gravar Áudio";
    recordBtn.classList.remove("recording-pulse");
}

document.getElementById('sendChatBtn').addEventListener('click', async () => {
    const input = document.getElementById('chatInput');
    const responseDiv = document.getElementById('chatResponse');
    const question = input.value.trim();

    if (!question) return;

    responseDiv.innerText = "Buscando dados no servidor e formulando analise...";
    input.value = '';

    try {
        const response = await fetch('/transactions/advisor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: question })
        });

        const data = await response.json();
        responseDiv.innerText = data.advice;
    } catch (error) {
        responseDiv.innerText = "Serviço de consultoria temporariamente indisponivel.";
    }
});

window.onload = loadDashboard;