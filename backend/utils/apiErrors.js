const RATE_LIMIT_MESSAGE = "API Rate limit hit (since this is a free API)";
const NO_MATCH_MESSAGE = "Failed to fetch recipes matching these requirements";

function isRateLimitError(error) {
  return error?.response?.status === 429 || error?.statusCode === 429;
}

function wrapForkifyError(error) {
  if (isRateLimitError(error)) {
    return Object.assign(new Error(RATE_LIMIT_MESSAGE), { statusCode: 429 });
  }
  return error;
}

function noMatchError() {
  return Object.assign(new Error(NO_MATCH_MESSAGE), { statusCode: 404 });
}

module.exports = {
  RATE_LIMIT_MESSAGE,
  NO_MATCH_MESSAGE,
  isRateLimitError,
  wrapForkifyError,
  noMatchError,
};
