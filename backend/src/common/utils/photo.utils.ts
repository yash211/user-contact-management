/**
 * Utility functions for handling photo data transformations
 */

/**
 * Convert Buffer to base64 string for frontend consumption
 */
export function bufferToBase64(buffer: Buffer | null): string | null {
  if (!buffer) return null;
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

/**
 * Convert base64 string back to Buffer for database storage
 */
export function base64ToBuffer(base64: string | null): Buffer | null {
  if (!base64) return null;
  
  // Remove data URL prefix if present
  const base64Data = base64.replace(/^data:image\/[a-z]+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

/**
 * Transform contact photo data for API response
 */
export function transformContactPhoto(contact: any): any {
  if (contact.photo && Buffer.isBuffer(contact.photo)) {
    contact.photo = bufferToBase64(contact.photo);
  }
  return contact;
}

/**
 * Transform multiple contacts photo data for API response
 */
export function transformContactsPhotos(contacts: any[]): any[] {
  return contacts.map(contact => transformContactPhoto(contact));
}
