import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import snippetReducer from './slices/snippetSlice'
import topicReducer from './slices/topicSlice'
import userReducer from './slices/userSlice'
import notificationReducer from './slices/notificationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    snippets: snippetReducer,
    topics: topicReducer,
    users: userReducer,
    notifications: notificationReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
