export const uid = () => `b${Date.now()}${Math.random().toString(36).slice(2,8)}`;

export const deepClone = (x) => JSON.parse(JSON.stringify(x));

export const ai = (useCases, requiredModels, prompts = {}) => ({ useCases, requiredModels, prompts });
