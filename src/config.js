// Цей код автоматично визначає, яку адресу використовувати
export const API_BASE = import.meta.env.MODE === 'production' 
  ? '/teammate-finder/api'  // На сервері (Production)
  : '/api';                 // Вдома (Development)