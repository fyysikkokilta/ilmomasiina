import {
  DataTypes,
  HasOneCreateAssociationMixin,
  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin,
  Model,
  Optional,
  Sequelize,
} from "sequelize";

import type { AnswerAttributes } from "@tietokilta/ilmomasiina-models/dist/models";
import type { Question } from "./question";
import { RANDOM_ID_LENGTH } from "./randomId";
import { Signup } from "./signup";

export interface AnswerCreationAttributes extends Optional<AnswerAttributes, "id"> {}

export class Answer extends Model<AnswerAttributes, AnswerCreationAttributes> implements AnswerAttributes {
  public id!: string;
  public answer!: string | string[];

  public questionId!: Question["id"];
  public question?: Question;
  public getQuestion!: HasOneGetAssociationMixin<Question>;
  public setQuestion!: HasOneSetAssociationMixin<Question, Question["id"]>;
  public createQuestion!: HasOneCreateAssociationMixin<Question>;

  public signupId!: Signup["id"];
  public signup?: Signup;
  public getSignup!: HasOneGetAssociationMixin<Signup>;
  public setSignup!: HasOneSetAssociationMixin<Signup, Signup["id"]>;
  public createSignup!: HasOneCreateAssociationMixin<Signup>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function setupAnswerModel(sequelize: Sequelize) {
  Answer.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      questionId: {
        type: DataTypes.CHAR(RANDOM_ID_LENGTH),
        allowNull: false,
      },
      signupId: {
        type: DataTypes.CHAR(RANDOM_ID_LENGTH),
        allowNull: false,
      },
      answer: {
        type: DataTypes.JSON,
        allowNull: false,
        get(): string | string[] {
          // For whatever reason Sequelize doesn't do this automatically.
          const json = this.getDataValue("answer");
          return json === null ? null : JSON.parse(json as unknown as string);
        },
      },
    },
    {
      sequelize,
      modelName: "answer",
      freezeTableName: true,
      paranoid: true,
    },
  );

  return Answer;
}
