import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../common/entities/user.entity';
import { Contact } from '../common/entities/contact.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Contact])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
