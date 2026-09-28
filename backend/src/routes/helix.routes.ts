import { FastifyInstance } from 'fastify';
import { HelixEngine } from '../services/helixEngine.js';

export async function helixRoutes(fastify: FastifyInstance) {
  fastify.post('/run/submit', async (req, reply) => {
    const { msisdn, floorsCleared, finalScore, durationSeconds } = req.body as {
      msisdn: string;
      floorsCleared: number;
      finalScore: number;
      durationSeconds: number;
    };

    if (!msisdn) return reply.status(400).send({ error: 'msisdn is required' });

    const result = await HelixEngine.recordRun({
      msisdn,
      floorsCleared: floorsCleared || 0,
      finalScore: finalScore || 0,
      durationSeconds: durationSeconds || 1,
    });

    return reply.send({ success: true, ...result });
  });
}
