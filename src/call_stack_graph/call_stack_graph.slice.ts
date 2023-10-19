import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { z } from "zod";

export const zEdge = z.object({
  caller: z.string(),
  callee: z.string(),
});

export const zEdges = z.array(zEdge);
export type Edge = z.infer<typeof zEdge>;
export type Edges = z.infer<typeof zEdges>;

interface callStackGraphState {
  edges: Edges;
  entrypointNodes: Array<string> | null;
  hoveredNode: string | null;
  error: string | null;
}

export const callStackGraphSlice = createSlice({
  name: "callStackGraph",
  initialState: {
    edges: [],
    entrypointNodes: null,
    hoveredNode: null,
    error: null,
  } as callStackGraphState,
  reducers: {
    setHoveredNode: (state, action: PayloadAction<string>) => {
      state.hoveredNode = action.payload;
    },
    unsetHoveredNode: (state) => {
      state.hoveredNode = null;
    },
    setEdges: (state, action: PayloadAction<Edges>) => {
      state.edges = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    unsetError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setEdges,
  setError,
  unsetError,
  setHoveredNode,
  unsetHoveredNode,
} = callStackGraphSlice.actions;
