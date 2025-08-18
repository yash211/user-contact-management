import React from 'react';

const ContactFilters = ({ filters, onFilterChange, onExportCSV, sortBy, sortOrder, onSortChange, onAddContact }) => {
  const handleInputChange = (value) => {
    onFilterChange({
      ...filters,
      search: value
    });
  };

  const handleSortChange = (field) => {
    const newOrder = sortBy === field && sortOrder === 'ASC' ? 'DESC' : 'ASC';
    onSortChange(field, newOrder);
  };

  // Update tooltip text based on button state
  const updateExportTooltip = () => {
    const exportButton = document.querySelector('[data-export-csv]');
    const tooltipText = document.querySelector('.export-tooltip-text');
    
    if (exportButton && tooltipText) {
      if (exportButton.disabled) {
        tooltipText.textContent = 'File export in process...';
      } else {
        tooltipText.textContent = 'Export to CSV';
      }
    }
  };

  // Update tooltip when component mounts and when button state changes
  React.useEffect(() => {
    updateExportTooltip();
    
    // Create a mutation observer to watch for button state changes
    const exportButton = document.querySelector('[data-export-csv]');
    if (exportButton) {
      const observer = new MutationObserver(updateExportTooltip);
      observer.observe(exportButton, { attributes: true, attributeFilter: ['disabled'] });
      
      return () => observer.disconnect();
    }
  }, []);

         return (
     <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl shadow-lg border border-blue-100 mb-6 sm:mb-8">
       <div className="flex flex-col space-y-4">
         {/* Search Bar - Full Width on Mobile */}
         <div className="w-full">
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
             </div>
             <input
               type="text"
               placeholder="Search by name or email..."
               value={filters.search}
               onChange={(e) => handleInputChange(e.target.value)}
               className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-white shadow-sm"
             />
           </div>
         </div>
         
         {/* Controls Row - Responsive Layout */}
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
           {/* Sort Buttons */}
           <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
             <span className="text-sm font-medium text-gray-700">Sort by:</span>
             <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
               <button
                 onClick={() => handleSortChange('name')}
                 className={`px-3 py-2 text-sm font-semibold rounded-lg border-2 transition-all duration-200 ${
                   sortBy === 'name' 
                     ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                     : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                 }`}
               >
                 Name {sortBy === 'name' && (sortOrder === 'ASC' ? '↑' : '↓')}
               </button>
               <button
                 onClick={() => handleSortChange('createdAt')}
                 className={`px-3 py-2 text-sm font-semibold rounded-lg border-2 transition-all duration-200 ${
                   sortBy === 'createdAt' 
                     ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                     : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                 }`}
               >
                 Date {sortBy === 'createdAt' && (sortOrder === 'ASC' ? '↑' : '↓')}
               </button>
             </div>
           </div>
           
           {/* Action Buttons */}
           <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-center sm:justify-end">
             <button
               onClick={onAddContact}
               className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
               title="Add New Contact"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
               </svg>
             </button>
             
             <div className="relative group">
               <button
                 onClick={onExportCSV}
                 data-export-csv
                 className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                 title="Export to CSV"
                 disabled={false}
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
               </button>
               
               {/* Tooltip for disabled state */}
               <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                 <span className="export-tooltip-text">Export to CSV</span>
                 <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>
  );
};

export default ContactFilters;
