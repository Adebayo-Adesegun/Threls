import axios, { AxiosError } from 'axios';
import logger from '../config/logger';

export default class WebhookService {
    private eventHandlers: Record<
        string,
        (payload: Record<string, unknown>) => void
    >;

    constructor() {
        this.eventHandlers = {
            subscription_success: this.handleSubscriptionSuccess,
            transaction_success: this.handleTransactionSuccess,
            subscription_cancelled: this.handleSubscriptionCancelled,
        };
    }

    async sendWebhook(
        url: string,
        payload: Record<string, unknown>,
        event: string,
    ): Promise<void> {
        try {
            logger.info(`Processing event: ${event}`);

            // Call the appropriate event handler if it exists
            if (this.eventHandlers[event]) {
                this.eventHandlers[event](payload);
            }

            const response = await axios.post(
                url,
                { event, payload },
                { headers: { 'Content-Type': 'application/json' } },
            );

            logger.info(`Webhook sent successfully: ${response.status}`);
        } catch (error) {
            const errorMessage =
                (error as AxiosError)?.response?.data || (error as Error).message;
            logger.error(`Error sending webhook: ${errorMessage}`);
        }
    }

    private handleSubscriptionSuccess(payload: Record<string, unknown>) {
        logger.info('Handling subscription success:', payload);
    }

    private handleTransactionSuccess(payload: Record<string, unknown>) {
        logger.info('Handling transaction success:', payload);
    }

    private handleSubscriptionCancelled(payload: Record<string, unknown>) {
        logger.info('Handling subscription cancellation:', payload);
    }
}
