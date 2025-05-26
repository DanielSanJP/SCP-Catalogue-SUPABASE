import { useState } from "react";
import "../styles/CreateSCP.css";
import { createSubject, uploadImage } from "../services/api";

function CreateSCP() {
  // State for form data
  const [form, setForm] = useState({
    item: "", // This will store just the number part
    class: "",
    description: "",
    containment: "",
    image: null,
  });

  // State for user feedback messages
  const [message, setMessage] = useState("");

  // State for loading indicator during form submission
  const [isLoading, setIsLoading] = useState(false);

  // State for image preview display
  const [imagePreview, setImagePreview] = useState(null);

  /**
   * Handles changes to text input fields and select elements
   * For the item field, only allows numbers and formats with SCP- prefix
   * @param {Event} e - The input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "item") {
      // Only allow numbers for the SCP item field
      const numbersOnly = value.replace(/[^0-9]/g, "");
      setForm({ ...form, [name]: numbersOnly });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  /**
   * Handles image file selection and creates a preview
   * Updates form state with selected file and generates preview URL
   * @param {Event} e - The file input change event
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setMessage("Error: Please select a valid image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setMessage("Error: Image file must be smaller than 5MB");
        return;
      }

      setForm({ ...form, image: file });

      // Create preview using FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.onerror = () => {
        setMessage("Error: Failed to load image preview");
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Gets the full SCP item name with prefix
   * @returns {string} The full SCP item name (e.g., "SCP-173")
   */
  const getFullItemName = () => {
    return form.item ? `SCP-${form.item}` : "";
  };

  /**
   * Validates form data before submission
   * Checks for required fields and proper formatting
   * @returns {string|null} Error message if validation fails, null if valid
   */
  const validateForm = () => {
    // Check SCP item number
    if (!form.item.trim()) {
      return "SCP Item Number is required";
    }

    // Check if item number is a valid number
    if (!/^\d+$/.test(form.item.trim())) {
      return "SCP Item Number must contain only numbers";
    }

    // Check if number is reasonable (1-9999)
    const itemNumber = parseInt(form.item.trim());
    if (itemNumber < 1 || itemNumber > 9999) {
      return "SCP Item Number must be between 1 and 9999";
    }

    // Check object class selection
    if (!form.class) {
      return "Object Class must be selected";
    }

    // Check description length
    if (!form.description.trim()) {
      return "Description is required";
    }

    if (form.description.trim().length < 10) {
      return "Description must be at least 10 characters long";
    }

    // Check containment procedures
    if (!form.containment.trim()) {
      return "Containment Procedures are required";
    }

    if (form.containment.trim().length < 10) {
      return "Containment Procedures must be at least 10 characters long";
    }

    return null; // All validation passed
  };

  /**
   * Handles form submission
   * Validates data, uploads image if present, and creates SCP entry
   * @param {Event} e - The form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any previous messages
    setMessage("");

    // Validate form data
    const validationError = validateForm();
    if (validationError) {
      setMessage(`Error: ${validationError}`);
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = null;

      // Upload image if one was selected
      if (form.image) {
        try {
          // Create a unique filename using the full SCP item name
          const fullItemName = getFullItemName();
          const fileName = `${fullItemName
            .replace(/\s/g, "-")
            .toLowerCase()}-${Date.now()}`;
          imageUrl = await uploadImage(form.image, fileName);
        } catch (imageError) {
          console.error("Image upload failed:", imageError);
          throw new Error(
            "Failed to upload image. Please try again or submit without an image."
          );
        }
      }

      // Create the SCP entry with the full item name (SCP-XXX format)
      await createSubject({
        ...form,
        item: getFullItemName(), // Use the full name with SCP- prefix
        image: imageUrl,
      });

      // Success feedback
      setMessage("Success: SCP entry created successfully!");

      // Reset form to initial state
      setForm({
        item: "",
        class: "",
        description: "",
        containment: "",
        image: null,
      });
      setImagePreview(null);

      // Clear success message after 5 seconds
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      console.error("Error creating SCP:", err);

      // Display appropriate error message based on error type
      if (err.message.includes("network") || err.message.includes("fetch")) {
        setMessage(
          "Error: Network connection failed. Please check your internet connection and try again."
        );
      } else if (
        err.message.includes("duplicate") ||
        err.message.includes("already exists")
      ) {
        setMessage(
          "Error: An SCP with this item number already exists. Please use a different number."
        );
      } else if (err.message.includes("validation")) {
        setMessage(
          "Error: Invalid data provided. Please check your entries and try again."
        );
      } else if (
        err.message.includes("unauthorized") ||
        err.message.includes("permission")
      ) {
        setMessage(
          "Error: You don't have permission to create SCP entries. Please contact an administrator."
        );
      } else {
        // Generic error message with specific details if available
        setMessage(
          `Error: ${
            err.message || "Failed to create SCP entry. Please try again."
          }`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-scp">
      <h2>Create New SCP Entry</h2>

      {/* Display success or error messages */}
      {message && (
        <div
          className={
            message.includes("Error") ? "error-message" : "success-message"
          }
          role="alert"
          aria-live="polite"
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="scp-form-field">
          <label htmlFor="item">
            SCP Item Number: <span className="required">*</span>
          </label>
          <div className="scp-number-input">
            <span className="scp-prefix">SCP-</span>
            <input
              id="item"
              name="item"
              type="text"
              placeholder="173"
              value={form.item}
              onChange={handleChange}
              required
              aria-describedby="item-help"
              maxLength="4"
              pattern="[0-9]*"
              inputMode="numeric"
            />
          </div>
          <small id="item-help" className="help-text">
            Enter only numbers (1-9999). The "SCP-" prefix is added
            automatically.
          </small>
          {/* Show preview of full SCP name */}
          {form.item && (
            <div className="scp-preview">
              Preview: <strong>{getFullItemName()}</strong>
            </div>
          )}
        </div>

        <div className="scp-form-field">
          <label htmlFor="class">
            Object Class: <span className="required">*</span>
          </label>
          <select
            id="class"
            name="class"
            value={form.class}
            onChange={handleChange}
            required
            aria-describedby="class-help"
          >
            <option value="">Select Class</option>
            <option value="Safe">Safe</option>
            <option value="Euclid">Euclid</option>
            <option value="Keter">Keter</option>
          </select>
          <small id="class-help" className="help-text">
            Safe: Easy to contain, Euclid: Unpredictable, Keter: Difficult to
            contain
          </small>
        </div>

        <div className="scp-form-field">
          <label htmlFor="description">
            Description: <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Detailed description of the SCP (minimum 10 characters)"
            value={form.description}
            onChange={handleChange}
            rows="5"
            required
            aria-describedby="description-help"
          />
          <small id="description-help" className="help-text">
            Provide a detailed description of the SCP's appearance and
            properties
          </small>
        </div>

        <div className="scp-form-field">
          <label htmlFor="containment">
            Containment Procedures: <span className="required">*</span>
          </label>
          <textarea
            id="containment"
            name="containment"
            placeholder="Special containment procedures (minimum 10 characters)"
            value={form.containment}
            onChange={handleChange}
            rows="5"
            required
            aria-describedby="containment-help"
          />
          <small id="containment-help" className="help-text">
            Describe how the SCP should be contained and any special procedures
          </small>
        </div>

        <div className="scp-form-field image-upload">
          <label htmlFor="image">Upload Image:</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            aria-describedby="image-help"
          />
          <small id="image-help" className="help-text">
            Optional. Supported formats: JPG, PNG, GIF. Maximum size: 5MB
          </small>

          {/* Image preview */}
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Image preview" />
              <button
                type="button"
                onClick={() => {
                  setForm({ ...form, image: null });
                  setImagePreview(null);
                }}
                className="remove-image-btn"
                aria-label="Remove selected image"
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

        <button
          className="SubmitSCPButton"
          type="submit"
          disabled={isLoading}
          aria-describedby="submit-help"
        >
          {isLoading ? "Creating..." : "Create SCP Entry"}
        </button>

        {isLoading && (
          <small id="submit-help" className="help-text">
            Please wait while your SCP entry is being created...
          </small>
        )}
      </form>
    </div>
  );
}

export default CreateSCP;
