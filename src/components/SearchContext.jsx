import React, { useState } from "react";
import SearchContext from "./SearchContextUtils";

export function SearchProvider({ children }) {
  const [search, setSearch] = useState("");
  return (
    <SearchContext.Provider value={{ search, setSearch }}>
      {children}
    </SearchContext.Provider>
  );
}
