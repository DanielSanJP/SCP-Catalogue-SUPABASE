import React, { useEffect, useState } from "react";
import { getAllSubjects, updateSubject, deleteSubject } from "../services/api";
import { FaArrowLeft, FaArrowRight, FaTimes } from "react-icons/fa";
import { useSearch } from "./SearchContextUtils";
import "../styles/SCPList.css";

// Number of SCP entries to display per page
const ITEMS_PER_PAGE = 5;

const SCPList = () => {
  // State for storing all SCP subjects
  const [scpSubjects, setScpSubjects] = useState([]);

  // State for current sorting method
  const [sortBy, setSortBy] = useState(null);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Global search state from context
  const { search, setSearch } = useSearch();

  // Modal and editing states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSCP, setEditingSCP] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Error handling state
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetches all SCP subjects from the API on component mount
   * Sets loading state and handles any fetch errors
   */
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await getAllSubjects();
        setScpSubjects(data);
      } catch (error) {
        console.error("Error fetching SCP subjects:", error);

        // Set appropriate error message based on error type
        if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          setError(
            "Failed to connect to the server. Please check your internet connection and try again."
          );
        } else if (error.message.includes("404")) {
          setError("SCP database not found. Please contact an administrator.");
        } else if (error.message.includes("500")) {
          setError("Server error occurred. Please try again later.");
        } else {
          setError(
            "Failed to load SCP entries. Please refresh the page or try again later."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  /**
   * Opens the edit modal for a specific SCP entry
   * Creates a copy of the SCP data to prevent direct state mutation
   * @param {Object} scp - The SCP object to edit
   */
  const handleEditSCP = (scp) => {
    setEditingSCP({ ...scp });
    setIsEditModalOpen(true);
    setError(""); // Clear any previous errors
  };

  /**
   * Closes the edit modal and resets all related states
   * Clears form data, image files, and confirmation dialogs
   */
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingSCP(null);
    setImageFile(null);
    setShowDeleteConfirmation(false);
    setError(""); // Clear any modal-specific errors
  };

  /**
   * Handles changes to form input fields in the edit modal
   * Updates the editingSCP state with new values
   * @param {Event} e - The input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingSCP({ ...editingSCP, [name]: value });
  };

  /**
   * Handles image file selection in the edit modal
   * Validates file type and size, creates preview
   * @param {Event} e - The file input change event
   */
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file must be smaller than 5MB");
        return;
      }

      setImageFile(file);
      setError(""); // Clear any previous errors

      // Create image preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditingSCP({ ...editingSCP, imagePreview: event.target.result });
      };
      reader.onerror = () => {
        setError("Failed to load image preview");
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Validates the edit form data before submission
   * Checks required fields and proper formatting
   * @returns {string|null} Error message if validation fails, null if valid
   */
  const validateEditForm = () => {
    if (!editingSCP.item || !editingSCP.item.trim()) {
      return "SCP Item Number is required";
    }

    if (!editingSCP.item.toLowerCase().startsWith("scp-")) {
      return "SCP Item Number must start with 'SCP-'";
    }

    if (!editingSCP.class) {
      return "Object Class must be selected";
    }

    if (!editingSCP.description || editingSCP.description.trim().length < 10) {
      return "Description must be at least 10 characters long";
    }

    if (!editingSCP.containment || editingSCP.containment.trim().length < 10) {
      return "Containment Procedures must be at least 10 characters long";
    }

    return null;
  };

  /**
   * Handles form submission for editing an SCP entry
   * Validates data, updates the entry via API, and updates local state
   * @param {Event} e - The form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    const validationError = validateEditForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Call API to update the SCP
      const updatedSCP = await updateSubject(editingSCP, imageFile);

      if (!updatedSCP) {
        throw new Error("Failed to get updated SCP data from server");
      }

      // Update the local state with the updated SCP
      setScpSubjects(
        scpSubjects.map((scp) => (scp.id === updatedSCP.id ? updatedSCP : scp))
      );

      // Close the modal and show success (you might want to add a success message state)
      handleCloseModal();
    } catch (error) {
      console.error("Error updating SCP:", error);

      // Set appropriate error message based on error type
      if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        setError(
          "Network error: Failed to update SCP. Please check your connection and try again."
        );
      } else if (
        error.message.includes("duplicate") ||
        error.message.includes("already exists")
      ) {
        setError(
          "An SCP with this item number already exists. Please use a different number."
        );
      } else if (
        error.message.includes("unauthorized") ||
        error.message.includes("permission")
      ) {
        setError("You don't have permission to edit this SCP entry.");
      } else if (error.message.includes("not found")) {
        setError(
          "SCP entry not found. It may have been deleted by another user."
        );
      } else {
        setError(error.message || "Failed to update SCP. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles SCP deletion with confirmation
   * Shows confirmation dialog on first click, deletes on second click
   */
  const handleDeleteSCP = async () => {
    // Show confirmation dialog on first click
    if (!showDeleteConfirmation) {
      setShowDeleteConfirmation(true);
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      await deleteSubject(editingSCP.id);

      // Update state to remove the deleted SCP
      setScpSubjects(scpSubjects.filter((scp) => scp.id !== editingSCP.id));

      // Close modal and show success
      handleCloseModal();
    } catch (error) {
      console.error("Error deleting SCP:", error);

      // Set appropriate error message based on error type
      if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        setError(
          "Network error: Failed to delete SCP. Please check your connection and try again."
        );
      } else if (
        error.message.includes("unauthorized") ||
        error.message.includes("permission")
      ) {
        setError("You don't have permission to delete this SCP entry.");
      } else if (error.message.includes("not found")) {
        setError("SCP entry not found. It may have already been deleted.");
      } else {
        setError(error.message || "Failed to delete SCP. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirmation(false);
    }
  };

  /**
   * Cancels the delete confirmation dialog
   * Resets the confirmation state without deleting
   */
  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setError(""); // Clear any error messages
  };

  // Custom order for SCP class sorting: Safe > Euclid > Keter
  const classOrder = {
    Safe: 3,
    Euclid: 2,
    Keter: 1,
  };

  /**
   * Sorts SCP subjects based on the current sortBy criteria
   * Handles both item number (alphanumeric) and class (custom order) sorting
   */
  const sortedSubjects = [...scpSubjects].sort((a, b) => {
    if (sortBy === "item") {
      return a.item.localeCompare(b.item, undefined, { numeric: true });
    }
    if (sortBy === "class") {
      // Use custom class order, default to 0 if class not found
      return (classOrder[b.class] || 0) - (classOrder[a.class] || 0);
    }
    return 0; // No sorting applied
  });

  /**
   * Filters SCP subjects based on the search query
   * Searches across item, class, description, and containment fields
   */
  const filteredSubjects = sortedSubjects.filter((scp) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      scp.item?.toLowerCase().includes(query) ||
      scp.class?.toLowerCase().includes(query) ||
      scp.description?.toLowerCase().includes(query) ||
      scp.containment?.toLowerCase().includes(query)
    );
  });

  // Calculate pagination values
  const totalPages = Math.ceil(filteredSubjects.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSubjects = filteredSubjects.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );

  /**
   * Handles page navigation in pagination
   * Validates page bounds and scrolls to top on page change
   * @param {number} page - The target page number
   */
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

  // Loading state display
  if (isLoading) {
    return (
      <div className="SCPListContainer">
        <div className="loading-message">
          <p>Loading SCP Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="SCPListContainer">
      <h2>SCP Database</h2>

      {/* Display error messages */}
      {error && (
        <div className="error-message" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      {/* Filters and search */}
      <div className="Filters">
        <div className="FilterButtons">
          <p>Sort by:</p>
          <button
            onClick={() => setSortBy("item")}
            className={sortBy === "item" ? "active" : ""}
            aria-pressed={sortBy === "item"}
          >
            Item
          </button>
          <button
            onClick={() => setSortBy("class")}
            className={sortBy === "class" ? "active" : ""}
            aria-pressed={sortBy === "class"}
          >
            Class
          </button>
        </div>
        <div className="searchbar">
          <input
            type="text"
            placeholder="Search SCPs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search SCP entries"
          />
        </div>
      </div>

      {/* SCP List */}
      <div className="SCPList">
        {paginatedSubjects.length === 0 ? (
          <div className="no-results">
            <p>
              {search
                ? `No SCP entries found matching "${search}"`
                : "No SCP entries available"}
            </p>
          </div>
        ) : (
          paginatedSubjects.map((scp) => (
            <div className="SCPCard" key={scp.id}>
              <div className="SCPCardHead">
                <h2>
                  {scp.item} - {scp.class}
                </h2>
                <button
                  onClick={() => handleEditSCP(scp)}
                  aria-label={`Edit ${scp.item}`}
                >
                  Edit
                </button>
              </div>
              <div className="CardContent">
                <div className="ImageContainer">
                  <img
                    src={scp.image ? scp.image : "/landscape-placeholder.svg"}
                    alt={`Image for ${scp.item}`}
                    onError={(e) => {
                      e.target.src = "/landscape-placeholder.svg";
                    }}
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
          ))
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingSCP && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit {editingSCP.item}</h2>
              <button
                className="close-button"
                onClick={handleCloseModal}
                aria-label="Close edit modal"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal error messages */}
            {error && (
              <div className="error-message modal-error" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="edit-item">
                  Item Number: <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="edit-item"
                  name="item"
                  value={editingSCP.item || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-class">
                  Class: <span className="required">*</span>
                </label>
                <select
                  id="edit-class"
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
                <label htmlFor="edit-description">
                  Description: <span className="required">*</span>
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={editingSCP.description || ""}
                  onChange={handleInputChange}
                  rows="5"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-containment">
                  Containment: <span className="required">*</span>
                </label>
                <textarea
                  id="edit-containment"
                  name="containment"
                  value={editingSCP.containment || ""}
                  onChange={handleInputChange}
                  rows="5"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-image">Image:</label>
                <div className="image-upload-container">
                  <div className="current-image">
                    <img
                      src={
                        editingSCP.imagePreview ||
                        editingSCP.image ||
                        "/landscape-placeholder.svg"
                      }
                      alt={`Current image for ${editingSCP.item}`}
                      style={{ maxWidth: "200px", maxHeight: "150px" }}
                      onError={(e) => {
                        e.target.src = "/landscape-placeholder.svg";
                      }}
                    />
                  </div>
                  <input
                    type="file"
                    id="edit-image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <small className="help-text">
                    Supported formats: JPG, PNG, GIF. Maximum size: 5MB
                  </small>
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
                      {isSubmitting ? "Deleting..." : "Confirm Delete"}
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
                    Delete
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
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
              className={currentPage === idx + 1 ? "active" : ""}
              aria-current={currentPage === idx + 1 ? "page" : undefined}
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
      )}
    </div>
  );
};

export default SCPList;
