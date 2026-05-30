'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadMarkdown(sandbox) {
  const markedCode = fs.readFileSync(require('node:path').join(__dirname, '../static/vendor/marked.min.js'), 'utf8');
  const mdCode = fs.readFileSync(require('node:path').join(__dirname, '../static/js/markdown.js'), 'utf8');
  vm.runInNewContext(markedCode, sandbox);
  vm.runInNewContext(mdCode, sandbox);
  return sandbox.D360Markdown;
}

describe('hypothesis markers', () => {
  it('renderHypothesisMarkdown handles English block and tag', () => {
    const sandbox = { D360_LANG: 'en', document: { createElement: () => ({ innerHTML: '', querySelectorAll: () => [] }) } };
    const md = loadMarkdown(sandbox);
    const block = md.renderHypothesisMarkdown('[HYPOTHESIS] Remote auth lowers friction.');
    assert.match(block, /d360-hypothesis/);
    assert.match(block, /Hypothesis/);
    assert.match(block, /Remote auth lowers friction/);

    const tag = md.renderHypothesisMarkdown('Costs may fall [HYPOTHESIS].');
    assert.match(tag, /d360-hypothesis/);
    assert.match(tag, /Hypothesis/);
    assert.doesNotMatch(tag, /\[HYPOTHESIS\]/);
  });

  it('renderMarkdown renders hypothesis inside article prose', () => {
    const sandbox = { D360_LANG: 'en', document: { createElement: () => ({ innerHTML: '', querySelectorAll: () => [] }) } };
    const md = loadMarkdown(sandbox);
    const html = md.renderMarkdown('Policy may help [HYPOTHESIS].');
    assert.match(html, /d360-hypothesis/);
    assert.doesNotMatch(html, /\[HYPOTHESIS\]/);
  });
});
