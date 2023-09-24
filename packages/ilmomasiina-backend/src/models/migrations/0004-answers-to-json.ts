import { QueryTypes } from 'sequelize';

import { defineMigration } from './util';

type RawQuestion = {
  id: string;
  options: string;
};

type RawAnswer = {
  id: string;
  answer: string;
  type: string;
};

/* eslint-disable no-await-in-loop */

export default defineMigration({
  name: '0004-answers-to-json',
  async up({ context: { sequelize, transaction } }) {
    const query = sequelize.getQueryInterface();
    // Convert question options to JSON
    const questions = await sequelize.query<RawQuestion>(
      'SELECT `id`, `options` FROM `question`',
      { type: QueryTypes.SELECT, transaction },
    );
    for (const row of questions) {
      const optionsJson = row.options ? JSON.stringify(row.options.split(';')) : null;
      await query.bulkUpdate(
        'question',
        { options: optionsJson },
        { id: row.id },
        { transaction },
      );
    }
    // Convert answers to JSON
    const answers = await sequelize.query<RawAnswer>(
      'SELECT `answer`.`id`, `answer`.`answer`, `question`.`type` '
      + 'FROM `answer` '
      + 'LEFT JOIN `question` ON `answer`.`questionId` = `question`.`id`',
      { type: QueryTypes.SELECT, transaction },
    );
    for (const row of answers) {
      // Non-checkbox question -> "entire answer"
      // Non-empty answer to checkbox question -> ["ans1", "ans2"]
      // Empty answer to checkbox question -> []
      const answer = row.type === 'checkbox' ? row.answer.split(';').filter(Boolean) : row.answer;
      const answerJson = JSON.stringify(answer);
      await query.bulkUpdate(
        'answer',
        { answer: answerJson },
        { id: row.id },
        { transaction },
      );
    }
  },
});
