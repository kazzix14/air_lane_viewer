import { CallStackGraph } from "./call_stack_graph/call_stack_graph.component";
import { AppDispatch, useAppDispatch } from "./main";
import {
  setEdges,
  setError,
  unsetError,
} from "./call_stack_graph/call_stack_graph.slice";
import { zEdges, Edges } from "./call_stack_graph/call_stack_graph.slice";
import { Result, ok, err } from "neverthrow";
import { safeParseJson } from "./json";

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

const handleTextareaChange = (
  event: React.ChangeEvent<HTMLTextAreaElement>,
  dispatch: AppDispatch
) => {
  const maybeEdges = ParseEdges(event.target.value);

  if (maybeEdges.isOk()) {
    dispatch(setEdges(maybeEdges.value));
    dispatch(unsetError());
  } else {
    dispatch(setError(maybeEdges.error.toString()));
  }
};

const App = () => {
  const dispatch = useAppDispatch();

  return (
    <div className="App">
      <textarea
        //style={{ width: "100px", height: "200px" }}
        className="border"
        onChange={(e) => handleTextareaChange(e, dispatch)}
      />
      <CallStackGraph></CallStackGraph>
    </div>
  );
};

export default App;
