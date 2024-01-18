import { DataTypes } from 'sequelize';

import { defineMigration } from './util';

export default defineMigration({
  name: '0002-add-event-endDate',
  async up({ context: { sequelize, transaction } }) {
    const query = sequelize.getQueryInterface();
    await query.addColumn(
      'event',
      'endDate',
      {
        type: DataTypes.DATE,
      },
      { transaction },
    );
  },
});
