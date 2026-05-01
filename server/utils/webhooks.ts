import { useDb } from './db';

/**
 * Triggers configured webhooks for a specific developer.
 * @param developerId The username of the developer who owns the webhook
 * @param event The event name (e.g. 'face.identified', 'user.registered')
 * @param payload The data to send in the webhook body
 */
export const triggerWebhook = async (developerId: string, event: string, payload: any) => {
  const db = useDb();
  
  try {
    const [rows] = await db.execute(
      'SELECT url, events FROM webhooks WHERE user_id = ? AND is_active = 1',
      [developerId]
    );
    
    const webhooks = rows as any[];
    
    for (const webhook of webhooks) {
      let subscribedEvents: string[] = [];
      try {
        subscribedEvents = typeof webhook.events === 'string' ? JSON.parse(webhook.events) : webhook.events;
      } catch (e) {
        console.error('Failed to parse webhook events:', e);
        continue;
      }

      if (Array.isArray(subscribedEvents) && subscribedEvents.includes(event)) {
        console.log(`Triggering webhook: ${event} -> ${webhook.url}`);
        
        // fire and forget
        fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Luface-Event': event,
            'User-Agent': 'Luface-Webhook-Service/1.0'
          },
          body: JSON.stringify({
            event,
            timestamp: new Date().toISOString(),
            data: payload
          })
        }).catch(err => {
          console.error(`Webhook POST failed for ${webhook.url}:`, err.message);
        });
      }
    }
  } catch (e) {
    console.error('Error in triggerWebhook:', e);
  }
};
