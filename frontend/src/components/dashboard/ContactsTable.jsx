import React from 'react';

const ContactsTable = ({ contacts }) => {
  const handleEdit = (contactId) => {
    // TODO: Implement edit functionality
    console.log('Edit contact:', contactId);
  };

  const handleDelete = (contactId) => {
    // TODO: Implement delete functionality
    console.log('Delete contact:', contactId);
  };

    return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header - Responsive */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gradient-to-r from-blue-600 to-indigo-700">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Contact Management System</h2>
        <p className="text-blue-100 mt-1 text-sm sm:text-base">Manage and organize your contacts efficiently</p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 sm:px-6 lg:px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Name</th>
              <th className="px-4 sm:px-6 lg:px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Email</th>
              <th className="px-4 sm:px-6 lg:px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
              
              
              <th className="px-4 sm:px-6 lg:px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                                 <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap">
                   <div className="flex items-center">
                     <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                                               {contact.photo ? (
                          <>
                            <img
                              src={contact.photo}
                              alt={contact.name}
                              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-gray-200"
                              style={{ minWidth: '32px', minHeight: '32px' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm hidden">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                          </>
                                                ) : (
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                     </div>
                     <div className="ml-3 sm:ml-4">
                       <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                         {contact.name}
                       </div>
                     </div>
                   </div>
                 </td>

                <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{contact.email}</div>
                </td>

                <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{contact.phone}</div>
                </td>

                



                <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2 sm:space-x-3">
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

      {/* Mobile Cards */}
      <div className="md:hidden">
        {contacts.map((contact) => (
          <div key={contact.id} className="p-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
            <div className="flex items-start justify-between">
                             <div className="flex items-center space-x-3">
                 <div className="flex-shrink-0 h-10 w-10">
                   {contact.photo ? (
                     <>
                       <img
                         src={contact.photo}
                         alt={contact.name}
                         className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                         style={{ minWidth: '40px', minHeight: '40px' }}
                         onError={(e) => {
                           e.target.style.display = 'none';
                           e.target.nextSibling.style.display = 'flex';
                         }}
                       />
                       <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm hidden">
                         {contact.name.charAt(0).toUpperCase()}
                       </div>
                     </>
                   ) : (
                     <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                       {contact.name.charAt(0).toUpperCase()}
                     </div>
                   )}
                 </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{contact.name}</div>
                                     <div className="text-sm text-gray-600">{contact.email}</div>
                   <div className="text-sm text-gray-600">{contact.phone}</div>

                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(contact.id)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200"
                  title="Edit contact"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                <button
                  onClick={() => handleDelete(contact.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200"
                  title="Delete contact"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactsTable;
