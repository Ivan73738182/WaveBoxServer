const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const PORT = process.env.PORT || 3000;

// ВШИТЫЕ КЛЮЧИ (для теста)
const supabaseUrl = 'https://pgvwitrtkpmwbsgrbymu.supabase.co;
const supabaseKey = 'sb_publishable_S1t0uhFrdIxK0-hPimPOXg_E-MBaHRn'; 

const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/stations', async (req, res) => {
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
    console.error(err);
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
  console.log(`WaveBox Server запущен на порту ${PORT}`);
});
