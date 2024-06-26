import { execSync } from 'node:child_process';
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

async function createNewUser(name?: string) {
  return await request(app.server).post('/users').send({
    name,
  });
}

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  describe('GET methods', () => {
    it('should return the list of users', async () => {
      await createNewUser('Testing name');

      const getUsersResponse = await request(app.server).get('/users');

      expect(getUsersResponse.body.users).toEqual([
        expect.objectContaining({
          name: 'Testing name',
        }),
      ]);
    });

    it('should return a user with a specific ID', async () => {
      const createUserResponse = await createNewUser('test test test');
      const { id } = createUserResponse.body[0];

      const userFoundByIdResponse = await request(app.server)
        .get(`/users/${id}`)
        .expect(200);

      expect(userFoundByIdResponse.body).toEqual(
        expect.objectContaining({
          id,
        }),
      );
    });

    it('should return status code 404 for not found user ID', async () => {
      await request(app.server)
        .get(`/users/659a897b-8b96-4752-ae22-79d4a3f05c1e`)
        .expect(404);
    });
  });

  describe('POST methods', () => {
    it('should be able to create users', async () => {
      const createUserResponse = await createNewUser('Testing name');

      expect(createUserResponse.body[0].name).toBe('Testing name');
    });

    it('should not create a user if the req body is empty or invalid', async () => {
      const invalidUserCreatedResponse = await createNewUser();

      expect(invalidUserCreatedResponse.status).toBe(400);
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
