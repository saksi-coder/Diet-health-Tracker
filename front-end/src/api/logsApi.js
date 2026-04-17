import api from "./axiosInstance";

// --- Today's Full Log ---
export const getTodayLog = async () => {
  const response = await api.get("/logs/today");
  return response.data;
};

// --- Logs Range (for charts) ---
export const getLogsRange = async (range = 7) => {
  const response = await api.get(`/logs?range=${range}`);
  return response.data;
};

// --- Meals ---
export const getTodayMeals = async () => {
  const response = await api.get("/logs/today/meals");
  return response.data;
};

export const addMeal = async (data) => {
  const response = await api.post("/logs/meals", data);
  return response.data;
};

export const updateMeal = async (id, data) => {
  const response = await api.put(`/logs/meals/${id}`, data);
  return response.data;
};

export const deleteMeal = async (id) => {
  const response = await api.delete(`/logs/meals/${id}`);
  return response.data;
};

// --- Water ---
export const getTodayWater = async () => {
  const response = await api.get("/logs/today/water");
  return response.data;
};

export const addWater = async (data) => {
  const response = await api.post("/logs/water", data);
  return response.data;
};

// --- Exercises ---
export const getTodayExercises = async () => {
  const response = await api.get("/logs/today/exercises");
  return response.data;
};

export const addExercise = async (data) => {
  const response = await api.post("/logs/exercises", data);
  return response.data;
};

export const updateExercise = async (id, data) => {
  const response = await api.put(`/logs/exercises/${id}`, data);
  return response.data;
};

export const deleteExercise = async (id) => {
  const response = await api.delete(`/logs/exercises/${id}`);
  return response.data;
};

// --- Weight ---
export const getWeightHistory = async () => {
  const response = await api.get("/logs/weight/history");
  return response.data;
};

export const logWeight = async (data) => {
  const response = await api.post("/logs/weight", data);
  return response.data;
};
