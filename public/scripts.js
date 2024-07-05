document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:5000/api/tickers')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('ticker-table');
            tableBody.innerHTML = '';

            data.forEach((ticker, index) => {
             
                const lastPrice = parseFloat(ticker.last);
                const openPrice = parseFloat(ticker.open);
                const difference = (((lastPrice - openPrice) / openPrice) * 100).toFixed(2);

               
                const buyPrice = parseFloat(ticker.buy);
                const sellPrice = parseFloat(ticker.sell);
                const savings = (buyPrice - sellPrice).toFixed(2);

                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${ticker.name}</td>
                    <td>₹ ${lastPrice}</td>
                    <td>₹ ${buyPrice} / ₹ ${sellPrice}</td>
                    <td class="${difference >= 0 ? 'positive' : 'negative'}">${difference} %</td>
                    <td class="${savings >= 0 ? 'positive' : 'negative'}">₹ ${savings}</td>
                `;

                tableBody.appendChild(row);
            });

            const bestPrice = data.reduce((acc, ticker) => acc + parseFloat(ticker.last), 0) / data.length;
            document.getElementById('best-price').innerText = bestPrice.toFixed(2);

            document.getElementById('change-5mins').innerText = '0.42 %';
            document.getElementById('change-1hour').innerText = '0.98 %';
            document.getElementById('change-1day').innerText = '6.75 %';
            document.getElementById('change-7days').innerText = '15.8 %';
        })
        .catch(error => console.error('Error fetching data:', error));
});
