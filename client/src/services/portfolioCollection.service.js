import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const portfolioCollectionService = {
  // Get all collections for authenticated user
  getCollections: async () => {
    const response = await axios.get(`${API_URL}/portfolio-collections`, {
      withCredentials: true,
    });
    return response.data;
  },

  // Get single collection
  getCollection: async (id) => {
    const response = await axios.get(`${API_URL}/portfolio-collections/${id}`, {
      withCredentials: true,
    });
    return response.data;
  },

  // Create new collection
  createCollection: async (data) => {
    const response = await axios.post(`${API_URL}/portfolio-collections`, data, {
      withCredentials: true,
    });
    return response.data;
  },

  // Update collection
  updateCollection: async (id, data) => {
    const response = await axios.put(`${API_URL}/portfolio-collections/${id}`, data, {
      withCredentials: true,
    });
    return response.data;
  },

  // Delete collection
  deleteCollection: async (id) => {
    const response = await axios.delete(`${API_URL}/portfolio-collections/${id}`, {
      withCredentials: true,
    });
    return response.data;
  },

  // Get public collections for a user
  getUserPublicCollections: async (userId) => {
    const response = await axios.get(
      `${API_URL}/portfolio-collections/user/${userId}/public`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  },

  // Get a single public collection with its assets
  getPublicCollection: async (collectionId) => {
    const response = await axios.get(
      `${API_URL}/portfolio-collections/public/${collectionId}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  },
};

export default portfolioCollectionService;
