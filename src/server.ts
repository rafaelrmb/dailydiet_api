import Fastify from 'fastify';
import { env } from './env';

const fastify = Fastify({
  logger: true,
});

fastify.listen({ port: env.PORT }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  console.log('Server running on ' + address);
});
