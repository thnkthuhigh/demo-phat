import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import safeStorage from "./utils/storage";
import logger from "redux-logger";

// Import your reducers
import authReducer from "./features/auth/authSlice";
import caseReducer from "./features/cases/caseSlice";
import supportReducer from "./features/support/supportSlice";
import messageReducer from "./features/messages/messageSlice";
import userReducer from "./features/users/userSlice";

// Create a safe storage option
const persistConfig = {
  key: "root",
  storage: {
    getItem: async (key) => {
      const value = safeStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    },
    setItem: async (key, value) => {
      return safeStorage.setItem(key, JSON.stringify(value));
    },
    removeItem: async (key) => {
      return safeStorage.removeItem(key);
    },
  },
  whitelist: ["auth"], // Only persist auth state
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    cases: caseReducer,
    support: supportReducer, // Make sure this is correctly named 'support'
    messages: messageReducer,
    users: userReducer, // Added users reducer here
    // Add other reducers here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(logger),
  devTools: process.env.NODE_ENV !== "production",
});

let persistor = null;
try {
  persistor = persistStore(store);
} catch (error) {
  console.error("Failed to initialize persistor:", error);
}

export { store, persistor };
