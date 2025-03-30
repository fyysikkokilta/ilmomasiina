/* eslint-disable import/prefer-default-export */

import type { Model } from "sequelize";

// For whatever reason Sequelize doesn't do this automatically.
/** Getter for JSON columns that deserializes non-null values. */
export const jsonColumnGetter = <T>(name: string) =>
  function getJsonColumn(this: Model): T {
    const json = this.getDataValue(name);
    return json === null ? null : JSON.parse(json as unknown as string);
  };
