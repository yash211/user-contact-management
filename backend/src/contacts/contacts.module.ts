import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { Contact } from '../common/entities/contact.entity';
import { FileUploadModule } from '../common/file-upload';

@Module({
  imports: [TypeOrmModule.forFeature([Contact]), FileUploadModule],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
