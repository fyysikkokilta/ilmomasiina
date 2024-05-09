import moment from 'moment';
import {
  DataTypes, HasManyAddAssociationMixin, HasManyAddAssociationsMixin, HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin, HasManyGetAssociationsMixin, HasManyHasAssociationMixin, HasManyHasAssociationsMixin,
  HasManyRemoveAssociationMixin, HasManyRemoveAssociationsMixin, HasManySetAssociationsMixin,
  HasOneCreateAssociationMixin, HasOneGetAssociationMixin, HasOneSetAssociationMixin,
  Model, Op, Optional, Sequelize,
} from 'sequelize';

import { SignupStatus } from '@tietokilta/ilmomasiina-models';
import type { SignupAttributes } from '@tietokilta/ilmomasiina-models/dist/models';
import type { Answer } from './answer';
import type { Quota } from './quota';
import { generateRandomId, RANDOM_ID_LENGTH } from './randomId';

export interface SignupCreationAttributes
  extends Optional<SignupAttributes, 'id' | 'firstName' | 'lastName' | 'namePublic' | 'email' | 'confirmedAt'
  | 'language' | 'status' | 'position' | 'createdAt'> {}

export class Signup extends Model<SignupAttributes, SignupCreationAttributes> implements SignupAttributes {
  public id!: string;
  public firstName!: string | null;
  public lastName!: string | null;
  public namePublic!: boolean;
  public email!: string | null;
  public language!: string | null;
  public confirmedAt!: Date | null;
  public status!: SignupStatus | null;
  public position!: number | null;

  public quotaId!: Quota['id'];
  public quota?: Quota;
  public getQuota!: HasOneGetAssociationMixin<Quota>;
  public setQuota!: HasOneSetAssociationMixin<Quota, Quota['id']>;
  public createQuota!: HasOneCreateAssociationMixin<Quota>;

  public answers?: Answer[];
  public getAnswers!: HasManyGetAssociationsMixin<Answer>;
  public countAnswers!: HasManyCountAssociationsMixin;
  public hasAnswer!: HasManyHasAssociationMixin<Answer, Answer['id']>;
  public hasAnswers!: HasManyHasAssociationsMixin<Answer, Answer['id']>;
  public setAnswers!: HasManySetAssociationsMixin<Answer, Answer['id']>;
  public addAnswer!: HasManyAddAssociationMixin<Answer, Answer['id']>;
  public addAnswers!: HasManyAddAssociationsMixin<Answer, Answer['id']>;
  public removeAnswer!: HasManyRemoveAssociationMixin<Answer, Answer['id']>;
  public removeAnswers!: HasManyRemoveAssociationsMixin<Answer, Answer['id']>;
  public createAnswer!: HasManyCreateAssociationMixin<Answer>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function setupSignupModel(sequelize: Sequelize) {
  Signup.init(
    {
      id: {
        type: DataTypes.CHAR(RANDOM_ID_LENGTH),
        primaryKey: true,
        defaultValue: generateRandomId,
      },
      quotaId: {
        type: DataTypes.CHAR(RANDOM_ID_LENGTH),
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true,
        },
      },
      lastName: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true,
        },
      },
      namePublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true,
        },
      },
      language: {
        type: DataTypes.STRING(8), // allow for language variants
        validate: {
          notEmpty: true,
        },
      },
      confirmedAt: {
        type: DataTypes.DATE(3),
      },
      status: {
        type: DataTypes.ENUM(...Object.values(SignupStatus)),
      },
      position: {
        type: DataTypes.INTEGER,
      },
      // Add createdAt manually to support milliseconds
      createdAt: {
        type: DataTypes.DATE(3),
        defaultValue: () => new Date(),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'signup',
      freezeTableName: true,
      paranoid: true,
      scopes: {
        active: () => ({
          where: {
            [Op.or]: {
              // Is confirmed
              confirmedAt: {
                [Op.ne]: null, // $means !=
              },
              // Under 30 minutes old
              createdAt: {
                [Op.gt]: moment()
                  .subtract(30, 'minutes')
                  .toDate(),
              },
            },
          },
        }),
      },
    },
  );

  return Signup;
}
