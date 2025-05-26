import React, { useState } from "react";
import SearchContext from "./SearchContextUtils";

/**
 * SearchProvider component that provides search state to child components
 * Uses React Context to share search functionality across the application
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that will have access to search context
 * @returns {JSX.Element} Context provider wrapper
 */
export function SearchProvider({ children }) {
  // State to store the current search query
  const [search, setSearch] = useState("");

  /**
   * Context value object containing:
   * - search: Current search query string
   * - setSearch: Function to update the search query
   */
  const contextValue = {
    search,
    setSearch,
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
}
