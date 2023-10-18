import { CallStackGraph } from "./call_stack_graph/call_stack_graph.component";
import { AppDispatch, useAppDispatch, useAppSelector } from "./main";
import {
  setEdges,
  setError,
  unsetError,
} from "./call_stack_graph/call_stack_graph.slice";
import { zEdges, Edges } from "./call_stack_graph/call_stack_graph.slice";
import { Result, ok, err } from "neverthrow";
import { safeParseJson } from "./json";
import { enterEditMode, enterViewMode } from "./app.slice";
import { useEffect } from "react";

// input is like:
// [{"/rails_app/app/services/app_payments/charges/create_service.rb#execute":"/rails_app/app/services/app_payments/charges/create_service.rb#open"},{"/rails_app/app/services/gachas/check_outs/create_service.rb#authorize_with_payjp":"/rails_app/app/services/app_payments/charges/create_service.rb#execute"},{"/rails_app/app/services/gachas/check_outs/create_service.rb#execute":"/rails_app/app/services/gachas/check_outs/create_service.rb#authorize_with_payjp"},{"/rails_app/app/controllers/api/private/gachas/check_outs_controller.rb#create":"/rails_app/app/services/gachas/check_outs/create_service.rb#execute"},{"/rails_app/app/services/checkouts/create_service.rb#execute":"/rails_app/app/services/app_payments/charges/create_service.rb#execute"},{"/rails_app/app/controllers/api/tapirs_area/checkouts_controller.rb#confirm":"/rails_app/app/services/checkouts/create_service.rb#execute"},{"/rails_app/app/controllers/api/admin/checkouts_controller.rb#confirm":"/rails_app/app/services/checkouts/create_service.rb#execute"},{"/rails_app/app/services/prepayments/orders/settle_service.rb#authorize_with_payjp!":"/rails_app/app/services/app_payments/charges/create_service.rb#execute"},{"/rails_app/app/services/prepayments/orders/settle_service.rb#payment_pre_process!":"/rails_app/app/services/prepayments/orders/settle_service.rb#authorize_with_payjp!"},{"/rails_app/app/services/prepayments/orders/settle_service.rb#block (2 levels) in execute":"/rails_app/app/services/prepayments/orders/settle_service.rb#payment_pre_process!"},{"/rails_app/app/models/prepayment/order.rb#block in complete!":"/rails_app/app/services/prepayments/orders/settle_service.rb#block (2 levels) in execute"},{"/rails_app/app/models/prepayment/order.rb#complete!":"/rails_app/app/models/prepayment/order.rb#block in complete!"},{"/rails_app/app/services/prepayments/orders/settle_service.rb#block in execute":"/rails_app/app/models/prepayment/order.rb#complete!"},{"/rails_app/app/services/prepayments/orders/settle_service.rb#execute":"/rails_app/app/services/prepayments/orders/settle_service.rb#block in execute"},{"/rails_app/app/controllers/api/private/prepayment/periods/orders_controller.rb#block in payment":"/rails_app/app/services/prepayments/orders/settle_service.rb#execute"},{"/rails_app/app/controllers/api/private/application_controller.rb#lock_per_user!":"/rails_app/app/controllers/api/private/prepayment/periods/orders_controller.rb#block in payment"},{"/rails_app/app/controllers/api/private/prepayment/periods/orders_controller.rb#payment":"/rails_app/app/controllers/api/private/application_controller.rb#lock_per_user!"}]

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

    console.log("dispatching to view 0");
    if (maybeEdges.isOk()) {
      dispatch(setEdges(maybeEdges.value));
      dispatch(unsetError());
    } else {
      dispatch(setError(maybeEdges.error.toString()));
    }

    console.log("dispatching to view");
    dispatch(enterViewMode());
  } else if (currentMode === "view") {
    console.log("dispatching to edit");
    dispatch(enterEditMode());
  }

  console.log(`currentMode: ${currentMode}`);
  event.preventDefault();
};

const App = () => {
  const dispatch = useAppDispatch();
  const currentMode = useAppSelector((state) => state.appReducer.mode);
  console.log(currentMode);

  if (currentMode === "edit") {
    return (
      <div className="App">
        <h1 className="text-2xl">Call Stack Graph</h1>
        <form
          className="w-32"
          onSubmit={(e) => handleToggleMode(e, dispatch, currentMode)}>
          <textarea className="border w-full h-full" />
          <input type="submit" value="view"/>
        </form>
      </div>
    );
  } else if (currentMode === "view") {
    return (
      <div className="App">
        <h1 className="text-2xl">Call Stack Graph</h1>
        <form onSubmit={(e) => handleToggleMode(e, dispatch, currentMode)}>
          <input type="submit" value="back"/>
        </form>
        <div className="w-full">
          <CallStackGraph></CallStackGraph>
        </div>
      </div>
    );
  }
};

export default App;
