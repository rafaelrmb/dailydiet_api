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

  app.get('/', async (req, res) => {
    const requestBodySchema = z
      .object({
        user_id: z.string().uuid(),
      })
      .parse(req.query);

    const { user_id: userId } = requestBodySchema;

    const listOfMealsCreatedByUser = await knex('meals').where(
      'user_id',
      userId,
    );

    return res.status(200).send({ meals: listOfMealsCreatedByUser });
  });

  app.get('/:id', async (req, res) => {
    const reqParamsSchema = z
      .object({
        id: z.string().uuid(),
      })
      .parse(req.params);

    const reqQuerySchema = z
      .object({
        user_id: z.string().uuid(),
      })
      .parse(req.query);

    const { id: mealId } = reqParamsSchema;
    const { user_id: userId } = reqQuerySchema;

    const mealFoundByUserAndMealId = await knex('meals').where({
      id: mealId,
      user_id: userId,
    });

    if (!mealFoundByUserAndMealId.length) {
      return res.status(404).send();
    }

    return res.status(200).send(mealFoundByUserAndMealId);
  });

  app.delete('/:id', async (req, res) => {
    const reqParamsSchema = z
      .object({
        id: z.string().uuid(),
      })
      .parse(req.params);

    const reqQuerySchema = z
      .object({
        user_id: z.string().uuid(),
      })
      .parse(req.query);

    const { id: mealId } = reqParamsSchema;
    const { user_id: userId } = reqQuerySchema;

    const sucessfulDeletionObject = await knex('meals')
      .where({ id: mealId, user_id: userId })
      .del();

    if (!sucessfulDeletionObject) {
      return res.status(404).send();
    }

    return res.status(204).send(sucessfulDeletionObject);
  });
}
