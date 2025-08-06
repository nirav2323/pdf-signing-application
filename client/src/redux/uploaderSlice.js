import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from './../api/axios';

export const uploadDocument = createAsyncThunk('uploader/uploadDocument', async (formData, thunkAPI) => {
  console.log('formData',formData)
  try {
    const response = await axios.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response.data.message || 'Upload failed');
  }
});

const uploaderSlice = createSlice({
  name: 'uploader',
  initialState: {
    documents: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(uploadDocument.pending, (state) => { state.loading = true; })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents.push(action.payload);
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default uploaderSlice.reducer;
