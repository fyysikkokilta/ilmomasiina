import React, { PropsWithChildren, useMemo } from "react";

import type { UserEventListResponse } from "@tietokilta/ilmomasiina-models";
import { ApiError, apiFetch } from "../../api";
import { useAbortablePromise } from "../../utils/abortable";
import { getLocalizedEventListItem } from "../../utils/localizedEvent";
import { createStateContext } from "../../utils/stateContext";
import useShallowMemo from "../../utils/useShallowMemo";

export type EventListProps = {
  category?: string;
  maxAge?: string;
  language?: string;
};

type State = {
  events?: UserEventListResponse;
  localizedEvents?: UserEventListResponse;
  pending: boolean;
  error?: ApiError;
};

const { Provider, useStateContext } = createStateContext<State>();
export { useStateContext as useEventListContext };

export function useEventListState({ category, maxAge, language }: EventListProps = {}) {
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

  const events = fetchEvents.result;

  const localizedEvents = useMemo(
    () => (events && language ? events.map((event) => getLocalizedEventListItem(event, language)) : events),
    [events, language],
  );

  return useShallowMemo<State>({
    events: fetchEvents.result,
    localizedEvents,
    pending: fetchEvents.pending,
    error: fetchEvents.error as ApiError | undefined,
  });
}

export function EventListProvider({ category, maxAge, language, children }: PropsWithChildren<EventListProps>) {
  const state = useEventListState({ category, maxAge, language });
  return <Provider value={state}>{children}</Provider>;
}
