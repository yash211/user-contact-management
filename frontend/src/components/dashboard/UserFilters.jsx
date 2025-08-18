import React from 'react';

const UserFilters = ({ filters, onFilterChange, onSearch }) => {
  const handleSearch = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search || ''}
              onChange={(e) => onFilterChange('search', e.target.value)}
              placeholder="Search by name, email, or phone"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sortBy"
              name="sortBy"
              value={filters.sortBy || 'createdAt'}
              onChange={(e) => onFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="createdAt">Created Date</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="role">Role</option>
              <option value="isActive">Status</option>
            </select>
          </div>

          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
              Sort Order
            </label>
            <select
              id="sortOrder"
              name="sortOrder"
              value={filters.sortOrder || 'DESC'}
              onChange={(e) => onFilterChange('sortOrder', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="DESC">Descending</option>
              <option value="ASC">Ascending</option>
            </select>
          </div>

          <div>
            <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-1">
              Items per Page
            </label>
            <select
              id="limit"
              name="limit"
              value={filters.limit || 10}
              onChange={(e) => onFilterChange('limit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Search
          </button>

          <button
            type="button"
            onClick={() => {
              onFilterChange('search', '');
              onFilterChange('sortBy', 'createdAt');
              onFilterChange('sortOrder', 'DESC');
              onFilterChange('limit', 10);
              onSearch();
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Clear Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserFilters;
