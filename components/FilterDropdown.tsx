import React, { useState, useRef, useEffect } from 'react';

export interface FilterOptions {
  dateRange: string;
  country: string;
  sourceQuality: string;
}

interface FilterDropdownProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  isLoading?: boolean;
}

export default function FilterDropdown({ filters, onFilterChange, isLoading }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterOptions>(filters);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync temp filters with props when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTempFilters(filters);
    }
  }, [isOpen, filters]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTempFilterChange = (filterType: keyof FilterOptions, value: string) => {
    setTempFilters({
      ...tempFilters,
      [filterType]: value
    });
  };

  const handleApplyFilters = () => {
    // Clear any local storage or cached data
    if (typeof window !== 'undefined') {
      // Force a fresh fetch by adding a timestamp
      window.localStorage.setItem('filterChangeTime', Date.now().toString());
    }
    onFilterChange(tempFilters);
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters = { dateRange: 'all', country: 'all', sourceQuality: 'all' };
    // Clear any local storage or cached data
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('filterChangeTime', Date.now().toString());
    }
    setTempFilters(resetFilters);
    onFilterChange(resetFilters);
    setIsOpen(false);
  };

  const activeFiltersCount = Object.entries(filters)
    .filter(([key, value]) => key !== 'sourceQuality' && value !== 'all')
    .length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-gray-700 hover:border-lime-500 text-gray-300 hover:text-white transition-all relative"
      >
        <svg className="w-5 h-5 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span className="font-medium">Filters</span>
        {activeFiltersCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-teal-700 via-teal-600 to-lime-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-gray-900 rounded-xl border border-gray-700 shadow-xl z-50">
          <div className="p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filter Options
            </h3>

            {/* Date Range Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Date Range</label>
              <select
                value={tempFilters.dateRange}
                onChange={(e) => handleTempFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
              >
                <option value="all">All Time</option>
                <option value="24hours">Past 24 Hours</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
              </select>
            </div>

            {/* Country Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Country</label>
              <select
                value={tempFilters.country}
                onChange={(e) => handleTempFilterChange('country', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
              >
                <option value="all">International</option>
                <option value="us">United States</option>
                <option value="gb">United Kingdom</option>
                <option value="ca">Canada</option>
                <option value="au">Australia</option>
                <option value="de">Germany</option>
                <option value="fr">France</option>
                <option value="jp">Japan</option>
                <option value="cn">China</option>
              </select>
            </div>

            {/* Source Quality Filter - Disabled for now */}
            {/* <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Source Quality</label>
              <select
                value={tempFilters.sourceQuality}
                onChange={(e) => handleTempFilterChange('sourceQuality', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
              >
                <option value="all">All Sources</option>
                <option value="premium">Premium Sources Only</option>
                <option value="trusted">Trusted Sources</option>
                <option value="broad">Broad Coverage</option>
              </select>
            </div> */}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleApplyFilters}
                className="w-full px-4 py-2 bg-gradient-to-r from-teal-700 via-teal-600 to-lime-500 text-white rounded-lg font-medium hover:shadow-glow transition-all"
              >
                Apply All Filters
              </button>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:border-lime-500 rounded-lg font-medium transition-all"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}