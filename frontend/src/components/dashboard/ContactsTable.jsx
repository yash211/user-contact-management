import React from 'react';

const ContactsTable = ({ contacts }) => {
  const handleEdit = (contactId) => {
    console.log('Edit contact:', contactId);
  };

  const handleDelete = (contactId) => {
    console.log('Delete contact:', contactId);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-700">
        <h2 className="text-2xl font-bold text-white">Contact Management System</h2>
        <p className="text-blue-100 mt-1">Manage and organize your contacts efficiently</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Name</th>
              <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Email</th>
              <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
              <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Company</th>
              <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {contact.name}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{contact.email}</div>
                </td>
                
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{contact.phone}</div>
                </td>
                
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{contact.company}</div>
                </td>
                
                <td className="px-8 py-6 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    contact.status === 'active' 
                      ? 'bg-green-100 text-green-800 ring-1 ring-green-200' 
                      : 'bg-red-100 text-red-800 ring-1 ring-red-200'
                  }`}>
                    {contact.status === 'active' ? (
                      <svg className="w-2 h-2 mr-1.5" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                    ) : (
                      <svg className="w-2 h-2 mr-1.5" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                    )}
                    {contact.status}
                  </span>
                </td>
                
                <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleEdit(contact.id)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Edit contact"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Delete contact"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactsTable;
