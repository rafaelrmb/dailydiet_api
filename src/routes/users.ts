import { randomUUID } from 'crypto';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', async (req, res) => {
    const users = await knex('users').select();
    return res.status(200).send({ users });
  });

  app.post('/', async (req, res) => {
    const createUserBodySchema = z
      .object({
        name: z.string(),
      })
      .safeParse(req.body);

    if (createUserBodySchema.error) {
      return res
        .status(400)
        .send({ message: 'A name must be provided to create a new user' });
    }

    const { name } = createUserBodySchema.data;

    const user = await knex('users')
      .insert({
        id: randomUUID(),
        name,
      })
      .returning('*');

    return res.status(201).send(user);
  });
}
