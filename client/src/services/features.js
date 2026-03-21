import api from "./api";

// 🧠 AI-Exclusive
export const sellerPsychology   = (data) => api.post("/features/seller-psychology", data);
export const fakeDiscount        = (data) => api.post("/features/fake-discount", data);
export const reviewSentiment     = (data) => api.post("/features/review-sentiment", data);
export const bundleTrap          = (data) => api.post("/features/bundle-trap", data);
export const regionalArbitrage   = (data) => api.post("/features/regional-arbitrage", data);

// 📸 Visual
export const imageAnalyze        = (data) => api.post("/features/image-analyze", data);

// 🤝 Social
export const negotiationScript   = (data) => api.post("/features/negotiation-script", data);
export const priceShame          = (data) => api.post("/features/price-shame", data);
export const communityPrices     = (name) => api.get(`/features/community-prices/${encodeURIComponent(name)}`);

// 🎯 Niche
export const emiTrap             = (data) => api.post("/features/emi-trap", data);
export const subscriptionAnalyze = (data) => api.post("/features/subscription", data);
export const secondhandValidate  = (data) => api.post("/features/secondhand", data);
export const auctionAdvisor      = (data) => api.post("/features/auction-advisor", data);
