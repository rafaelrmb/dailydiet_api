/* eslint-disable camelcase */
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';
import { User } from 'knex/types/tables';
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

async function createNewMeal() {
  return await request(app.server)
    .post('/meals')
    .send({
      name: 'Test meal',
      description: 'Test meal description',
      meal_date_time: TIME_NOW,
      is_included_on_diet: true,
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
      const { id: idSeconMealCreated, user_id: userIdSecondMealCreated } = (
        await createNewMeal()
      ).body[0];

      const secondMealCreatedResponse = await request(app.server)
        .get(`/meals/${idSeconMealCreated}`)
        .query({ user_id: userIdSecondMealCreated })
        .expect(200);

      expect(secondMealCreatedResponse.body).toEqual([
        expect.objectContaining({
          id: idSeconMealCreated,
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
  });

  afterEach(() => {
    try {
      execSync('npm run knex migrate:rollback --all');
    } catch (error) {
      console.error('Rollback error:', error);
    }
  });
});
