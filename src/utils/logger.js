
const IS_DEVELOPMENT = true;

export const logger = {
  info(message, data = null) {
    if (!IS_DEVELOPMENT) return;

    console.info(`[INFO] ${message}`, data ?? "");
  },

  warn(message, data = null) {
    console.warn(`[WARNING] ${message}`, data ?? "");
  },

  error(message, error = null) {
    console.error(`[ERROR] ${message}`, error ?? "");
  },

  debug(message, data = null) {
    if (!IS_DEVELOPMENT) return;

    console.debug(`[DEBUG] ${message}`, data ?? "");
  }
};

export default logger;
