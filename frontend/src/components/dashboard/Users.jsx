import React, { useState, useEffect } from 'react';
import { usersApi } from '../../services/api';
import UsersTable from './UsersTable';
import AddUserModal from './AddUserModal';
import Pagination from '../common/Pagination';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
      };
      const response = await usersApi.getUsers(params);
      if (response.data.success) {
        setUsers(response.data.data.users);
        setPagination(response.data.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAddUser = async (userData) => {
    try {
      alert(`Adding new user: ${userData.name} (${userData.email})`);
      const response = await usersApi.createUser(userData);
      if (response.data.success) {
        alert('User added successfully!');
        fetchUsers(); // Refresh the list
        return Promise.resolve();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create user';
      console.error('Error creating user:', err);
      alert(`Error: ${errorMessage}`);
      return Promise.reject(new Error(errorMessage));
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await usersApi.deleteUser(userId);
      if (response.data.success) {
        alert('User deleted successfully!');
        fetchUsers(); // Refresh the list
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete user';
      console.error('Error deleting user:', err);
      alert(`Error: ${errorMessage}`);
    }
  };



  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add User
        </button>
      </div>



      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Users Table */}
      {users.length > 0 ? (
        <>
          <UsersTable
            users={users}
            onDelete={handleDeleteUser}
          />
          
                     {pagination && pagination.total > pageSize && (
             <div className="mt-4 sm:mt-6 flex justify-center sm:justify-end">
               <Pagination 
                 currentPage={currentPage}
                 totalPages={Math.ceil(pagination.total / pageSize)}
                 onPageChange={handlePageChange}
               />
             </div>
           )}
        </>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <p className="text-gray-500 text-lg">No users found</p>
          <p className="text-gray-400 mt-2">No users available in the system</p>
        </div>
      )}

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
      />
    </div>
  );
};

export default Users;
