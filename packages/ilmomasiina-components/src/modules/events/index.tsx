import React, { PropsWithChildren } from "react";

import type { UserEventListResponse } from "@tietokilta/ilmomasiina-models";
import apiFetch, { ApiError } from "../../api";
import { useAbortablePromise } from "../../utils/abortable";
import { createStateContext } from "../../utils/stateContext";
import useShallowMemo from "../../utils/useShallowMemo";

export type EventListProps = {
  category?: string;
  maxAge?: string;
};

type State = {
  events?: UserEventListResponse;
  pending: boolean;
  error?: ApiError;
};

const { Provider, useStateContext } = createStateContext<State>();
export { useStateContext as useEventListContext };

export function useEventListState({ category, maxAge }: EventListProps = {}) {
  const fetchEvents = useAbortablePromise(
    (signal) => {
      const queryKeys = new URLSearchParams();
      if (category !== undefined) queryKeys.set("category", category);
      if (maxAge !== undefined) queryKeys.set("maxAge", maxAge);
      const query = queryKeys.keys().next().value ? `?${queryKeys.toString()}` : "";
      return apiFetch<UserEventListResponse>(`events${query}`, {
        signal,
      });
    },
    [category, maxAge],
  );

  return useShallowMemo<State>({
    events: fetchEvents.result,
    pending: fetchEvents.pending,
    error: fetchEvents.error as ApiError | undefined,
  });
}

export function EventListProvider({ category, maxAge, children }: PropsWithChildren<EventListProps>) {
  const state = useEventListState({ category, maxAge });
  return <Provider value={state}>{children}</Provider>;
}
