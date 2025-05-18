import supabase from "../models/scpModel.js";

// Get all SCP subjects
export const getAllSubjects = async (req, res) => {
  const { data, error } = await supabase.from("scp_subjects").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// Get a single SCP subject by ID
export const getSubjectById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("scp_subjects")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
};

// Create a new SCP subject
export const createSubject = async (req, res) => {
  const { item, class: scpClass, description, containment, image } = req.body;
  const { data, error } = await supabase
    .from("scp_subjects")
    .insert([{ item, class: scpClass, description, containment, image }])
    .select(); // Return the created records with their generated IDs
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

// Update an SCP subject
export const updateSubject = async (req, res) => {
  const { id } = req.params;
  const { item, class: scpClass, description, containment, image } = req.body;
  
  try {
    const { data, error } = await supabase
      .from("scp_subjects")
      .update({ item, class: scpClass, description, containment, image })
      .eq("id", id)
      .select(); // This should return the updated records
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    // If no data is returned or empty array, fetch the record after update
    if (!data || data.length === 0) {
      const { data: fetchedData, error: fetchError } = await supabase
        .from("scp_subjects")
        .select("*")
        .eq("id", id)
        .single();
        
      if (fetchError) {
        return res.status(404).json({ error: fetchError.message });
      }
      
      return res.json([fetchedData]); // Return as array to maintain expected format
    }
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete an SCP subject
export const deleteSubject = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Fix: Only destructure the error since we're not using data
    const { error } = await supabase
      .from("scp_subjects")
      .delete()
      .eq("id", id);
      
    if (error) {
      console.error("Delete error:", error);
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(200).json({ success: true, message: "SCP deleted successfully" });
  } catch (err) {
    console.error("Server error during delete:", err);
    return res.status(500).json({ error: err.message });
  }
};
