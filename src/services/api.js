// Always use the Railway URL for API calls
const API_URL =
  "https://scp-catalogue-supabase-production.up.railway.app/api/scp";
import { supabase } from "./supabaseClient";

/**
 * Fetches all SCP subjects from the API
 * @returns {Promise<Array>} Array of SCP subject objects
 * @throws {Error} Network or server errors
 */
export const getAllSubjects = async () => {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      // Handle different HTTP status codes
      if (response.status === 404) {
        throw new Error("SCP database not found");
      } else if (response.status === 500) {
        throw new Error("Server error occurred");
      } else if (response.status >= 400) {
        throw new Error(
          `Failed to fetch SCP subjects: ${response.status} ${response.statusText}`
        );
      }
    }

    const data = await response.json();

    // Validate that we received an array
    if (!Array.isArray(data)) {
      throw new Error("Invalid data format received from server");
    }

    return data;
  } catch (error) {
    // Handle network errors and re-throw with more descriptive message
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        "Network connection failed. Please check your internet connection."
      );
    }
    throw error;
  }
};

/**
 * Fetches a specific SCP subject by ID
 * @param {string|number} id - The unique identifier for the SCP subject
 * @returns {Promise<Object>} The SCP subject object
 * @throws {Error} Network, server, or validation errors
 */
export const getSubjectById = async (id) => {
  if (!id) {
    throw new Error("SCP ID is required");
  }

  try {
    const response = await fetch(`${API_URL}/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("SCP entry not found");
      } else if (response.status === 400) {
        throw new Error("Invalid SCP ID provided");
      } else if (response.status >= 500) {
        throw new Error("Server error occurred");
      } else {
        throw new Error(
          `Failed to fetch SCP subject: ${response.status} ${response.statusText}`
        );
      }
    }

    const data = await response.json();

    // Validate that we received an object with required fields
    if (!data || typeof data !== "object") {
      throw new Error("Invalid SCP data received from server");
    }

    return data;
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        "Network connection failed. Please check your internet connection."
      );
    }
    throw error;
  }
};

/**
 * Creates a new SCP subject entry
 * @param {Object} subject - The SCP subject data to create
 * @param {string} subject.item - SCP item number (e.g., "SCP-173")
 * @param {string} subject.class - Object class (Safe, Euclid, or Keter)
 * @param {string} subject.description - Detailed description
 * @param {string} subject.containment - Containment procedures
 * @param {string} [subject.image] - Optional image URL
 * @returns {Promise<Object>} The created SCP subject object
 * @throws {Error} Validation, network, or server errors
 */
export const createSubject = async (subject) => {
  // Validate required fields
  if (!subject) {
    throw new Error("Subject data is required");
  }

  const requiredFields = ["item", "class", "description", "containment"];
  const missingFields = requiredFields.filter(
    (field) => !subject[field] || !subject[field].toString().trim()
  );

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  // Validate SCP item number format
  if (!subject.item.toLowerCase().startsWith("scp-")) {
    throw new Error("SCP item number must start with 'SCP-'");
  }

  // Validate object class
  const validClasses = ["Safe", "Euclid", "Keter"];
  if (!validClasses.includes(subject.class)) {
    throw new Error("Object class must be one of: Safe, Euclid, Keter");
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(subject),
    });

    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = "Failed to create SCP";

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If JSON parsing fails, use status-based messages
        if (response.status === 400) {
          errorMessage = "Invalid data provided";
        } else if (response.status === 409) {
          errorMessage = "An SCP with this item number already exists";
        } else if (response.status === 401 || response.status === 403) {
          errorMessage = "You don't have permission to create SCP entries";
        } else if (response.status >= 500) {
          errorMessage = "Server error occurred. Please try again later";
        } else {
          errorMessage = `Request failed: ${response.status} ${response.statusText}`;
        }
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Validate response data
    if (!data || typeof data !== "object") {
      throw new Error("Invalid response received from server");
    }

    return data;
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        "Network connection failed. Please check your internet connection."
      );
    }
    throw error;
  }
};

/**
 * Updates an existing SCP subject with optional image upload
 * @param {Object} subjectData - The updated SCP subject data
 * @param {File} [imageFile] - Optional new image file to upload
 * @returns {Promise<Object>} The updated SCP subject object
 * @throws {Error} Validation, upload, network, or server errors
 */
export const updateSubject = async (subjectData, imageFile) => {
  // Validate required data
  if (!subjectData || !subjectData.id) {
    throw new Error("Subject data with ID is required for updates");
  }

  try {
    let imageUrl = subjectData.image; // Default to existing image

    // Handle image upload if a new image is provided
    if (imageFile) {
      try {
        // Generate unique filename
        const fileName = `scp-${subjectData.item.replace(
          /[^a-zA-Z0-9]/g,
          "-"
        )}-${Date.now()}`;
        const BUCKET_NAME = "images";

        // Upload the image to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Image upload error:", uploadError);
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        // Create a signed URL with long expiration (1 year)
        const expiresIn = 60 * 60 * 24 * 365;
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(fileName, expiresIn);

        if (signedUrlError || !signedUrlData) {
          console.error("Signed URL generation error:", signedUrlError);
          throw new Error("Failed to generate image URL");
        }

        imageUrl = signedUrlData.signedUrl;
      } catch (imageError) {
        // If image upload fails, we can still update other fields
        console.warn(
          "Image upload failed, proceeding with text updates:",
          imageError
        );
        throw new Error(`Image upload failed: ${imageError.message}`);
      }
    }

    // Prepare data for update (include all required fields)
    const dataToUpdate = {
      item: subjectData.item?.trim(),
      class: subjectData.class,
      description: subjectData.description?.trim(),
      containment: subjectData.containment?.trim(),
      image: imageUrl,
    };

    // Validate required fields
    const requiredFields = ["item", "class", "description", "containment"];
    const missingFields = requiredFields.filter(
      (field) => !dataToUpdate[field]
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    // Update the SCP entry via API
    const response = await fetch(`${API_URL}/${subjectData.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(dataToUpdate),
    });

    if (!response.ok) {
      let errorMessage = "Failed to update SCP";

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        if (response.status === 404) {
          errorMessage = "SCP entry not found";
        } else if (response.status === 400) {
          errorMessage = "Invalid data provided";
        } else if (response.status === 409) {
          errorMessage = "An SCP with this item number already exists";
        } else if (response.status === 401 || response.status === 403) {
          errorMessage = "You don't have permission to edit this SCP";
        } else if (response.status >= 500) {
          errorMessage = "Server error occurred. Please try again later";
        } else {
          errorMessage = `Update failed: ${response.status} ${response.statusText}`;
        }
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Handle different response formats from the API
    if (!data) {
      throw new Error("No data received from server");
    }

    // If response is an array, return the first element
    if (Array.isArray(data)) {
      if (data.length === 0) {
        // Return the original data with updated image if no response data
        return {
          ...subjectData,
          image: imageUrl,
        };
      }
      return data[0];
    }

    // If response is an object, return it directly
    if (typeof data === "object") {
      return data;
    }

    // Fallback: return original data with updated image
    return {
      ...subjectData,
      image: imageUrl,
    };
  } catch (error) {
    console.error("Error updating subject:", error);

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        "Network connection failed. Please check your internet connection."
      );
    }

    throw error;
  }
};

/**
 * Deletes an SCP subject by ID
 * @param {string|number} id - The unique identifier for the SCP subject to delete
 * @returns {Promise<boolean>} True if deletion was successful
 * @throws {Error} Validation, network, or server errors
 */
export const deleteSubject = async (id) => {
  if (!id) {
    throw new Error("SCP ID is required for deletion");
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      let errorMessage = "Failed to delete SCP";

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        if (response.status === 404) {
          errorMessage = "SCP entry not found or already deleted";
        } else if (response.status === 401 || response.status === 403) {
          errorMessage = "You don't have permission to delete this SCP";
        } else if (response.status >= 500) {
          errorMessage = "Server error occurred. Please try again later";
        } else {
          errorMessage = `Delete failed: ${response.status} ${response.statusText}`;
        }
      }

      throw new Error(errorMessage);
    }

    return true; // Indicate successful deletion
  } catch (error) {
    console.error("Error deleting subject:", error);

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        "Network connection failed. Please check your internet connection."
      );
    }

    throw error;
  }
};

/**
 * Uploads an image to Supabase Storage and returns a signed URL
 * @param {File} file - The image file to upload
 * @param {string} fileName - The desired filename (without extension)
 * @returns {Promise<string>} The signed URL for the uploaded image
 * @throws {Error} Upload or URL generation errors
 */
export const uploadImage = async (file, fileName) => {
  // Validate inputs
  if (!file) {
    throw new Error("Image file is required");
  }

  if (!fileName) {
    throw new Error("Filename is required");
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error("Image file must be smaller than 5MB");
  }

  try {
    const BUCKET_NAME = "images";

    // Upload to the root of the bucket
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false, // Don't overwrite existing files
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);

      // Handle specific upload errors
      if (uploadError.message.includes("duplicate")) {
        throw new Error("A file with this name already exists");
      } else if (uploadError.message.includes("size")) {
        throw new Error("File size exceeds the allowed limit");
      } else if (uploadError.message.includes("type")) {
        throw new Error("File type not supported");
      } else {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
    }

    // Create a signed URL with long expiration (1 year)
    const expiresIn = 60 * 60 * 24 * 365; // 1 year in seconds
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(fileName, expiresIn);

    if (signedUrlError || !signedUrlData) {
      console.error("Signed URL generation error:", signedUrlError);
      throw new Error("Failed to generate access URL for uploaded image");
    }

    // Validate that we received a proper URL
    if (
      !signedUrlData.signedUrl ||
      typeof signedUrlData.signedUrl !== "string"
    ) {
      throw new Error("Invalid URL received from storage service");
    }

    console.log("Successfully uploaded image:", fileName);
    return signedUrlData.signedUrl;
  } catch (error) {
    console.error("Error uploading image:", error);

    // Re-throw with more user-friendly message if it's a generic error
    if (error.message === "Failed to fetch" || error.name === "TypeError") {
      throw new Error(
        "Network connection failed. Please check your internet connection and try again."
      );
    }

    throw error;
  }
};
