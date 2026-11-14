const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Простой прокси для радио
app.get('/stream', async (req, res) => {
  const streamUrl = req.query.url;
  if (!streamUrl) return res.status(400).send('Нужна ссылка на поток: /stream?url=...');

  try {
    // Запрашиваем поток у радиостанции и сразу отдаём клиенту
    const response = await fetch(streamUrl);
    if (!response.ok) throw new Error('Ошибка станции');

    res.setHeader('Content-Type', response.headers.get('content-type') || 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Передаём поток частями
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

app.listen(PORT, () => {
  console.log(`WaveBox Server запущен на порту ${PORT}`);
});
