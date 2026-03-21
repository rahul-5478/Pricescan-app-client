import api from "./api";

// AI features
export const chatAssistant      = (data) => api.post("/advanced/chat", data);
export const priceDropPredict   = (data) => api.post("/advanced/price-drop", data);
export const fakeProductDetect  = (data) => api.post("/advanced/fake-product", data);
export const returnPolicyAnalyze= (data) => api.post("/advanced/return-policy", data);
export const competitorPrices   = (data) => api.post("/advanced/competitor-prices", data);
export const spendingReport     = (data) => api.post("/advanced/spending-report", data);
export const priceManipulation  = (data) => api.post("/advanced/price-manipulation", data);

// Wishlist
export const getWishlist        = ()     => api.get("/advanced/wishlist");
export const addWishlist        = (data) => api.post("/advanced/wishlist", data);
export const removeWishlist     = (id)   => api.delete(`/advanced/wishlist/${id}`);

// Budget
export const getBudget          = (month)=> api.get(`/advanced/budget?month=${month||""}`);
export const saveBudget         = (data) => api.post("/advanced/budget", data);

// Seller Blacklist
export const getBlacklist       = ()     => api.get("/advanced/blacklist");
export const reportSeller       = (data) => api.post("/advanced/blacklist/report", data);
