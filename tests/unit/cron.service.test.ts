import cron from 'node-cron';
import CronService from '../../src/services/cron.service';
import SubscriptionService from '../../src/services/subscription.service';
import logger from '../../src/config/logger';

jest.mock('node-cron');

describe('CronService', () => {
    let cronService: CronService;
    let subscriptionService: SubscriptionService;

    beforeEach(() => {
        subscriptionService = {
            markExpiredSubscriptionsAsInactive: jest
                .fn()
                .mockResolvedValue('Marked as inactive'),
            chargeActiveSubscriptions: jest
                .fn()
                .mockResolvedValue('Charged subscriptions'),
        } as unknown as SubscriptionService;

        jest.spyOn(logger, 'info').mockImplementation(jest.fn());
        jest.spyOn(logger, 'error').mockImplementation(jest.fn());

        cronService = new CronService(subscriptionService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize CronService', () => {
        cronService.startJobs();
        expect(logger.info).toHaveBeenCalledWith('CronService initialized');
    });

    it('should schedule cron jobs when startJobs is called', () => {
        cronService.startJobs();

        expect(logger.info).toHaveBeenCalledWith('Starting cron jobs...');
        expect(cron.schedule).toHaveBeenCalledTimes(2);
        expect(cron.schedule).toHaveBeenCalledWith(
            '0 0 * * *',
            expect.any(Function),
        );
        expect(cron.schedule).toHaveBeenCalledWith(
            '0 2 * * *',
            expect.any(Function),
        );
        expect(logger.info).toHaveBeenCalledWith('Cron jobs initialized');
    });

    it('should call chargeSubscriptions when the 5-second cron job runs', async () => {
        cronService.startJobs();

        const scheduledTask = (cron.schedule as jest.Mock).mock.calls[0][1];
        await scheduledTask();

        expect(
            subscriptionService.chargeActiveSubscriptions,
        ).toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalledWith(
            'Executing chargeSubscriptions',
        );
        expect(logger.info).toHaveBeenCalledWith('Charged subscriptions');
    });

    it('should call markExpiredSubsAsInactive when the 7-second cron job runs', async () => {
        cronService.startJobs();

        const scheduledTask = (cron.schedule as jest.Mock).mock.calls[1][1];
        await scheduledTask();

        expect(
            subscriptionService.markExpiredSubscriptionsAsInactive,
        ).toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalledWith(
            'Executing markExpiredSubsAsInactive',
        );
        expect(logger.info).toHaveBeenCalledWith('Marked as inactive');
    });
});
