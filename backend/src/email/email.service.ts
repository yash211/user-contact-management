import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Contact } from '../common/entities/contact.entity';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  // Sends email notification when a contact is created
  async sendContactCreatedEmail(contact: Contact, userEmail: string, userName: string): Promise<void> {
    try {
      const emailContent = `
Hello ${userName},

A new contact has been successfully added to your contact management system.

Contact Details:
- Name: ${contact.name}
- Email: ${contact.email}
- Phone: ${contact.phone || 'Not provided'}
- Created: ${new Date(contact.createdAt).toLocaleString()}

Thank you for using our Contact Management System.

Best regards,
Contact Management Team
      `;

      await this.mailerService.sendMail({
        to: userEmail,
        subject: 'New Contact Created Successfully',
        text: emailContent,
      });
    } catch (error) {
      console.error('Failed to send contact creation email:', error);
    }
  }
}
