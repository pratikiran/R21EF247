import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 9876;

const API_TOKEN = process.env.API_TOKEN;

let numbers: number[] = [];
let prevState: number[] = [];

const apiEndpoints: { [key: string]: string } = {
    p: 'http://20.244.56.144/test/primes',
    f: 'http://20.244.56.144/test/fibo',
    e: 'http://20.244.56.144/test/even',
    r: 'http://20.244.56.144/test/rand'
};

app.get('/numbers/:numberId', async (req: Request, res: Response) => {
    const numberId = req.params.numberId;
    const endpoint = apiEndpoints[numberId];
    if (!endpoint) {
        return res.status(404).json({ error: 'Invalid number ID' });
    }

    prevState = [...numbers];

    try {
        const response = await axios.get(endpoint, {
            timeout: 500,
            headers: {
                Authorization: `Bearer ${API_TOKEN}`
            }
        });
        numbers = [...numbers, ...response.data.numbers].slice(-10);
    } catch (error) {
        const typedError = error as Error;
        return res.status(500).json({ error: 'Failed to fetch number from external API', details: typedError.message });
    }

    const average = numbers.reduce((acc, cur) => acc + cur, 0) / numbers.length;
    res.json({
        windowPrevState: prevState,
        windowCurrState: numbers,  
        numbers,
        avg: average.toFixed(2)
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});