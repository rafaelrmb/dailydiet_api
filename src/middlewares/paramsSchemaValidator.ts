import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodSchema } from 'zod';

export const validateSchema =
  (schema: ZodSchema, source: 'body' | 'params' | 'query') =>
  async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      req[source] = schema.parse(req[source]);
    } catch (e) {
      return reply.status(400).send(e);
    }
  };
