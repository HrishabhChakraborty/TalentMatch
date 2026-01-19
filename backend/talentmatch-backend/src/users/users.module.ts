import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from '../database/database.module';   // ← add this line

@Module({
  imports: [DatabaseModule],          // ← add this
  providers: [UsersService],
  exports: [UsersService],            // good practice if other modules need it
})
export class UsersModule {}