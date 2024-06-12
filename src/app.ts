import Fastify from 'fastify';
import { usersRoutes } from './routes/users';

export const app = Fastify({
  logger: true,
});

app.register(usersRoutes);
