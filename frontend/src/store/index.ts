import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import tasksSlice from './tasksSlice';
import uiSlice from './uiSlice';
import analyticsSlice from './analyticsSlice'; // <--- 1. IMPORT THE NEW REDUCER

export const store = configureStore({
  reducer: {
    auth: authSlice,
    tasks: tasksSlice,
    ui: uiSlice,
    analytics: analyticsSlice, // <--- 2. REGISTER IT HERE
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;