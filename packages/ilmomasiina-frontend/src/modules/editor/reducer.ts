import {
  CATEGORIES_LOADED,
  EDIT_CONFLICT,
  EDIT_CONFLICT_DISMISSED,
  EVENT_LOAD_FAILED,
  EVENT_LOADED,
  EVENT_SAVING,
  EVENT_SLUG_CHECKED,
  EVENT_SLUG_CHECKING,
  MOVE_TO_QUEUE_CANCELED,
  MOVE_TO_QUEUE_WARNING,
  RESET,
} from './actionTypes';
import type { EditorActions, EditorState } from './types';

const initialState: EditorState = {
  event: null,
  isNew: true,
  slugAvailability: null,
  allCategories: null,
  moveToQueueModal: null,
  editConflictModal: null,
};

export default function reducer(
  state = initialState,
  action: EditorActions,
): EditorState {
  switch (action.type) {
    case RESET:
      return initialState;
    case EVENT_LOADED:
      return {
        ...state,
        event: action.payload.event,
        isNew: action.payload.isNew,
        loadError: undefined,
      };
    case EVENT_LOAD_FAILED:
      return {
        ...state,
        loadError: action.payload,
      };
    case EVENT_SLUG_CHECKING:
      return {
        ...state,
        slugAvailability: 'checking',
      };
    case EVENT_SLUG_CHECKED:
      return {
        ...state,
        slugAvailability: action.payload,
      };
    case EVENT_SAVING:
      return {
        ...state,
        moveToQueueModal: null,
      };
    case MOVE_TO_QUEUE_WARNING:
      return {
        ...state,
        moveToQueueModal: action.payload,
      };
    case MOVE_TO_QUEUE_CANCELED:
      return {
        ...state,
        moveToQueueModal: null,
      };
    case EDIT_CONFLICT:
      return {
        ...state,
        editConflictModal: action.payload,
      };
    case EDIT_CONFLICT_DISMISSED:
      return {
        ...state,
        editConflictModal: null,
      };
    case CATEGORIES_LOADED:
      return {
        ...state,
        allCategories: action.payload,
      };
    default:
      return state;
  }
}
