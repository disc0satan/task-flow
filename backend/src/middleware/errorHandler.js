import { HttpError } from '../utils/httpError.js';

// Every error leaves the API in one shape: { error: { message, details? } }
export function notFoundHandler(req, res) {
  res.status(404).json({ error: { message: 'Route not found.' } });
}

// Express recognises error handlers by their four-argument signature.
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof HttpError) {
    return res
      .status(err.status)
      .json({ error: { message: err.message, details: err.details } });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Request body is not valid JSON.' } });
  }

  console.error(err);
  return res.status(500).json({ error: { message: 'Internal server error.' } });
}
