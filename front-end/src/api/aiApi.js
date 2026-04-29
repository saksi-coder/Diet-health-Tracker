import api from "./axiosInstance";

export const getDietPlan = async (preference = "") => {
  const res = await api.post("/ai/diet-plan", { preference });
  return res.data;
};

export const sendChatMessage = async (message) => {
  const res = await api.post("/ai/chat", { message });
  return res.data;
};
