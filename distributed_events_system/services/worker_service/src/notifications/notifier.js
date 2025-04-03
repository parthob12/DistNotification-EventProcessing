import { sendWebhook } from "./providers/webhook_provider.js";
import { sendEmail } from "./providers/email_provider.js";

export async function notify(event) {
  const webhookResult = await sendWebhook(event);

  if (webhookResult && webhookResult.delivered) {
    return webhookResult;
  }

  return sendEmail(event);
}
