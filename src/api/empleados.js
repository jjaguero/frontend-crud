import axios from 'axios';

const API_URL = 'http://localhost:3000/empleados';

export const getEmpleados = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching empleados:", error);
    return [];
  }
};

export const createEmpleado = async (empleado) => {
  return await axios.post(API_URL, empleado);
};

export const updateEmpleado = async (id, empleado) => {
  return await axios.put(`${API_URL}/${id}`, empleado);
};

export const deleteEmpleado = async (id) => {
  return await axios.delete(`${API_URL}/${id}`);
};