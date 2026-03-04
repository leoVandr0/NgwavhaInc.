export const EMOJI = {
 notifications: '🔔',
  login: '🔑',
  signup: '✨',
  courses: '📚',
  explore: '🚀',
  profile: '👤',
  dashboard: '🗺️',
  warning: '⚠️',
  success: '✅',
  info: 'ℹ️',
  search: '🔎',
  book: '📖',
  message: '💬',
  calendar: '📅',
  privacy: '🔒',
  admin: '🛡️',
  rocket: '🚀',
  star: '⭐'
};
export const emojiFor = (key) => EMOJI[key] ?? '🔹';
