import { createContext, useContext } from "react";

const SearchContext = createContext();
export default SearchContext;

export function useSearch() {
  return useContext(SearchContext);
}
