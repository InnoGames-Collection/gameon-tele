import { env } from '../config/env.js';

export const SpService = {
  async sendMt(params: { msisdn: string; message: string; type: 'otp' | 'optin' | 'optout' | 'business' }) {
    if (env.NODE_ENV === 'development' || env.SP_GATEWAY_URL.includes('localhost')) {
      console.log(`[GameOn SP MT Echo] To: ${params.msisdn} | Type: ${params.type} | Message: "${params.message}"`);
      return { success: true };
    }

    try {
      const response = await fetch(`${env.SP_GATEWAY_URL}/api/v1/mt/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': env.SP_API_KEY,
        },
        body: JSON.stringify({
          serviceId: env.SP_SERVICE_ID,
          msisdn: params.msisdn,
          message: params.message,
          type: params.type,
          extTransactionId: `tx_${Date.now()}`,
          callbackUrl: `https://gameon-api.${env.DOMAIN}/api/v1/webhooks/dlr`,
        }),
      });

      return { success: response.ok };
    } catch (err: any) {
      console.error('[GameOn SP Error] Failed to send MT:', err);
      return { success: false, error: err.message };
    }
  },
};
