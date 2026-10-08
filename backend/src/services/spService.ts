import { env } from '../config/env.js';

export interface SendMtParams {
  msisdn: string;
  message: string;
  type: 'otp' | 'optin' | 'optout' | 'business';
  extTransactionId?: string;
}

export const SpService = {
  /**
   * Outbound MT SMS with exponential backoff retries and idempotent transaction keys.
   */
  async sendMt(params: SendMtParams, maxRetries: number = 3): Promise<{ success: boolean; error?: string; attempts: number }> {
    const txId = params.extTransactionId || `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    if (env.NODE_ENV === 'development' || env.SP_GATEWAY_URL.includes('localhost')) {
      console.log(`[GameOn SP MT Echo] Tx: ${txId} | To: ${params.msisdn} | Type: ${params.type} | Message: "${params.message}"`);
      return { success: true, attempts: 1 };
    }

    let attempt = 0;
    let lastError: string | undefined;

    while (attempt < maxRetries) {
      attempt++;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000); // 6s network timeout

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
            extTransactionId: txId,
            callbackUrl: `https://gameon-api.${env.DOMAIN}/api/v1/webhooks/dlr`,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.ok) {
          return { success: true, attempts: attempt };
        }

        const errText = await response.text().catch(() => '');
        lastError = `HTTP ${response.status}: ${errText}`;
      } catch (err: any) {
        lastError = err.name === 'AbortError' ? 'Network timeout after 6s' : err.message;
      }

      // If not last attempt, wait with exponential backoff (e.g. 300ms, 900ms)
      if (attempt < maxRetries) {
        const backoffMs = Math.pow(3, attempt) * 100 + Math.floor(Math.random() * 100);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }

    console.error(`[GameOn SP Error] Failed to send MT to ${params.msisdn} after ${attempt} attempts: ${lastError}`);
    return { success: false, error: lastError, attempts: attempt };
  },
};
