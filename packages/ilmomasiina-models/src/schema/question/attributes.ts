import { Type } from "@sinclair/typebox";

import { QuestionType } from "../../enum";
import { Nullable } from "../utils";

export const questionID = Type.String({
  title: "QuestionID",
  description: "Question ID. Randomly generated alphanumeric string.",
});

/** Non-editable identity attributes of a question. */
export const questionIdentity = Type.Object({
  id: questionID,
});

/** Editable attributes of a question. */
export const questionAttributes = Type.Object({
  question: Type.String({
    description: "The question shown to attendees.",
    minLength: 1,
    maxLength: 255,
  }),
  type: Type.Enum(QuestionType, {
    title: "QuestionType",
    description: "The type of answer expected.",
  }),
  options: Nullable(
    Type.Array(
      Type.String({ maxLength: 255 }),
      // This was a practical limit before an explicit limitation was added, so seems reasonable to set it here.
      { maxItems: 64 },
    ),
    {
      description: "For select or checkbox questions, the options available.",
    },
  ),
  required: Type.Boolean({
    description: "Whether to require an answer to this question from all attendees.",
  }),
  public: Type.Boolean({
    description: "Whether to show the answers to this question publicly.",
  }),
});
