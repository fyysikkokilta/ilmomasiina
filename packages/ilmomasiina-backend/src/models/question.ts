import {
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManySetAssociationsMixin,
  HasOneCreateAssociationMixin,
  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin,
  Model,
  Optional,
  Sequelize,
} from "sequelize";

import { QuestionType } from "@tietokilta/ilmomasiina-models";
import type { QuestionAttributes, QuestionLanguage } from "@tietokilta/ilmomasiina-models/dist/models";
import type { Answer } from "./answer";
import type { Event } from "./event";
import { generateRandomId, RANDOM_ID_LENGTH } from "./randomId";
import { jsonColumnGetter } from "./util/json";

export interface QuestionCreationAttributes
  extends Optional<QuestionAttributes, "id" | "options" | "required" | "public"> {}

export class Question extends Model<QuestionAttributes, QuestionCreationAttributes> implements QuestionAttributes {
  public id!: string;
  public order!: number;
  public question!: string;
  public type!: QuestionType;
  public options!: string[] | null;
  public required!: boolean;
  public public!: boolean;
  public languages!: Record<string, QuestionLanguage>;

  public eventId!: Event["id"];
  public event?: Event;
  public getEvent!: HasOneGetAssociationMixin<Event>;
  public setEvent!: HasOneSetAssociationMixin<Event, Event["id"]>;
  public createEvent!: HasOneCreateAssociationMixin<Event>;

  public answers?: Answer[];
  public getAnswers!: HasManyGetAssociationsMixin<Answer>;
  public countAnswers!: HasManyCountAssociationsMixin;
  public hasAnswer!: HasManyHasAssociationMixin<Answer, Answer["id"]>;
  public hasAnswers!: HasManyHasAssociationsMixin<Answer, Answer["id"]>;
  public setAnswers!: HasManySetAssociationsMixin<Answer, Answer["id"]>;
  public addAnswer!: HasManyAddAssociationMixin<Answer, Answer["id"]>;
  public addAnswers!: HasManyAddAssociationsMixin<Answer, Answer["id"]>;
  public removeAnswer!: HasManyRemoveAssociationMixin<Answer, Answer["id"]>;
  public removeAnswers!: HasManyRemoveAssociationsMixin<Answer, Answer["id"]>;
  public createAnswer!: HasManyCreateAssociationMixin<Answer>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function setupQuestionModel(sequelize: Sequelize) {
  Question.init(
    {
      id: {
        type: DataTypes.CHAR(RANDOM_ID_LENGTH),
        primaryKey: true,
        defaultValue: generateRandomId,
      },
      eventId: {
        type: DataTypes.CHAR(RANDOM_ID_LENGTH),
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      question: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      type: {
        type: DataTypes.ENUM(...Object.values(QuestionType)),
        allowNull: false,
      },
      options: {
        type: DataTypes.JSON,
        allowNull: true,
        get: jsonColumnGetter<string[]>("options"),
      },
      required: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      public: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      languages: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
        get: jsonColumnGetter<Record<string, QuestionLanguage>>("languages"),
      },
    },
    {
      sequelize,
      modelName: "question",
      freezeTableName: true,
      paranoid: true,
    },
  );

  return Question;
}
