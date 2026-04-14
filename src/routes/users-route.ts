import { Elysia, t } from 'elysia';
import { usersService } from '../services/users-service';

export const usersRoute = new Elysia({ prefix: '/api' })
  .post('/users', async ({ body, set }) => {
    const result = await usersService.register(body);

    if (result.error) {
      set.status = 400; // Bad Request
      return result;
    }

    set.status = 201; // Created
    return result;
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      password: t.String()
    })
  });
