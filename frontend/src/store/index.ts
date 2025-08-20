import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import tasksSlice from './tasksSlice';
import uiSlice from './uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    tasks: tasksSlice,
    ui: uiSlice,
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