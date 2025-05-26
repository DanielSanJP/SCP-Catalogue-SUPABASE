import { createContext, useContext } from "react";

/**
 * React Context for managing search state across the application
 * Provides a centralized way to share search functionality between components
 * Default value is undefined, which will be replaced by SearchProvider
 */
const SearchContext = createContext();

export default SearchContext;

/**
 * Custom hook to access search context
 * Provides easy access to search state and setter function
 * @returns {Object} Object containing search state and setter
 * @returns {string} returns.search - Current search query string
 * @returns {Function} returns.setSearch - Function to update search query
 * @throws {Error} Throws error if used outside of SearchProvider
 */
export function useSearch() {
  const context = useContext(SearchContext);

  // Validate that hook is used within SearchProvider
  if (context === undefined) {
    throw new Error(
      "useSearch must be used within a SearchProvider. " +
        "Make sure to wrap your component tree with <SearchProvider>."
    );
  }

  return context;
}
