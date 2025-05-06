import supabase from "../models/scpModel.js";

// Get all SCP subjects
export const getAllSubjects = async (req, res) => {
  const { data, error } = await supabase.from("scp_subjects").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// Get a single SCP subject by item
export const getSubjectByItem = async (req, res) => {
  const { item } = req.params;
  const { data, error } = await supabase
    .from("scp_subjects")
    .select("*")
    .eq("item", item)
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
};

// Create a new SCP subject
export const createSubject = async (req, res) => {
  const { item, class: scpClass, description, containment } = req.body;
  const { data, error } = await supabase
    .from("scp_subjects")
    .insert([{ item, class: scpClass, description, containment }]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

// Update an SCP subject
export const updateSubject = async (req, res) => {
  const { item } = req.params;
  const { class: scpClass, description, containment } = req.body;
  const { data, error } = await supabase
    .from("scp_subjects")
    .update({ class: scpClass, description, containment })
    .eq("item", item);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// Delete an SCP subject
export const deleteSubject = async (req, res) => {
  const { item } = req.params;
  const { data, error } = await supabase
    .from("scp_subjects")
    .delete()
    .eq("item", item);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
