import axios from "../api/axios";

export const getLabs = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== "all")
    params.append("category", filters.category);
  if (filters.difficulty) params.append("difficulty", filters.difficulty);
  if (filters.search) params.append("search", filters.search);
  if (filters.type && filters.type !== "all")
    params.append("type", filters.type);
  const res = await axios.get(`/labs?${params}`);
  return res.data.data || [];
};

export const getLabById = async (idOrSlug) => {
  const res = await axios.get(`/labs/${idOrSlug}`);
  return res.data.data;
};

export const startLab = async (idOrSlug) => {
  const res = await axios.post(`/labs/start/${idOrSlug}`);
  return res.data;
};

export const stopLab = async (idOrSlug) => {
  const res = await axios.post(`/labs/stop/${idOrSlug}`);
  return res.data;
};

export const getCompletionStatus = async (idOrSlug) => {
  const res = await axios.get(`/labs/${idOrSlug}/completion-status`);
  return res.data;
};

export const completeLab = async (idOrSlug, finalScore) => {
  const res = await axios.post(`/labs/${idOrSlug}/complete`, { finalScore });
  return res.data;
};

export const getLabStatus = async (idOrSlug) => {
  const res = await axios.get(`/labs/status/${idOrSlug}`);
  return res.data;
};

// Export as object for consistent usage patterns
export const labsService = {
  getLabs,
  getLabById,
  startLab,
  stopLab,
  getLabStatus,
  getCompletionStatus,
  completeLab,
};
