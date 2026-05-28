'use strict';

const fs = require('fs');
const path = require('path');

const PROMPTS_DIR = path.join(__dirname, 'prompts');

function readPrompt(name) {
  return fs.readFileSync(path.join(PROMPTS_DIR, name), 'utf8');
}

function buildNoticiaMessages(context, { esOnly = false } = {}) {
  const system = [
    readPrompt('noticia-system.md'),
    '',
    readPrompt('noticia-template.md'),
  ].join('\n');
  const taskFile = esOnly ? 'noticia-task-es.md' : 'noticia-task.md';
  const user = [
    readPrompt(taskFile),
    '',
    '---',
    '',
    context,
  ].join('\n');
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

function buildReportajePromptParts() {
  return {
    system: readPrompt('reportaje-system.md'),
    task: readPrompt('reportaje-task.md'),
  };
}

module.exports = {
  PROMPTS_DIR,
  readPrompt,
  buildNoticiaMessages,
  buildReportajePromptParts,
};
