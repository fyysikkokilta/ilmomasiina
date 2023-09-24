import { DataTypes } from 'sequelize';

import { defineMigration } from './util';

export default defineMigration({
  name: '0003-add-signup-language',
  async up({ context: { sequelize, transaction } }) {
    const query = sequelize.getQueryInterface();
    await query.addColumn(
      'signup',
      'language',
      {
        type: DataTypes.STRING(8),
        allowNull: true,
      },
      { transaction },
    );
  },
});
