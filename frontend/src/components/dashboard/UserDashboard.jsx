import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { tokenService, contactsApi } from '../../services/api';
import Navbar from '../common/Navbar';
import ContactFilters from './ContactFilters';
import ContactsTable from './ContactsTable';
import Pagination from '../common/Pagination';
import AddContactModal from './AddContactModal';


const UserDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [filters, setFilters] = useState({
    search: ''
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [contacts, setContacts] = useState([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [currentPage, sortBy, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleLogout = () => {
    tokenService.removeToken();
    dispatch(logout());
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: pageSize,
        search: filters.search || undefined,
        sortBy: sortBy,
        sortOrder: sortOrder
      };
      
             const response = await contactsApi.getContacts(params);
       
               if (response.data.success) {
          const contactsData = response.data.data.contacts || [];
          const paginationData = response.data.data.pagination;
          
          // Process contacts - photos are now base64 data URLs from backend
          const contactsWithPhotos = contactsData.map((contact) => ({
            ...contact,
            photo: contact.photo || null
          }));
          
          setContacts(contactsWithPhotos);
          setTotalContacts(paginationData?.total || contactsData.length);
        } else {
          setError(response.data.message || 'Failed to fetch contacts');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for search debouncing
    if (newFilters.search !== filters.search) {
      const timeout = setTimeout(() => {
        fetchContacts();
      }, 500);
      setSearchTimeout(timeout);
    }
  };

  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  const handleAddContact = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleSubmitAddContact = async (contactData) => {
    try {
      setIsAddingContact(true);
      
      // contactData now contains the photo file directly
      const response = await contactsApi.createContact(contactData);
      
      if (response.data.success) {
        // Close modal and refresh contacts
        setIsAddModalOpen(false);
        setCurrentPage(1); // Reset to first page
        fetchContacts();
        
                 // Show success message (you can add a toast notification here)
         return true; // Return success
             } else {
         // Handle validation errors from backend
         if (response.data.message && Array.isArray(response.data.message)) {
           console.error('Validation errors:', response.data.message);
         }
         throw new Error(response.data.message || 'Failed to add contact');
       }
     } catch (err) {
       // Handle network errors
       if (err.response?.data?.message) {
         console.error('Backend error:', err.response.data.message);
       }
       throw err; // Re-throw to trigger form reset
    } finally {
      setIsAddingContact(false);
    }
  };



  const handleExportCSV = async () => {
    try {
      // Disable export button
      const exportButton = document.querySelector('[data-export-csv]');
      if (exportButton) {
        exportButton.disabled = true;
      }

      // Call export API with current filters and pagination
      const params = {
        search: filters.search || undefined,
        sortBy: sortBy,
        sortOrder: sortOrder
      };
      
      const response = await contactsApi.exportContacts(params);
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contacts_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success message
      console.log('Export completed successfully');
      
    } catch (error) {
      console.error('Export failed:', error);
      
      // More specific error messages
      let errorMessage = 'Export failed. Please try again.';
      if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to export contacts.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      alert(errorMessage);
    } finally {
      // Re-enable export button
      const exportButton = document.querySelector('[data-export-csv]');
      if (exportButton) {
        exportButton.disabled = false;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar 
        appName="Contact Management"
        userName={user?.name}
        onLogout={handleLogout}
      />
      
             <main className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 xl:px-8">
        <ContactFilters 
          filters={filters}
          onFilterChange={handleFilterChange}
          onExportCSV={handleExportCSV}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onAddContact={handleAddContact}
        />
        

        
                 {loading ? (
           <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-8 sm:p-12 lg:p-16 text-center">
             <div className="text-blue-500 mb-4 sm:mb-6">
               <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16 animate-spin" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
             </div>
             <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Loading contacts...</h3>
             <p className="text-gray-600 text-base sm:text-lg">Please wait while we fetch your contacts.</p>
           </div>
         ) : error ? (
           <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-8 sm:p-12 lg:p-16 text-center">
             <div className="text-red-500 mb-4 sm:mb-6">
               <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
               </svg>
             </div>
             <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Error loading contacts</h3>
             <p className="text-gray-600 text-base sm:text-lg mb-4 sm:mb-6">{error}</p>
             <button
               onClick={fetchContacts}
               className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-blue-700 transition-colors text-sm sm:text-base"
             >
               Try Again
             </button>
           </div>
         ) : contacts.length > 0 ? (
           <>
             <ContactsTable contacts={contacts} />
             
             {totalContacts > pageSize && (
               <div className="mt-4 sm:mt-6 flex justify-center sm:justify-end">
                 <Pagination 
                   currentPage={currentPage}
                   totalPages={Math.ceil(totalContacts / pageSize)}
                   onPageChange={handlePageChange}
                 />
               </div>
             )}
           </>
         ) : (
           <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-8 sm:p-12 lg:p-16 text-center">
             <div className="text-gray-400 mb-4 sm:mb-6">
               <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
             </div>
             <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">No contacts found</h3>
             <p className="text-gray-600 text-base sm:text-lg">Try adjusting your search criteria to find contacts.</p>
           </div>
                   )}
        </main>

        {/* Add Contact Modal */}
        <AddContactModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          onSubmit={handleSubmitAddContact}
          loading={isAddingContact}
                     onSuccess={() => {
             // Form will be reset automatically by the modal
           }}
        />
      </div>
    );
  };

export default UserDashboard;
