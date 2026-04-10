/**
 * Production এ অবশ্যই JWT_SECRET সেট করুন। ডেভেলপমেন্টে খালি থাকলে ফিক্সড ফলব্যাক ব্যবহার হয়
 * যাতে লগইন কাজ করে; প্রোডে ফলব্যাক নেই।
 */
export function getJwtSecret() {
  const fromEnv = process.env.JWT_SECRET?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") {
    return null;
  }
  return "cartnexus-dev-jwt-secret-do-not-use-in-production";
}
