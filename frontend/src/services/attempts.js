import axios from "../api/axios";

export const attemptsService = {
  startAttempt: async (itemId, itemType, maxScore) => {
    const response = await axios.post("/attempts/start", { itemId, itemType, maxScore });
    return response.data;
  },

  completeAttempt: async (attemptId, score, completionTime, taskStates) => {
    const response = await axios.post(`/attempts/${attemptId}/complete`, { 
      score, 
      completionTime, 
      taskStates 
    });
    return response.data;
  },

  getItemStats: async (itemType, itemId) => {
    const response = await axios.get(`/attempts/stats/${itemType}/${itemId}`);
    return response.data;
  }
};
