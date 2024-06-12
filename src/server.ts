import Fastify from 'fastify';
import { env } from './env';
import { usersRoutes } from './routes/users';

const app = Fastify({
  logger: true,
});

app.register(usersRoutes);

app.listen({ port: env.PORT }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }

  console.log('Server running on ' + address);
});
