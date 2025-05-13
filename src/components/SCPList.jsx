import React, { useEffect, useState } from "react";
import { getAllSubjects } from "../services/api";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useSearch } from "./SearchContextUtils";
import "../styles/SCPList.css"; // Importing CSS styles for the SCPList component

const ITEMS_PER_PAGE = 5;

const SCPList = () => {
  const [scpSubjects, setScpSubjects] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { search, setSearch } = useSearch();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getAllSubjects();
        setScpSubjects(data);
      } catch (error) {
        console.error("Error fetching SCP subjects:", error);
      }
    };

    fetchSubjects();
  }, []);

  // Custom order for class: Safe > Euclid > Keter
  const classOrder = {
    Safe: 3,
    Euclid: 2,
    Keter: 1,
  };

  // Sort the SCP subjects based on sortBy state
  const sortedSubjects = [...scpSubjects].sort((a, b) => {
    if (sortBy === "item") {
      return a.item.localeCompare(b.item, undefined, { numeric: true });
    }
    if (sortBy === "class") {
      // Default to 0 if class not found
      return (classOrder[b.class] || 0) - (classOrder[a.class] || 0);
    }
    return 0;
  });

  // Filter by search query
  const filteredSubjects = sortedSubjects.filter((scp) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      scp.item?.toLowerCase().includes(q) ||
      scp.class?.toLowerCase().includes(q) ||
      scp.description?.toLowerCase().includes(q) ||
      scp.containment?.toLowerCase().includes(q)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredSubjects.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSubjects = filteredSubjects.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };
  return (
    <div className="SCPListContainer">
      <h2>SCP Database</h2>
      <div className="Filters">
        <div className="FilterButtons">
          <p>Filter by:</p>
          <button onClick={() => setSortBy("item")}>Item</button>
          <button onClick={() => setSortBy("class")}>Class</button>
        </div>
        <div className="searchbar">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="SCPList">
        {paginatedSubjects.map((scp) => (
          <div className="SCPCard" key={scp.item}>
            <div className="SCPCardHead">
              <h2>
                {scp.item} - {scp.class}
              </h2>
              <button>Edit</button>
            </div>
            <div className="CardContent">
              <div className="ImageContainer">
                <img
                  src={scp.image ? scp.image : "/landscape-placeholder.svg"}
                  alt={scp.item}
                />
              </div>
              <div className="SCPCardDetails">
                <strong>Description:</strong>
                <p>{scp.description}</p>
                <strong>Containment:</strong>
                <p>{scp.containment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination Controls */}
      <div className="PaginationControls">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous Page"
        >
          <FaArrowLeft />
        </button>
        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx + 1}
            onClick={() => handlePageChange(idx + 1)}
            style={{
              fontWeight: currentPage === idx + 1 ? "bold" : "normal",
            }}
          >
            {idx + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next Page"
        >
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default SCPList;
