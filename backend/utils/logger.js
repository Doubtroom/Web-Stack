import pino from "pino";

// Structured JSON logging. Unlike console.log strings, every line is a
// queryable object ({level, time, msg, ...context}) that log platforms can
// filter and aggregate. Silent under test so suites stay readable.
const logger = pino({
  level:
    process.env.NODE_ENV === "test"
      ? "silent"
      : process.env.LOG_LEVEL || "info",
});

export default logger;
