import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { z } from "zod";

interface appState {
  mode: "edit" | "view";
}

export const appSlice = createSlice({
  name: "appSlice",
  initialState: {
    mode: "edit",
  } as appState,
  reducers: {
    enterEditMode: (state) => {
      state.mode = "edit";
    },
    enterViewMode: (state) => {
      state.mode = "view";
    },
  },
});

export const {
  enterEditMode,
  enterViewMode
} = appSlice.actions;
