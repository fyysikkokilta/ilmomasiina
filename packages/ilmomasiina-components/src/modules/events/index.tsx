import React, { PropsWithChildren } from "react";

import type { UserEventListResponse } from "@tietokilta/ilmomasiina-models";
import apiFetch, { ApiError } from "../../api";
import { useAbortablePromise } from "../../utils/abortable";
import { createStateContext } from "../../utils/stateContext";
import useShallowMemo from "../../utils/useShallowMemo";

export type EventListProps = {
  category?: string;
};

type State = {
  events?: UserEventListResponse;
  pending: boolean;
  error?: ApiError;
};

const { Provider, useStateContext } = createStateContext<State>();
export { useStateContext as useEventListContext };

export function useEventListState({ category }: EventListProps = {}) {
  const fetchEvents = useAbortablePromise(
    (signal) => {
      const query = category === undefined ? "" : `?${new URLSearchParams({ category })}`;
      return apiFetch<UserEventListResponse>(`events${query}`, {
        signal,
      });
    },
    [category],
  );

  return useShallowMemo<State>({
    events: fetchEvents.result,
    pending: fetchEvents.pending,
    error: fetchEvents.error as ApiError | undefined,
  });
}

export function EventListProvider({ category, children }: PropsWithChildren<EventListProps>) {
  const state = useEventListState({ category });
  return <Provider value={state}>{children}</Provider>;
}
