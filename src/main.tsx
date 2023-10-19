import React from 'react'
import ReactDOM from 'react-dom/client'
import { configureStore } from "@reduxjs/toolkit";
import { Provider, TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { callStackGraphSlice } from "./call_stack_graph/call_stack_graph.slice"
import App from './app'
import './index.css'
import { appSlice } from './app.slice';

const store = configureStore({
  reducer: {
    callStackGraphReducer: callStackGraphSlice.reducer,
    appReducer: appSlice.reducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type DispatchFunction = () => AppDispatch;
export const useAppDispatch: DispatchFunction = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
