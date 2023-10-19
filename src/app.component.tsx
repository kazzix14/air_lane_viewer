import { CallStackGraph } from "./call_stack_graph/call_stack_graph.component";
import { AppDispatch, useAppDispatch, useAppSelector } from "./main";
import {
  setEdges,
  setError,
  unsetError,
} from "./call_stack_graph/call_stack_graph.slice";
import { zEdges, Edges } from "./call_stack_graph/call_stack_graph.slice";
import { Result, ok, err } from "neverthrow";
import { safeParseJson, uniquifyArray } from "./util";
import { enterEditMode, enterViewMode } from "./app.slice";

interface IToString {
  toString(): string;
}

const ParseEdges = (text: string): Result<Edges, IToString> => {
  return ok(text)
    .andThen((text) => safeParseJson(text))
    .andThen((json) => {
      const edges = zEdges.safeParse(json);

      if (edges.success) {
        return ok(edges.data);
      } else {
        return err(edges.error.toString());
      }
    });
};

const handleToggleMode = (
  event: React.FormEvent<HTMLFormElement>,
  dispatch: AppDispatch,
  currentMode: string
) => {
  if (currentMode === "edit") {
    const textarea = event.currentTarget.querySelector("textarea")!;
    const maybeEdges = ParseEdges(textarea.value);

    if (maybeEdges.isOk()) {
      dispatch(setEdges(maybeEdges.value));
      dispatch(unsetError());
    } else {
      dispatch(setEdges([]));
      dispatch(setError(maybeEdges.error.toString()));
    }

    dispatch(enterViewMode());
  } else if (currentMode === "view") {
    dispatch(enterEditMode());
  }

  console.log(`currentMode: ${currentMode}`);
  event.preventDefault();
};

const App = () => {
  const dispatch = useAppDispatch();
  const currentMode = useAppSelector((state) => state.appReducer.mode);

  const edges = useAppSelector((state) => state.callStackGraphReducer.edges);
  const uniqueNodeNames = uniquifyArray(
    edges.flatMap((edge) => [edge.caller, edge.callee])
  );

  const entrypointNodes = uniqueNodeNames.filter((nodeName) => {
    return !edges.some((edge) => edge.callee === nodeName);
  });

  if (currentMode === "edit") {
    return (
      <div>
        <h1 className="text-2xl">Air Lane Viewer</h1>
        <form
          className="w-32"
          onSubmit={(e) => handleToggleMode(e, dispatch, currentMode)}>
          <textarea className="border w-full h-full" />
          <input type="submit" value="view" className="border cursor-pointer"/>
        </form>
      </div>
    );
  } else if (currentMode === "view") {
    return (
      <div>
        <h1 className="text-2xl">Air Lane Viewer</h1>
        <form onSubmit={(e) => handleToggleMode(e, dispatch, currentMode)}>
          <input type="submit" value="back" className="border cursor-pointer"/>
        </form>
        <div className="flex">
          <div className="w-full">
            <h2 className="text-xl">Call Stack</h2>
            <CallStackGraph></CallStackGraph>
          </div>
          <div className="w-full">
            <h2 className="text-xl">Entrypoints</h2>
            <ol>
              {entrypointNodes.map((entrypointNode) => {
                return <li key={entrypointNode}>{entrypointNode}</li>;
              })}
            </ol>
          </div>
        </div>
      </div>
    );
  }
};

export default App;
