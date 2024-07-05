require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on('connect', () => {
    console.log('Database connected successfully');
});

const fetchAndStoreData = async () => {
    try {
        const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
        const tickers = response.data;
        const top10Tickers = Object.values(tickers).slice(0, 10);

        const client = await pool.connect();
        await client.query('TRUNCATE TABLE tickers');

        for (const ticker of top10Tickers) {
            const { name, last, buy, sell, volume, base_unit, open } = ticker;
            await client.query(
                'INSERT INTO tickers (name, last, buy, sell, volume, base_unit, open) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [name, last, buy, sell, volume, base_unit, open]
            );
        }

        client.release();
    } catch (error) {
        console.error('Error fetching or storing data', error);
    }
};


app.get('/api/tickers', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM tickers');
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error('Error retrieving data', error);
        res.status(500).send('Internal Server Error');
    }
});

setInterval(fetchAndStoreData, 3600000);
fetchAndStoreData();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
