import axios from 'axios';

const HOST = window.location.hostname;
const API_URL = import.meta.env.VITE_API_URL || `http://${HOST}:8080/api`;

const api = axios.create({
  baseURL: API_URL,
});

export const createRoom = async () => {
  const response = await api.post('/rooms');
  return response.data;
};

export const getRoom = async (roomId) => {
  const response = await api.get(`/rooms/${roomId}`);
  return response.data;
};

export const joinRoom = async (roomId) => {
  await api.post(`/rooms/${roomId}/join`);
};

export const uploadFile = async (roomId, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post(`/rooms/${roomId}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
  return response.data;
};

export const shareText = async (roomId, content) => {
  const response = await api.post(`/rooms/${roomId}/texts`, { content });
  return response.data;
};

export const getDownloadUrl = (roomId, fileId) => {
  return `${API_URL}/rooms/${roomId}/files/${fileId}`;
};

export const getPreviewUrl = (roomId, fileId) => {
  return `${API_URL}/rooms/${roomId}/files/${fileId}?inline=true`;
};

export const deleteFile = async (roomId, fileId) => {
  await api.delete(`/rooms/${roomId}/files/${fileId}`);
};

export const deleteText = async (roomId, textId) => {
  await api.delete(`/rooms/${roomId}/texts/${textId}`);
};

export default api;
