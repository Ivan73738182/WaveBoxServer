const express = require('express');
const { spawn } = require('child_process');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('WaveBox Server is running! 🌊📻');
});

app.get('/ping', (req, res) => {
  res.json({ status: 'ok', message: 'WaveBox pong!' });
});

// Основной стрим: ?url=ССЫЛКА_НА_РАДИО
// Перекодирует в AAC 64kbps (экономия трафика)
app.get('/stream', (req, res) => {
  const streamUrl = req.query.url;
  if (!streamUrl) return res.status(400).send('Нужна ссылка на поток: /stream?url=...');

  res.setHeader('Content-Type', 'audio/aac');
  res.setHeader('Transfer-Encoding', 'chunked');

  // Запускаем ffmpeg для перекодирования
  const ffmpeg = spawn('ffmpeg', [
    '-i', streamUrl,
    '-c:a', 'aac',
    '-b:a', '64k',
    '-f', 'adts',
    'pipe:1'
  ]);

  ffmpeg.stdout.pipe(res);

  // Если клиент закрыл соединение — убиваем ffmpeg
  req.on('close', () => {
    ffmpeg.kill('SIGKILL');
  });
});

app.listen(PORT, () => {
  console.log(`WaveBox Server запущен на порту ${PORT}`);
});
