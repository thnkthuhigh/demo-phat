import { configureStore } from "@reduxjs/toolkit";
import supportReducer from "../features/support/supportSlice";

export const store = configureStore({
  reducer: {
    support: supportReducer,
    // other reducers
  },
});
