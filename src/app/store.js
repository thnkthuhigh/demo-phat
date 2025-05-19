import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import caseReducer from "../features/cases/caseSlice";
import supportReducer from "../features/supports/supportSlice";
import messageReducer from "../features/messages/messageSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    cases: caseReducer,
    support: supportReducer,
    messages: messageReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export default store;
