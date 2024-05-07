import { QueryTypes } from 'sequelize';

import { defineMigration } from './util';

type RawQuestion = {
  id: string;
  type: string;
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
    // Handle different quoting for Postgres & MySQL
    const q = ([name]: TemplateStringsArray) => query.quoteIdentifiers(name);
    // Convert question options to JSON
    const questions = await sequelize.query<RawQuestion>(
      `SELECT ${q`id`}, ${q`type`}, ${q`options`} FROM ${q`question`}`,
      { type: QueryTypes.SELECT, transaction },
    );
    for (const row of questions) {
      let optionsJson = null;
      if (row.type === 'checkbox' || row.type === 'select') {
        optionsJson = row.options ? JSON.stringify(row.options.split(';')) : JSON.stringify(['']);
        // If the options are too long, store an empty array
        // otherwise they won't fit in the column and the migration will fail
        // This is a rather quick and dirty way to handle this, but it's good enough for now
        if (optionsJson.length > 255) {
          optionsJson = JSON.stringify([]);
        }
      }
      await query.bulkUpdate(
        'question',
        { options: optionsJson },
        { id: row.id },
        { transaction },
      );
    }
    // Convert answers to JSON
    const answers = await sequelize.query<RawAnswer>(
      `SELECT ${q`answer.id`}, ${q`answer.answer`}, ${q`question.type`} `
      + `FROM ${q`answer`} `
      + `LEFT JOIN ${q`question`} ON ${q`answer.questionId`} = ${q`question.id`}`,
      { type: QueryTypes.SELECT, transaction },
    );
    for (const row of answers) {
      // Non-checkbox question -> "entire answer"
      // Non-empty answer to checkbox question -> ["ans1", "ans2"]
      // Empty answer to checkbox question -> []
      const answer = row.type === 'checkbox' ? row.answer.split(';').filter(Boolean) : row.answer;
      let answerJson = JSON.stringify(answer);
      // If the answer is too long, store an empty array
      // otherwise it won't fit in the column and the migration will fail
      // This is a rather quick and dirty way to handle this, but it's good enough for now
      if (answerJson.length > 255) {
        answerJson = JSON.stringify([]);
      }
      await query.bulkUpdate(
        'answer',
        { answer: answerJson },
        { id: row.id },
        { transaction },
      );
    }
  },
});
