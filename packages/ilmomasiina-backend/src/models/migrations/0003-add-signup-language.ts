import { DataTypes, Sequelize } from 'sequelize';
import { RunnableMigration } from 'umzug';

const migration: RunnableMigration<Sequelize> = {
  name: '0003-add-signup-language',
  async up({ context: sequelize }) {
    const query = sequelize.getQueryInterface();
    await query.addColumn(
      'signup',
      'language',
      {
        type: DataTypes.STRING(8),
        allowNull: true,
      },
    );
  },
};

export default migration;
