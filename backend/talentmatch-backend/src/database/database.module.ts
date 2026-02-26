import { Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DRIZZLE = 'DRIZZLE';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'talentmatch',
  password: 'postgres',
  port: 5432,
  ssl: false,
});

@Module({
  providers: [
    {
      provide: DRIZZLE,
      useValue: drizzle(pool, { schema }),
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}