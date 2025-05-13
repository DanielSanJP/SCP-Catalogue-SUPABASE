import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import SCPList from "./components/SCPList";
import { SearchProvider } from "./components/SearchContext";
import "./styles/App.css";

function App() {
  return (
    <SearchProvider>
      <BrowserRouter>
        <Navbar />
        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scplist" element={<SCPList />} />
          </Routes>
        </div>
      </BrowserRouter>
    </SearchProvider>
  );
}

export default App;
