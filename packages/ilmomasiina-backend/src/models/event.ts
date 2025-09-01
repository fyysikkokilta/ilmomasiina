import moment from "moment";
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
  Model,
  Op,
  Optional,
  Sequelize,
} from "sequelize";

import type { EventAttributes, EventLanguage } from "@tietokilta/ilmomasiina-models/dist/models";
import config from "../config";
import type { Question } from "./question";
import type { Quota } from "./quota";
import { generateRandomId, RANDOM_ID_LENGTH } from "./randomId";
import { jsonColumnGetter } from "./util/json";

// Drop updatedAt so we don't need to define it manually in Event.init()
interface EventManualAttributes extends Omit<EventAttributes, "updatedAt"> {}

export interface EventCreationAttributes
  extends Optional<
    EventManualAttributes,
    | "id"
    | "openQuotaSize"
    | "description"
    | "price"
    | "location"
    | "facebookUrl"
    | "webpageUrl"
    | "category"
    | "draft"
    | "listed"
    | "signupsPublic"
    | "nameQuestion"
    | "emailQuestion"
    | "verificationEmail"
    | "languages"
    | "defaultLanguage"
  > {}

export class Event extends Model<EventManualAttributes, EventCreationAttributes> implements EventAttributes {
  public id!: string;
  public title!: string;
  public slug!: string;
  public date!: Date | null;
  public endDate!: Date | null;
  public registrationStartDate!: Date | null;
  public registrationEndDate!: Date | null;
  public openQuotaSize!: number;
  public description!: string | null;
  public price!: string | null;
  public location!: string | null;
  public facebookUrl!: string | null;
  public webpageUrl!: string | null;
  public category!: string;
  public draft!: boolean;
  public listed!: boolean;
  public signupsPublic!: boolean;
  public nameQuestion!: boolean;
  public emailQuestion!: boolean;
  public verificationEmail!: string | null;
  public languages!: Record<string, EventLanguage>;
  public defaultLanguage!: string;

  public questions?: Question[];
  public getQuestions!: HasManyGetAssociationsMixin<Question>;
  public countQuestions!: HasManyCountAssociationsMixin;
  public hasQuestion!: HasManyHasAssociationMixin<Question, Question["id"]>;
  public hasQuestions!: HasManyHasAssociationsMixin<Question, Question["id"]>;
  public setQuestions!: HasManySetAssociationsMixin<Question, Question["id"]>;
  public addQuestion!: HasManyAddAssociationMixin<Question, Question["id"]>;
  public addQuestions!: HasManyAddAssociationsMixin<Question, Question["id"]>;
  public removeQuestion!: HasManyRemoveAssociationMixin<Question, Question["id"]>;
  public removeQuestions!: HasManyRemoveAssociationsMixin<Question, Question["id"]>;
  public createQuestion!: HasManyCreateAssociationMixin<Question>;

  public quotas?: Quota[];
  public getQuotas!: HasManyGetAssociationsMixin<Quota>;
  public countQuotas!: HasManyCountAssociationsMixin;
  public hasQuota!: HasManyHasAssociationMixin<Quota, Quota["id"]>;
  public hasQuotas!: HasManyHasAssociationsMixin<Quota, Quota["id"]>;
  public setQuotas!: HasManySetAssociationsMixin<Quota, Quota["id"]>;
  public addQuota!: HasManyAddAssociationMixin<Quota, Quota["id"]>;
  public addQuotas!: HasManyAddAssociationsMixin<Quota, Quota["id"]>;
  public removeQuota!: HasManyRemoveAssociationMixin<Quota, Quota["id"]>;
  public removeQuotas!: HasManyRemoveAssociationsMixin<Quota, Quota["id"]>;
  public createQuota!: HasManyCreateAssociationMixin<Quota>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /** Determines the effective end date of the event, matching the scope logic. */
  public get effectiveEndDate() {
    const endDates = [this.endDate, this.date, this.registrationEndDate]
      .filter((date): date is Date => date != null)
      .map((date) => date.getTime());
    if (!endDates.length) return null;
    return endDates.reduce((lhs, rhs) => Math.max(lhs, rhs));
  }
}

export default function setupEventModel(sequelize: Sequelize) {
  Event.init(
    {
      id: {
        type: DataTypes.CHAR(RANDOM_ID_LENGTH),
        primaryKey: true,
        defaultValue: generateRandomId,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          is: /^[A-Za-z0-9_-]+$/,
        },
      },
      date: {
        type: DataTypes.DATE,
      },
      endDate: {
        type: DataTypes.DATE,
      },
      registrationStartDate: {
        type: DataTypes.DATE,
      },
      registrationEndDate: {
        type: DataTypes.DATE,
      },
      openQuotaSize: {
        type: DataTypes.INTEGER,
        validate: {
          min: 0,
        },
        defaultValue: 0,
      },
      description: {
        type: DataTypes.TEXT,
      },
      price: {
        type: DataTypes.STRING,
      },
      location: {
        type: DataTypes.STRING,
      },
      facebookUrl: {
        type: DataTypes.STRING,
      },
      webpageUrl: {
        type: DataTypes.STRING,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
      },
      draft: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      listed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      signupsPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      nameQuestion: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      emailQuestion: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      verificationEmail: {
        type: DataTypes.TEXT,
      },
      languages: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
        get: jsonColumnGetter<Record<string, EventLanguage>>("languages"),
      },
      defaultLanguage: {
        type: DataTypes.STRING(8),
        allowNull: false,
        // The default value used for this depends on config, so we can't set it in the database easily.
        get(): string {
          return this.getDataValue("defaultLanguage") ?? config.defaultLanguage;
        },
      },
    },
    {
      sequelize,
      modelName: "event",
      freezeTableName: true,
      paranoid: true,
      validate: {
        hasDateOrRegistration() {
          if (this.date === null && this.registrationStartDate === null) {
            throw new Error("either date or registrationStartDate/registrationEndDate must be set");
          }
          if (this.date === null && this.endDate !== null) {
            throw new Error("endDate may only be set with date");
          }
          if ((this.registrationStartDate === null) !== (this.registrationEndDate === null)) {
            throw new Error("only neither or both of registrationStartDate and registrationEndDate may be set");
          }
        },
      },
      scopes: {
        // users can see events that:
        user: () => ({
          where: [
            // are not drafts,
            { draft: false },
            {
              // and either:
              [Op.or]: {
                // closed recently enough
                registrationEndDate: {
                  [Op.gt]: moment().subtract(config.hideEventAfterDays, "days").toDate(),
                },
                // or happened recently enough
                date: {
                  [Op.gt]: moment().subtract(config.hideEventAfterDays, "days").toDate(),
                },
                endDate: {
                  [Op.gt]: moment().subtract(config.hideEventAfterDays, "days").toDate(),
                },
              },
            },
          ],
        }),
      },
      hooks: {
        // Events use paranoid mode, so we need to change the slug when deleting
        // to avoid the slug being reserved after deletion.
        async beforeDestroy(instance, options) {
          await instance.update(
            {
              slug: `${instance.slug.substring(0, 100)}-deleted-${Date.now()}`,
            },
            { transaction: options.transaction },
          );
        },
      },
    },
  );

  return Event;
}
