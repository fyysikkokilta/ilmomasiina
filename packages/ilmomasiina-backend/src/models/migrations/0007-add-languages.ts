import { DataTypes } from "sequelize";

import { defineMigration } from "./util";

export default defineMigration({
  name: "0007-add-languages",
  async up({ context: { sequelize, transaction } }) {
    const query = sequelize.getQueryInterface();
    await query.addColumn(
      "event",
      "languages",
      {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
      },
      { transaction },
    );
    // Sequelize MySQL doesn't initialize default values for JSON columns.
    await query.bulkUpdate("event", { languages: "{}" }, {}, { transaction });
    await query.addColumn(
      "event",
      "defaultLanguage",
      {
        type: DataTypes.STRING(8),
        allowNull: true,
      },
      { transaction },
    );
    await query.addColumn(
      "quota",
      "languages",
      {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
      },
      { transaction },
    );
    await query.bulkUpdate("quota", { languages: "{}" }, {}, { transaction });
    await query.addColumn(
      "question",
      "languages",
      {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
      },
      { transaction },
    );
    await query.bulkUpdate("question", { languages: "{}" }, {}, { transaction });
  },
  async down({ context: { sequelize, transaction } }) {
    const query = sequelize.getQueryInterface();
    await query.removeColumn("event", "languages", { transaction });
    await query.removeColumn("event", "defaultLanguage", { transaction });
    await query.removeColumn("quota", "languages", { transaction });
    await query.removeColumn("question", "languages", { transaction });
  },
});
