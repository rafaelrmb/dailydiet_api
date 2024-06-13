import { execSync } from 'child_process';
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
  return await request(app.server).post('/users').send({
    name: 'Test created user',
  });
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
      const newMealResponse = await request(app.server).post('/meals').send({
        name: 'Test meal',
        description: 'Test meal description',
        meal_date_time: TIME_NOW,
        is_included_on_diet: true,
        user_id: currentUser.id,
      });

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

  afterEach(() => {
    try {
      execSync('npm run knex migrate:rollback --all');
    } catch (error) {
      console.error('Rollback error:', error);
    }
  });
});
