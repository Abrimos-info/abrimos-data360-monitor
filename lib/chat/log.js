'use strict';

function formatError(err) {
  if (!err) return { message: 'unknown error' };
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: err.cause instanceof Error
        ? { name: err.cause.name, message: err.cause.message, stack: err.cause.stack }
        : err.cause,
      code: err.code,
    };
  }
  return { message: String(err) };
}

function logChat(scope, message, err, extra) {
  const ts = new Date().toISOString();
  console.error(`[chat:${scope}] ${ts} ${message}`);
  if (extra != null) {
    console.error('[chat:context]', typeof extra === 'object' ? JSON.stringify(extra, null, 2) : extra);
  }
  if (err != null) {
    console.error('[chat:error-detail]', JSON.stringify(formatError(err), null, 2));
    if (err instanceof Error && err.stack) {
      console.error(err.stack);
    }
  }
}

module.exports = { logChat, formatError };
