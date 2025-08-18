import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Contact } from '../common/entities/contact.entity';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendContactCreatedEmail(contact: Contact, userEmail: string, userName: string): Promise<void> {
    try {
      // Debug: Log email attempt
      console.log('Attempting to send email to:', userEmail);

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
      console.log(`Email sent successfully to ${userEmail} for contact creation`);
    } catch (error) {
      console.error('Failed to send contact creation email:', error);
      // Don't throw error to avoid breaking the contact creation flow
    }
  }
}
