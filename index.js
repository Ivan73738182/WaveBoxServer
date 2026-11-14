const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Список станций (пока прямо в коде, позже вынесем в базу)
const stations = [
  {
    id: 1,
    name: "Европа Плюс",
    desc: "Популярная музыка",
    url: "http://ep128.hostingradio.ru:8030/ep128"
  },
  {
    id: 2,
    name: "Ретро FM",
    desc: "Музыка 80-х и 90-х",
    url: "http://retroserver.streamr.ru:8043/retro256.mp3"
  }
];

// Эндпоинт для получения списка станций
app.get('/stations', (req, res) => {
  res.json(stations);
});

// Прокси-стрим (как был)
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
