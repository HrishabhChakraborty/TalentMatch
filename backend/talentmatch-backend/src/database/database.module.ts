import { Module } from '@nestjs/common';
import { Pool } from 'pg';

export const DATABASE_POOL = 'DATABASE_POOL';

const databaseProvider = {
  provide: DATABASE_POOL,
  useValue: new Pool({
    user: 'postgres',                
    host: 'localhost',
    database: 'talentmatch',        
    password: 'postgres',   
    port: 5432,
  }),
};

@Module({
  providers: [databaseProvider],
  exports: [databaseProvider],        
})
export class DatabaseModule {}