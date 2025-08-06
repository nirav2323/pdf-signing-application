import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from './../api/axios';

export const fetchAssignedDocs = createAsyncThunk('signer/fetchAssignedDocs', async (_, thunkAPI) => {
  try {
    const response = await axios.get('/documents/assigned');
    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response.data.message || 'Fetch failed');
  }
});

export const submitSignature = createAsyncThunk('signer/submitSignature', async ({ docId, signatureData }, thunkAPI) => {
  try {
    const response = await axios.post(`/documents/sign/${docId}`, signatureData);
    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response.data.message || 'Submit failed');
  }
});

const signerSlice = createSlice({
  name: 'signer',
  initialState: {
    assignedDocs: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchAssignedDocs.pending, (state) => { state.loading = true; })
      .addCase(fetchAssignedDocs.fulfilled, (state, action) => {
        state.loading = false;
        state.assignedDocs = action.payload;
      })
      .addCase(fetchAssignedDocs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitSignature.pending, (state) => { state.loading = true; })
      .addCase(submitSignature.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(submitSignature.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default signerSlice.reducer;
