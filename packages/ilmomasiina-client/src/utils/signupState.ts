export enum SignupState {
  disabled = "disabled",
  not_opened = "not_opened",
  open = "open",
  closed = "closed",
}

export type SignupStateInfo =
  | { state: SignupState.disabled }
  | { state: SignupState.not_opened; opens: Date }
  | { state: SignupState.open; closes: Date }
  | { state: SignupState.closed; closed: Date };

/** Determines the state of the signup at the given time, by default the current time. */
export function signupState(starts: string | null, closes: string | null, now = new Date()): SignupStateInfo {
  if (starts === null || closes === null) {
    return { state: SignupState.disabled };
  }

  const signupOpens = new Date(starts);
  const signupCloses = new Date(closes);

  if (now < signupOpens) {
    return { state: SignupState.not_opened, opens: signupOpens };
  }

  if (now < signupCloses) {
    return { state: SignupState.open, closes: signupCloses };
  }

  return { state: SignupState.closed, closed: signupCloses };
}
