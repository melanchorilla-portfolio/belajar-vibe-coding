import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const usersService = {
  async register(data: any) {
    // 1. Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser.length > 0) {
      return { error: 'Email sudah terdaftar' };
    }

    // 2. Hash password
    const hashedPassword = await Bun.password.hash(data.password, 'bcrypt');

    // 3. Insert user
    await db.insert(users).values({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    return { data: 'OK' };
  },
};
