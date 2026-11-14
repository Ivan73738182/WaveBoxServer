const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const PORT = process.env.PORT || 3000;

// Получаем переменные
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Проверяем, видит ли сервер ключи (выведем в логи, но не сами ключи)
console.log("=== ПРОВЕРКА КЛЮЧЕЙ ===");
console.log("SUPABASE_URL найден:", !!supabaseUrl);
console.log("SUPABASE_ANON_KEY найден:", !!supabaseKey);
if (supabaseUrl) console.log("URL начинается с:", supabaseUrl.substring(0, 15) + "...");
console.log("=======================");

let supabase = null;
if (supabaseUrl && supabaseKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseKey);
        console.log("Успешное подключение к Supabase!");
    } catch (e) {
        console.error("Ошибка при создании клиента Supabase:", e.message);
    }
} else {
    console.error("КРИТИЧЕСКАЯ ОШИБКА: Переменные окружения не заданы!");
}

app.get('/stations', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase не настроен (нет ключей)' });
    }
    try {
        const { data, error } = await supabase.from('stations').select('*');
        if (error) throw error;
        const formatted = data.map(s => ({
            name: s.name,
            desc: s.description,
            url: s.url
        }));
        res.json(formatted);
    } catch (err) {
        console.error("Ошибка запроса к базе:", err);
        res.status(500).json({ error: 'Ошибка загрузки станций' });
    }
});

app.get('/stream', async (req, res) => {
    const streamUrl = req.query.url;
    if (!streamUrl) return res.status(400).send('Нужна ссылка на поток: /stream?url=...');
    try {
        const response = await fetch(streamUrl);
        if (!response.ok) throw new Error('Ошибка станции');
        res.setHeader('Content-Type', response.headers.get('content-type') || 'audio/mpeg');
        res.setHeader('Transfer-Encoding', 'chunked');
        const reader = response.body.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
        }
        res.end();
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при получении потока');
    }
});

app.get('/', (req, res) => {
    res.send('WaveBox Server is running! 🌊📻');
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
