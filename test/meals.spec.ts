/* eslint-disable camelcase */
import { faker } from '@faker-js/faker';
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';
import { Meal, User } from 'knex/types/tables';
import request from 'supertest';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import { app } from '../src/app';

async function createNewUser() {
  return await request(app.server)
    .post('/users')
    .send({
      name: 'Test created user',
    })
    .expect(201);
}

async function createNewMeal(isMealIncludedOnDiet = true) {
  return await request(app.server)
    .post('/meals')
    .send({
      name: 'Test meal',
      description: 'Test meal description',
      meal_date_time: TIME_NOW,
      is_included_on_diet: isMealIncludedOnDiet,
      user_id: currentUser.id,
    })
    .expect(201);
}

let TIME_NOW: Date;

let currentUser: User;

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
    TIME_NOW = new Date();
    currentUser = (await createNewUser()).body[0];
  });

  describe('POST methods', () => {
    it('should create a new meal related to a specific user', async () => {
      const newMealResponse = await createNewMeal();

      expect(newMealResponse.status).toBe(201);

      expect(newMealResponse.body).toEqual([
        expect.objectContaining({
          name: 'Test meal',
          description: 'Test meal description',
          meal_date_time: TIME_NOW.toISOString(),
          is_included_on_diet: 1,
          user_id: currentUser.id,
        }),
      ]);
    });
  });

  describe('GET methods', () => {
    it('should return a list of meals for a specific user', async () => {
      const { id, user_id } = (await createNewMeal()).body[0];

      const listOfMealsResponse = await request(app.server)
        .get('/meals')
        .query({
          user_id: currentUser.id,
        })
        .expect(200);

      expect(listOfMealsResponse.body.meals).toEqual([
        expect.objectContaining({
          id,
          user_id,
        }),
      ]);
    });

    it('should return a specific meal by id', async () => {
      await createNewMeal();
      const { id: idSecondMealCreated, user_id: userIdSecondMealCreated } = (
        await createNewMeal()
      ).body[0];

      const secondMealCreatedResponse = await request(app.server)
        .get(`/meals/${idSecondMealCreated}`)
        .query({ user_id: userIdSecondMealCreated })
        .expect(200);

      expect(secondMealCreatedResponse.body).toEqual([
        expect.objectContaining({
          id: idSecondMealCreated,
          user_id: userIdSecondMealCreated,
        }),
      ]);
    });

    it('should not return a meal from a different user', async () => {
      const { id, user_id } = (await createNewMeal()).body[0];

      await request(app.server)
        .get(`/meals/${id}`)
        .query({ user_id })
        .expect(200);

      await request(app.server)
        .get(`/meals/${id}`)
        .query({ user_id: randomUUID() })
        .expect(404);
    });

    it('should return the highest streak of meals on diet by a user', async () => {
      await createNewMeal();
      await createNewMeal();
      await createNewMeal(false);

      const response = await request(app.server)
        .get('/meals/streak')
        .query({ user_id: currentUser.id })
        .expect(200);

      expect(response.body).toEqual({ highestStreak: 2, currentStreak: 0 });
    });

    it('should return the summary of meals by user', async () => {
      await createNewMeal();
      await createNewMeal();
      await createNewMeal(false);
      await createNewMeal();
      await createNewMeal(false);

      const summaryOfMealsResponse = await request(app.server)
        .get('/meals/totals')
        .query({ user_id: currentUser.id })
        .expect(200);

      expect(summaryOfMealsResponse.body).toEqual([
        {
          totalNumberOfMeals: 5,
          numberOfMealsOnDiet: 3,
          numberOfMealsOffDiet: 2,
        },
      ]);
    });

    it('should return HTTP status 404 for all GET methods if not found', async () => {
      await request(app.server)
        .get('/meals')
        .query({
          user_id: currentUser.id,
        })
        .expect(404);

      await request(app.server)
        .get('/meals/totals')
        .query({
          user_id: currentUser.id,
        })
        .expect(404);

      await request(app.server)
        .get('/meals/streak')
        .query({
          user_id: currentUser.id,
        })
        .expect(404);
    });
  });

  describe('DELETE method', () => {
    it('should delete a meal by ID', async () => {
      const { id, user_id } = (await createNewMeal()).body[0];

      await request(app.server)
        .delete(`/meals/${id}`)
        .query({ user_id })
        .expect(204);

      await request(app.server)
        .get(`/meals/${id}`)
        .query({ user_id })
        .expect(404);
    });

    it('should not be able to delete other users meals', async () => {
      const { id, user_id } = (await createNewMeal()).body[0];

      await request(app.server)
        .delete(`/meals/${id}`)
        .query({ user_id: randomUUID() })
        .expect(404);

      await request(app.server)
        .get(`/meals/${id}`)
        .query({ user_id })
        .expect(200);
    });
  });

  describe('PUT method', () => {
    it('should edit a meal by ID', async () => {
      const newMealCreated: Meal = (await createNewMeal()).body[0];
      const updatedMeal: Omit<Meal, 'id' | 'user_id'> = {
        description: faker.commerce.productDescription(),
        name: faker.commerce.productName(),
        is_included_on_diet: faker.number.int({ max: 1 }),
        meal_date_time: faker.date.recent().toISOString(),
      };
      const { id, user_id } = newMealCreated;

      await request(app.server)
        .put(`/meals/${id}`)
        .query({ user_id })
        .send(updatedMeal)
        .expect(204);

      const updatedMealResponse = await request(app.server)
        .get(`/meals/${id}`)
        .query({ user_id })
        .expect(200);

      expect(updatedMealResponse.body[0]).toEqual(
        expect.objectContaining(updatedMeal),
      );
    });

    it('should not be able to edit other users meals', async () => {
      const newMealCreated: Meal = (await createNewMeal()).body[0];
      const updatedMeal: Omit<Meal, 'id' | 'user_id'> = {
        description: faker.commerce.productDescription(),
        name: faker.commerce.productName(),
        is_included_on_diet: faker.number.int({ max: 1 }),
        meal_date_time: faker.date.recent().toISOString(),
      };
      const { id } = newMealCreated;

      await request(app.server)
        .put(`/meals/${id}`)
        .query({ user_id: randomUUID() })
        .send(updatedMeal)
        .expect(404);
    });
  });

  afterEach(() => {
    try {
      execSync('npm run knex migrate:rollback --all');
    } catch (error) {
      console.error('Rollback error:', error);
    }
  });
});
