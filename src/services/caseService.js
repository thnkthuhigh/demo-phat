import api from "../utils/api";

// Existing functions...

// Add this function to toggle featured status
export const toggleCaseFeature = async (caseId) => {
  const response = await api.put(`/cases/${caseId}/feature`);
  return response.data;
};

// Other existing functions...
