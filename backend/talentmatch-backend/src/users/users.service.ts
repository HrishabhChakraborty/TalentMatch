import {
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { users, type User } from '../database/schema';

type UserRole = 'RECRUITER' | 'CANDIDATE';

interface CreateUserResult {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof import('../database/schema')>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] ?? null;
  }

  async findById(id: number): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async create(
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ): Promise<CreateUserResult> {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [user] = await this.db
      .insert(users)
      .values({ name, email, password: hashedPassword, role })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });
    if (!user) throw new ConflictException('Insert failed');
    return user;
  }
}