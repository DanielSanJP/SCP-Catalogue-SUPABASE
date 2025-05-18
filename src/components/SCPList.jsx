import React, { useEffect, useState } from "react";
import { getAllSubjects, updateSubject, deleteSubject } from "../services/api";
import { FaArrowLeft, FaArrowRight, FaTimes } from "react-icons/fa";
import { useSearch } from "./SearchContextUtils";
import "../styles/SCPList.css"; // Importing CSS styles for the SCPList component

const ITEMS_PER_PAGE = 5;

const SCPList = () => {
  const [scpSubjects, setScpSubjects] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { search, setSearch } = useSearch();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSCP, setEditingSCP] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

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

  // Handle opening the edit modal
  const handleEditSCP = (scp) => {
    setEditingSCP({ ...scp });
    setIsEditModalOpen(true);
  };

  // Handle closing the edit modal
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingSCP(null);
    setImageFile(null);
    setShowDeleteConfirmation(false);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingSCP({ ...editingSCP, [name]: value });
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);

      // Preview the image
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditingSCP({ ...editingSCP, imagePreview: event.target.result });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call your API service to update the SCP
      const updatedSCP = await updateSubject(editingSCP, imageFile);

      if (!updatedSCP) {
        throw new Error("Failed to get updated SCP data");
      }

      // Update the local state with the updated SCP
      setScpSubjects(
        scpSubjects.map((scp) => (scp.id === updatedSCP.id ? updatedSCP : scp))
      );

      // Close the modal
      handleCloseModal();
    } catch (error) {
      console.error("Error updating SCP:", error);
      alert("Failed to update SCP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting an SCP
  const handleDeleteSCP = async () => {
    if (!showDeleteConfirmation) {
      setShowDeleteConfirmation(true);
      return;
    }

    try {
      setIsSubmitting(true);
      await deleteSubject(editingSCP.id);

      // Update state to remove the deleted SCP
      setScpSubjects(scpSubjects.filter((scp) => scp.id !== editingSCP.id));

      handleCloseModal();
    } catch (error) {
      console.error("Error deleting SCP:", error);
      alert("Failed to delete SCP. Please try again.");
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirmation(false); // Reset the confirmation state
    }
  };

  // Add a function to cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

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
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to the top of the page smoothly
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="SCPListContainer">
      <h2>SCP Database</h2>
      <div className="Filters">
        <div className="FilterButtons">
          <p>Sort by:</p>
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
          <div className="SCPCard" key={scp.id}>
            <div className="SCPCardHead">
              <h2>
                {scp.item} - {scp.class}
              </h2>
              <button onClick={() => handleEditSCP(scp)}>Edit</button>
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

      {/* Edit Modal */}
      {isEditModalOpen && editingSCP && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <div className="modal-header">
              <h2>Edit {editingSCP.item}</h2>
              <button className="close-button" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="item">Item Number:</label>
                <input
                  type="text"
                  id="item"
                  name="item"
                  value={editingSCP.item || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="class">Class:</label>
                <select
                  id="class"
                  name="class"
                  value={editingSCP.class || ""}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Class</option>
                  <option value="Safe">Safe</option>
                  <option value="Euclid">Euclid</option>
                  <option value="Keter">Keter</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={editingSCP.description || ""}
                  onChange={handleInputChange}
                  rows="5"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="containment">Containment:</label>
                <textarea
                  id="containment"
                  name="containment"
                  value={editingSCP.containment || ""}
                  onChange={handleInputChange}
                  rows="5"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">Image:</label>
                <div className="image-upload-container">
                  <div className="current-image">
                    <img
                      src={
                        editingSCP.imagePreview ||
                        editingSCP.image ||
                        "/landscape-placeholder.svg"
                      }
                      alt={editingSCP.item}
                      style={{ maxWidth: "200px", maxHeight: "150px" }}
                    />
                  </div>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || showDeleteConfirmation}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>

                {showDeleteConfirmation ? (
                  <>
                    <button
                      type="button"
                      className="delete-button confirm"
                      onClick={handleDeleteSCP}
                      disabled={isSubmitting}
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={cancelDelete}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="delete-button"
                    onClick={handleDeleteSCP}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

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
