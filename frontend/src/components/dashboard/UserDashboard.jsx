import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { tokenService } from '../../services/api';
import Navbar from '../common/Navbar';
import ContactFilters from './ContactFilters';
import ContactsTable from './ContactsTable';
import Pagination from '../common/Pagination';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: ''
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleLogout = () => {
    tokenService.removeToken();
    dispatch(logout());
  };

  const mockContacts = [
    {
      id: 1,
      name: 'yash Gupta',
      email: 'yash@example.com',
      phone: '+1-555-0123',
      company: 'Tech Corp',
      status: 'active',
      category: 'work',
      createdAt: '2024-01-15'
    }
  ];

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  const getFilteredAndSortedContacts = () => {
    let filtered = mockContacts.filter(contact => {
      const matchesSearch = !filters.search || 
        contact.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        contact.email.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesSearch;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const filteredContacts = getFilteredAndSortedContacts();

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Email,Phone,Company,Status,Created Date\n"
      + filteredContacts.map(contact => 
          `${contact.name},${contact.email},${contact.phone},${contact.company},${contact.status},${contact.createdAt}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "contacts.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar 
        appName="Contact Management"
        userName={user?.name}
        onLogout={handleLogout}
      />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <ContactFilters 
          filters={filters}
          onFilterChange={handleFilterChange}
          onExportCSV={handleExportCSV}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />
        
        {filteredContacts.length > 0 ? (
          <>
            <ContactsTable contacts={filteredContacts} />
            
            <div className="mt-6 flex justify-end">
              <Pagination 
                currentPage={currentPage}
                totalPages={Math.ceil(filteredContacts.length / 10)}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-16 text-center">
            <div className="text-gray-400 mb-6">
              <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No contacts found</h3>
            <p className="text-gray-600 text-lg">Try adjusting your search criteria to find contacts.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
