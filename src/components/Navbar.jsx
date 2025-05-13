import "../styles/Navbar.css";
import { Link } from "react-router-dom";
import { useSearch } from "./SearchContextUtils";

function Navbar() {
  const { search, setSearch } = useSearch();
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="top">
          <img
            src="/SCP-LOGO.png"
            alt="SCP Logo"
            style={{ width: "300px", height: "auto", marginBottom: "20px" }}
          />
          <div className="searchbar">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button disabled>Search</button>
          </div>
        </div>
      </div>
      <div className="navbar-links-container">
        <ul className="navbarlinks">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/scplist">SCP Database</Link>
          </li>
          <li>
            <Link to="/createscp">Create SCP</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
