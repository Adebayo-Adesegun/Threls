import cron from 'node-cron';
import logger from '../config/logger';
import SubscriptionService from './subscription.service';

export default class CronService {
    constructor(private readonly subscriptionService: SubscriptionService) {
        logger.info('CronService initialized');
    }

    startJobs() {
        logger.info('Starting cron jobs...');

        cron.schedule('0 0 * * *', async () => {
            logger.info(
                'Midnight cron job running at:',
                new Date().toISOString(),
            );
            await this.markExpiredSubsAsInactive();
        });

        logger.info('Cron jobs initialized');
    }

    private async markExpiredSubsAsInactive() {
        logger.info('Executing markExpiredSubsAsInactive');
        logger.info(
            await this.subscriptionService.markExpiredSubscriptionsAsInactive(),
        );
    }
}
