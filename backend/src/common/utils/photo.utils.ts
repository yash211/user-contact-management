// Converts Buffer to base64 string for frontend consumption
export function bufferToBase64(buffer: Buffer | null): string | null {
  if (!buffer) return null;
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

// Converts base64 string back to Buffer for database storage
export function base64ToBuffer(base64: string | null): Buffer | null {
  if (!base64) return null;
  
  const base64Data = base64.replace(/^data:image\/[a-z]+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

// Transforms contact photo data for API response
export function transformContactPhoto(contact: any): any {
  if (contact && contact.photo) {
    try {
      if (contact.photo && typeof contact.photo === 'object' && contact.photo.type === 'Buffer' && Array.isArray(contact.photo.data)) {
        const buffer = Buffer.from(contact.photo.data);
        contact.photo = bufferToBase64(buffer);
      }
      else if (Buffer.isBuffer(contact.photo)) {
        contact.photo = bufferToBase64(contact.photo);
      }
    } catch (error) {
      contact.photo = null;
    }
  }
  return contact;
}

// Transforms multiple contacts photo data for API response
export function transformContactsPhotos(contacts: any[]): any[] {
  return contacts.map(contact => transformContactPhoto(contact));
}
