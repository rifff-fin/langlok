import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

// Phase 0: health check only. Inquiries, uploads, Mongo and admin arrive in Phase 6.
const PORT = Number(process.env.PORT ?? 4000);
const CLIENT_ORIGIN = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173').split(',');

const app = express();
app.use(helmet());
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'versa-api', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`VERSA API listening on http://localhost:${PORT}`);
});
