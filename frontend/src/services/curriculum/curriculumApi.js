/**
 * CURRICULUM API SERVICE
 * Owner: curriculum branch
 * Webhook prefix: /webhook/curriculum-*
 */

import axios from 'axios';

const N8N_BASE_URL = process.env.REACT_APP_N8N_URL || 'http://localhost:5678';

const api = axios.create({
  baseURL: N8N_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const uploadBook = async (file, metadata) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('metadata', JSON.stringify(metadata));
  
  const response = await api.post('/webhook/curriculum-upload-book', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getAllBooks = async () => {
  const response = await api.get('/webhook/curriculum-get-all');
  return response.data;
};

export const getBookById = async (bookId) => {
  const response = await api.get(`/webhook/curriculum-get-book?id=${bookId}`);
  return response.data;
};

export const getChapters = async (bookId) => {
  const response = await api.get(`/webhook/curriculum-get-chapters?bookId=${bookId}`);
  return response.data;
};

export const getOcrStatus = async (bookId) => {
  const response = await api.get(`/webhook/curriculum-ocr-status?bookId=${bookId}`);
  return response.data;
};

export const searchCurriculum = async (query, filters = {}) => {
  const response = await api.post('/webhook/curriculum-search', { query, ...filters });
  return response.data;
};

export default {
  uploadBook,
  getAllBooks,
  getBookById,
  getChapters,
  getOcrStatus,
  searchCurriculum,
};