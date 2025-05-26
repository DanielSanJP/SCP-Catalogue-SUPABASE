import "../styles/Navbar.css";
import { Link } from "react-router-dom";

/**
 * Navbar component - Main navigation bar for the application
 * Provides links to all major sections: Home, SCP Database, and Create SCP
 * Features the SCP Foundation logo and responsive navigation links
 * @returns {JSX.Element} Navigation bar with logo and menu links
 */
function Navbar() {
  return (
    <nav className="navbar">
      {/* Top section with logo */}
      <div className="navbar-content">
        <div className="top">
          <Link to="/" aria-label="Go to home page">
            <img
              src="/SCP-LOGO.png"
              alt="SCP Foundation Logo"
              style={{
                width: "300px",
                height: "auto",
                marginBottom: "20px",
              }}
              onError={(e) => {
                // Fallback if logo fails to load
                e.target.style.display = "none";
                console.warn("SCP logo failed to load");
              }}
            />
          </Link>
        </div>
      </div>

      {/* Navigation links container */}
      <div className="navbar-links-container">
        <ul className="navbarlinks">
          <li>
            <Link to="/" aria-label="Navigate to home page">
              Home
            </Link>
          </li>
          <li>
            <Link to="/scplist" aria-label="Browse SCP database">
              SCP Database
            </Link>
          </li>
          <li>
            <Link to="/createscp" aria-label="Create new SCP entry">
              Create SCP
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
