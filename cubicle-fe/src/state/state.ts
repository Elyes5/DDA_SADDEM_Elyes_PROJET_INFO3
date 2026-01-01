import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import snippetReducer from './slices/snippetSlice'
import topicReducer from './slices/topicSlice'
import userReducer from './slices/userSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    snippets: snippetReducer,
    topics: topicReducer,
    users: userReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
