import type { ApiError } from "@tietokilta/ilmomasiina-components";
import type {
  AdminEventResponse,
  CheckSlugResponse,
  EditConflictError,
  EventUpdateBody,
  QuestionID,
  QuestionUpdate,
  QuotaID,
  QuotaUpdate,
} from "@tietokilta/ilmomasiina-models";
import type { EditorEventType } from "./actions";

export interface EditorState {
  event: AdminEventResponse | null;
  isNew: boolean;
  loadError?: ApiError;
  slugAvailability: null | "checking" | CheckSlugResponse;
  allCategories: null | string[];
  moveToQueueModal: { count: number } | null;
  editConflictModal: EditConflictError | null;
}

/** Question type for event editor */
export interface EditorQuestion extends Omit<QuestionUpdate, "options"> {
  key: QuestionID;
  options: string[];
}

/** Quota type for event editor */
export type EditorQuota = QuotaUpdate & {
  key: QuotaID;
};

/** Root form data type for event editor */
export interface EditorEvent
  extends Omit<
      Required<EventUpdateBody>,
      // Omit fields we'll overwrite for editing states that aren't valid in the API
      | "quotas"
      | "questions"
      | "date"
      | "endDate"
      | "registrationStartDate"
      | "registrationEndDate"
      | "openQuotaSize"
      // Omit fields we want to keep optional
      | "moveSignupsToQueue"
    >,
    // Add optional fields
    Pick<EventUpdateBody, "moveSignupsToQueue"> {
  eventType: EditorEventType;

  date: Date | null;
  endDate: Date | null;

  questions: EditorQuestion[];

  registrationStartDate: Date | null;
  registrationEndDate: Date | null;
  quotas: EditorQuota[];
  useOpenQuota: boolean;
  openQuotaSize: number | null;
}

/** Stricter version of EventUpdateBody with fields we guarantee to return from `editorEventToServer`. */
export type ConvertedEditorEvent = Omit<Required<EventUpdateBody>, "moveSignupsToQueue">;

export type { EditorActions } from "./actions";
export { EditorEventType } from "./actions";
