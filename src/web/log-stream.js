import { state } from "./state.js";

export function teardownLog() {
  if (state.logSource) {
    try {
      state.logSource.close();
    } catch {
      // noop
    }
    state.logSource = null;
  }
}
