import { defineMigration } from './util';

export default defineMigration({
  name: '0005-add-indexes',
  async up({ context: { sequelize } }) {
    const query = sequelize.getQueryInterface();
    await query.addIndex(
      'quota',
      {
        name: 'idx_quota_main',
        fields: ['eventId', 'deletedAt'],
      },
    );
    await query.addIndex(
      'signup',
      {
        name: 'idx_signup_main',
        fields: ['quotaId', 'deletedAt', 'confirmedAt', 'createdAt'],
      },
    );
    await query.addIndex(
      'answer',
      {
        name: 'idx_answer_main',
        fields: ['signupId', 'questionId', 'deletedAt'],
      },
    );
  },
  async down({ context: { sequelize } }) {
    const query = sequelize.getQueryInterface();
    await query.removeIndex('quota', 'idx_quota_main');
    await query.removeIndex('signup', 'idx_signup_main');
    await query.removeIndex('answer', 'idx_answer_main');
  },
});
