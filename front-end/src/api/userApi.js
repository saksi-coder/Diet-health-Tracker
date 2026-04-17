import api from "./axiosInstance";

export const getProfile = async () => {
  const response = await api.get("/user/profile");
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put("/user/profile", data);
  return response.data;
};
