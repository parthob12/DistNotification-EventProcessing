export async function sendEmail(event) {
  return {
    skipped: true,
    reason: "email_provider_not_enabled",
    channel: "email"
  };
}
