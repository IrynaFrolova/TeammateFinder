export const API_BASE = import.meta.env.BASE_URL === '/' 
  ? '/api' // Локально
  : `${import.meta.env.BASE_URL}api`; // 