import { db } from '../db';
import { users, sessions } from '../db/schema';
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

  async login(data: any) {
    // 1. Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user) {
      return { error: 'Email atau password salah' };
    }

    // 2. Verify password
    const isPasswordValid = await Bun.password.verify(data.password, user.password);
    if (!isPasswordValid) {
      return { error: 'Email atau password salah' };
    }

    // 3. Generate token
    const token = crypto.randomUUID();

    // 4. Save session
    await db.insert(sessions).values({
      token,
      userId: user.id,
    });

    return { data: token };
  },
};
