import { Result, ok, err } from "neverthrow";

export const safeParseJson = (text: string): Result<unknown, SyntaxError> => {
  try {
    const json = JSON.parse(text);

    return ok(json);
  } catch (e) {
    if (e instanceof SyntaxError) {
      return err(e);
    } else {
      throw e;
    }
  }
};

export const uniquifyArray = <T>(arr: Array<T>): Array<T> => {
  return Array.from(new Set(arr));
}
