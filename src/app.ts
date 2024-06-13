import Fastify from 'fastify';
import { mealsRoutes } from './routes/meals';
import { usersRoutes } from './routes/users';

export const app = Fastify({
  logger: true,
});

app.register(usersRoutes, {
  prefix: 'users',
});

app.register(mealsRoutes, {
  prefix: 'meals',
});
