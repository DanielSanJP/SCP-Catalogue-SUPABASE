import { useState } from "react";
import "../styles/CreateSCP.css";
import { createSubject, uploadImage } from "../services/api";

function CreateSCP() {
  const [form, setForm] = useState({
    item: "",
    class: "",
    description: "",
    containment: "",
    image: null,
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      let imageUrl = null;

      // If there's an image file, upload it directly to the "images" bucket
      if (form.image) {
        // Create a unique filename using the SCP item number but upload directly to root of bucket
        const fileName = `${form.item
          .replace(/\s/g, "-")
          .toLowerCase()}-${Date.now()}`;
        imageUrl = await uploadImage(form.image, fileName);
      }

      // Create the SCP with the image URL (if any)
      await createSubject({
        ...form,
        image: imageUrl,
      });

      setMessage("SCP created successfully!");
      setForm({
        item: "",
        class: "",
        description: "",
        containment: "",
        image: null,
      });
      setImagePreview(null);
    } catch (err) {
      setMessage("Error: " + (err.message || "Failed to create SCP"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-scp">
      <h2>Create New SCP Entry</h2>

      {message && (
        <p
          className={
            message.includes("Error") ? "error-message" : "success-message"
          }
        >
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="scp-form-field">
          <label htmlFor="item">SCP Item Number:</label>
          <input
            id="item"
            name="item"
            placeholder="e.g., SCP-173"
            value={form.item}
            onChange={handleChange}
            required
          />
        </div>

        <div className="scp-form-field">
          <label htmlFor="class">Object Class:</label>
          <select
            id="class"
            name="class"
            value={form.class}
            onChange={handleChange}
            required
          >
            <option value="">Select Class</option>
            <option value="Safe">Safe</option>
            <option value="Euclid">Euclid</option>
            <option value="Keter">Keter</option>
          </select>
        </div>

        <div className="scp-form-field">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            placeholder="Detailed description of the SCP"
            value={form.description}
            onChange={handleChange}
            rows="5"
            required
          />
        </div>

        <div className="scp-form-field">
          <label htmlFor="containment">Containment Procedures:</label>
          <textarea
            id="containment"
            name="containment"
            placeholder="Special containment procedures"
            value={form.containment}
            onChange={handleChange}
            rows="5"
            required
          />
        </div>

        <div className="scp-form-field image-upload">
          <label htmlFor="image">Upload Image:</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
          />

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>

        <button className="SubmitSCPButton" type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create SCP Entry"}
        </button>
      </form>
    </div>
  );
}

export default CreateSCP;
