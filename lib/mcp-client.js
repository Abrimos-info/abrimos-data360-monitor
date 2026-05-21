'use strict';

const axios = require('axios');

const DEFAULT_URL = process.env.MCP_URL || 'http://127.0.0.1:8021/mcp';

function parseSseFrames(body) {
  const out = [];
  for (const block of body.split(/\n\n+/)) {
    const line = block.split('\n').find((l) => l.startsWith('data:'));
    if (!line) continue;
    const payload = line.slice(5).trim();
    if (!payload) continue;
    try {
      out.push(JSON.parse(payload));
    } catch (e) {
      // ignore
    }
  }
  return out;
}

async function callMcp(method, params = {}, opts = {}) {
  const url = opts.url || DEFAULT_URL;
  const id = opts.id || Math.floor(Math.random() * 1e9);
  const body = { jsonrpc: '2.0', id, method, params };
  const res = await axios.post(url, body, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    },
    timeout: opts.timeout || 60000,
    responseType: 'text',
    transformResponse: [(d) => d],
  });
  const frames = parseSseFrames(res.data);
  const last = frames[frames.length - 1];
  if (!last) {
    throw new Error('Empty MCP response');
  }
  if (last.error) {
    throw new Error(`MCP error: ${last.error.message || JSON.stringify(last.error)}`);
  }
  return last.result;
}

async function callTool(name, args = {}, opts = {}) {
  const result = await callMcp('tools/call', { name, arguments: args }, opts);
  // content is an array of typed parts; flatten text parts and parse JSON if possible
  const parts = result && result.content ? result.content : [];
  const texts = [];
  for (const part of parts) {
    if (part.type === 'text' && typeof part.text === 'string') {
      texts.push(part.text);
    }
  }
  const joined = texts.join('\n');
  let parsed;
  try {
    parsed = JSON.parse(joined);
  } catch (_) {
    parsed = joined;
  }
  return { raw: result, text: joined, parsed };
}

module.exports = { callMcp, callTool, parseSseFrames };
