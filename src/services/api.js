const API_URL = "http://localhost:5000/api/scp";
import { supabase } from './supabaseClient';

export const getAllSubjects = async () => {
  const response = await fetch(API_URL);
  return response.json();
};

export const getSubjectById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);
  return response.json();
};

export const createSubject = async (subject) => {
  const response = await fetch(`${API_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subject),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || "Failed to create SCP");
  }
  
  return response.json();
};

export const updateSubject = async (subjectData, imageFile) => {
  try {
    // First handle the image upload if there's a new image
    let imageUrl = subjectData.image; // Default to existing image
    
    if (imageFile) {
      // Upload the image to storage
      const fileName = `scp-${subjectData.item}-${Date.now()}`;
      const BUCKET_NAME = 'images'; // Use the same bucket name that exists
      
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
      // Create a signed URL with a very long expiration
      const expiresIn = 60 * 60 * 24 * 365; // 1 year in seconds
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(fileName, expiresIn);

      if (signedUrlError || !signedUrlData) {
        console.error('Signed URL generation error:', signedUrlError);
        throw signedUrlError || new Error('Failed to generate signed URL');
      }
      
      // Use the signed URL
      imageUrl = signedUrlData.signedUrl;
    }
    
    // Include all fields that are in your database table
    const dataToUpdate = {
      item: subjectData.item,
      class: subjectData.class,
      description: subjectData.description,
      containment: subjectData.containment,
      image: imageUrl
    };
    
    // Update using the ID
    const response = await fetch(`${API_URL}/${subjectData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToUpdate),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || "Failed to update SCP");
    }
    
    const data = await response.json();
    
    // FIX: Check if data exists and has elements before accessing index 0
    if (!data || !Array.isArray(data) || data.length === 0) {
      // Return the original subject data with the updated image
      return {
        ...subjectData,
        image: imageUrl
      };
    }
    
    return data[0]; // Return the first element if it exists
  } catch (error) {
    console.error("Error updating subject:", error);
    throw error;
  }
};

export const deleteSubject = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || "Failed to delete SCP");
    }
    
    return true; // Indicate success
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
};

// Upload image to Supabase Storage and return a signed URL with a long expiration
export const uploadImage = async (file, fileName) => {
  try {
    // Make sure we're using the correct bucket name
    const BUCKET_NAME = 'images';
    
    // Upload to the root of the bucket
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Create a signed URL with a very long expiration (1 year)
    const expiresIn = 60 * 60 * 24 * 365; // 1 year in seconds
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(fileName, expiresIn);

    if (signedUrlError || !signedUrlData) {
      console.error('Signed URL generation error:', signedUrlError);
      throw signedUrlError || new Error('Failed to generate signed URL');
    }
    
    // Log the signed URL for debugging
    console.log('Generated signed image URL:', signedUrlData.signedUrl);
    
    // Return the signed URL
    return signedUrlData.signedUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
