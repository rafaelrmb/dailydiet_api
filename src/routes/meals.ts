import { randomUUID } from 'crypto';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', async (req, res) => {
    const newMealBodySchema = z
      .object({
        name: z.string(),
        description: z.string(),
        meal_date_time: z.string().datetime(),
        is_included_on_diet: z.boolean(),
        user_id: z.string().uuid(),
      })
      .parse(req.body);

    const {
      description,
      is_included_on_diet: isIncludedOnDiet,
      meal_date_time: mealDateTime,
      name,
      user_id: userId,
    } = newMealBodySchema;

    const meal = await knex('meals')
      .insert({
        id: randomUUID(),
        description,
        is_included_on_diet: isIncludedOnDiet,
        meal_date_time: mealDateTime,
        name,
        user_id: userId,
      })
      .returning('*');

    return res.status(201).send(meal);
  });
}
