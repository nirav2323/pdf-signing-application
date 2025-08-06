import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import uploaderReducer from './uploaderSlice';
import signerReducer from './signerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    uploader: uploaderReducer,
    signer: signerReducer,
  },
});
