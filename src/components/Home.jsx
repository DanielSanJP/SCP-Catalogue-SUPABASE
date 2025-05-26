import "../styles/Home.css";
import { Link } from "react-router-dom";

/**
 * Home component - Landing page for the SCP Foundation application
 * Displays welcome message and navigation to main SCP database
 * @returns {JSX.Element} Home page with hero section and call-to-action
 */
function Home() {
  return (
    <>
      {/* Hero section with full width and centered content */}
      <div className="home">
        <div className="content">
          <h1>Welcome to the SCP Foundation</h1>
          <p>Your one-stop destination for all things SCP.</p>

          {/* Call-to-action button linking to SCP database */}
          <Link to="/scplist">
            <button>Get Started</button>
          </Link>
        </div>
      </div>
    </>
  );
}

export default Home;
