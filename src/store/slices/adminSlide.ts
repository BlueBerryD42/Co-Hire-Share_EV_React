import { createSlice } from '@reduxjs/toolkit'

interface AdminState {
  // Add admin state properties here as needed
}

const initialState: AdminState = {}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Add admin reducers here as needed
  },
})

export default adminSlice.reducer
