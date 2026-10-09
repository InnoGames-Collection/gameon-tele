import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3600;
const BACKEND_PORT = process.env.BACKEND_PORT || 3602;

// Reverse-proxy all /api calls directly to Fastify backend on port 3602
app.use('/api', express.raw({ type: '*/*', limit: '10mb' }), async (req, res) => {
  const backendUrl = `http://127.0.0.1:${BACKEND_PORT}/api${req.url}`;
  try {
    const headers = { ...req.headers };
    delete headers.host;
    delete headers.connection;
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
    });
    res.status(response.status);
    response.headers.forEach((v, k) => {
      if (k.toLowerCase() !== 'content-encoding') {
        res.setHeader(k, v);
      }
    });
    const data = await response.arrayBuffer();
    res.send(Buffer.from(data));
  } catch (err) {
    res.status(502).json({ error: 'Backend Gateway Error', details: err.message });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'gameon-web', version: '1.0.0' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 GameOn Tele Web Client running on port ${PORT}`);
});
