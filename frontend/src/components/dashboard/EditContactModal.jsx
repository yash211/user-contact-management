import React, { useState, useEffect } from 'react';
import { validateContactForm } from '../../utils/validation';

const EditContactModal = ({ isOpen, onClose, contact, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    photo: null
  });
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState('');
  const [isPhotoChanged, setIsPhotoChanged] = useState(false);

  useEffect(() => {
    if (contact && isOpen) {
      setFormData({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        photo: null
      });
      setPhotoPreview(contact.photo || '');
      setIsPhotoChanged(false);
      setErrors({});
    }
  }, [contact, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          photo: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          photo: 'Photo file size cannot exceed 5MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        photo: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      setIsPhotoChanged(true);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.photo;
        return newErrors;
      });
    }
  };

  const hasChanges = () => {
    return formData.name !== contact.name || 
           formData.email !== contact.email || 
           formData.phone !== contact.phone ||
           isPhotoChanged;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Use existing validation utils
    const { isValid, errors: validationErrors } = validateContactForm(formData);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Create contact data object - ONLY include fields that are being updated
      const contactData = {};
      
      // Always include name, email, phone (they are always present in form)
      contactData.name = formData.name.trim();
      contactData.email = formData.email.trim();
      contactData.phone = formData.phone.trim();

      // ONLY include photo if it was actually changed and is a valid file
      if (isPhotoChanged && formData.photo && formData.photo instanceof File) {
        contactData.photo = formData.photo;
      }
      // NOTE: If photo is NOT changed, we don't include photo field at all

      console.log('Sending contact data:', contactData);
      console.log('Photo included:', !!contactData.photo);
      console.log('Photo type:', contactData.photo ? typeof contactData.photo : 'none');

      const success = await onSubmit(contact.id, contactData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update contact. Please try again.');
    }
  };

  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Photo and Edit Icon */}
        <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt={contact.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-600">
                      {contact.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Edit Photo Icon */}
              <label className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-white text-center">
            Edit Contact
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter phone"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Photo Upload Hint */}
            {isPhotoChanged && (
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p>Photo updated! Click "Update Contact" to save changes.</p>
              </div>
            )}
            
            {/* Photo Error Display */}
            {errors.photo && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <p>{errors.photo}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !hasChanges()}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContactModal;
