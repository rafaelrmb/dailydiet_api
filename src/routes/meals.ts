import { randomUUID } from 'crypto';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';
import { validateSchema } from '../middlewares/paramsSchemaValidator';
import {
  mealParamSchema,
  mealQuerySchema,
  newMealBodySchema,
  updateMealBodySchema,
} from '../schemas/mealSchemas';

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    { preHandler: [validateSchema(newMealBodySchema, 'body')] },
    async (req, res) => {
      const {
        description,
        is_included_on_diet: isIncludedOnDiet,
        meal_date_time: mealDateTime,
        name,
        user_id: userId,
      } = req.body as z.infer<typeof newMealBodySchema>;

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
    },
  );

  app.get(
    '/',
    { preHandler: validateSchema(mealQuerySchema, 'query') },
    async (req, res) => {
      const { user_id: userId } = req.query as z.infer<typeof mealQuerySchema>;

      const listOfMealsCreatedByUser = await knex('meals').where(
        'user_id',
        userId,
      );

      return res.status(200).send({ meals: listOfMealsCreatedByUser });
    },
  );

  app.get(
    '/:id',
    {
      preHandler: [
        validateSchema(mealParamSchema, 'params'),
        validateSchema(mealQuerySchema, 'query'),
      ],
    },
    async (req, res) => {
      const { id: mealId } = req.params as z.infer<typeof mealParamSchema>;
      const { user_id: userId } = req.query as z.infer<typeof mealQuerySchema>;

      const mealFoundByUserAndMealId = await knex('meals').where({
        id: mealId,
        user_id: userId,
      });

      if (!mealFoundByUserAndMealId.length) {
        return res.status(404).send();
      }

      return res.status(200).send(mealFoundByUserAndMealId);
    },
  );

  app.delete(
    '/:id',
    {
      preHandler: [
        validateSchema(mealParamSchema, 'params'),
        validateSchema(mealQuerySchema, 'query'),
      ],
    },
    async (req, res) => {
      const { id: mealId } = req.params as z.infer<typeof mealParamSchema>;
      const { user_id: userId } = req.query as z.infer<typeof mealQuerySchema>;

      const sucessfulDeletionObject = await knex('meals')
        .where({ id: mealId, user_id: userId })
        .del();

      if (!sucessfulDeletionObject) {
        return res.status(404).send();
      }

      return res.status(204).send(sucessfulDeletionObject);
    },
  );

  app.put(
    '/:id',
    {
      preHandler: [
        validateSchema(mealParamSchema, 'params'),
        validateSchema(mealQuerySchema, 'query'),
        validateSchema(updateMealBodySchema, 'body'),
      ],
    },
    async (req, res) => {
      const { id } = req.params as z.infer<typeof mealParamSchema>;
      const { user_id: userId } = req.query as z.infer<typeof mealQuerySchema>;
      const {
        description,
        is_included_on_diet: isIncludedOnDiet,
        meal_date_time: mealDateTime,
        name,
      } = req.body as z.infer<typeof updateMealBodySchema>;

      const updatedMealResponse = await knex('meals')
        .where({ id, user_id: userId })
        .update({
          description,
          is_included_on_diet: isIncludedOnDiet,
          meal_date_time: mealDateTime,
          name,
        });

      if (!updatedMealResponse) {
        return res.status(404).send();
      }

      return res.status(204).send();
    },
  );

  app.get(
    '/streak',
    { preHandler: [validateSchema(mealQuerySchema, 'query')] },
    async (req, res) => {
      let currentStreak = 0;
      let highestStreak = 0;
      const { user_id: userId } = req.query as z.infer<typeof mealQuerySchema>;
      const allMealsList = await knex('meals').where('user_id', userId);

      allMealsList.forEach((meal) => {
        meal.is_included_on_diet ? currentStreak++ : (currentStreak = 0);

        if (highestStreak < currentStreak) highestStreak = currentStreak;
      });

      return res.status(200).send({ highestStreak, currentStreak });
    },
  );

  app.get(
    '/totals',
    {
      preHandler: [validateSchema(mealQuerySchema, 'query')],
    },
    async (req, res) => {
      const { user_id: userId } = req.query as z.infer<typeof mealQuerySchema>;

      const [numberOfMealsSummary] = await knex('meals')
        .where('user_id', userId)
        .select([
          knex.raw('COUNT(id) AS totalNumberOfMeals'),
          knex.raw(
            'COUNT(CASE WHEN is_included_on_diet THEN 1 ELSE NULL END) AS numberOfMealsOnDiet',
          ),
          knex.raw(
            'COUNT(CASE WHEN NOT is_included_on_diet THEN 1 ELSE NULL END) AS numberOfMealsOffDiet',
          ),
        ]);

      return res.status(200).send(numberOfMealsSummary);
    },
  );
}
