const API_URL = "http://localhost:5000/api/scp";

export const getAllSubjects = async () => {
  const response = await fetch(API_URL);
  return response.json();
};

export const getSubjectByItem = async (item) => {
  const response = await fetch(`${API_URL}/${item}`);
  return response.json();
};

export const createSubject = async (subject) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subject),
  });
  return response.json();
};

export const updateSubject = async (item, updates) => {
  const response = await fetch(`${API_URL}/${item}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return response.json();
};

export const deleteSubject = async (item) => {
  const response = await fetch(`${API_URL}/${item}`, {
    method: "DELETE",
  });
  return response.json();
};
