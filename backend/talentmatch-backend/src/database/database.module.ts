import { Module } from '@nestjs/common';
import { Pool } from 'pg';

export const DATABASE_POOL = 'DATABASE_POOL';

const databaseProvider = {
  provide: DATABASE_POOL,
  useValue: new Pool({
    user: 'postgres',                  // your username
    host: 'localhost',
    database: 'talentmatch',           // the database you created
    password: 'postgres',    // ← CHANGE THIS to the password you set
    port: 5432,
  }),
};

@Module({
  providers: [databaseProvider],
  exports: [databaseProvider],        // important so other files can use it
})
export class DatabaseModule {}