import React from 'react';

const UsersTable = ({ users, onDelete }) => {
  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      onDelete(userId);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 lg:px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 sm:px-6 lg:px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 sm:px-6 lg:px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-4 sm:px-6 lg:px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 sm:px-6 lg:px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 sm:px-6 lg:px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 sm:px-6 lg:px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 sm:px-6 lg:px-8 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-4 sm:px-6 lg:px-8 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-4 sm:px-6 lg:px-8 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.phone || 'N/A'}</div>
                </td>
                <td className="px-4 sm:px-6 lg:px-8 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 sm:px-6 lg:px-8 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 sm:px-6 lg:px-8 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 sm:px-6 lg:px-8 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;
