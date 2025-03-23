import logger from '../config/logger';
import Plan from '../models/plan.model';

export default class PlanService {
    async createPlan(
        planData: Partial<Record<string, any>>,
    ): Promise<InstanceType<typeof Plan>> {
        try {
            const existingPlan = await Plan.findOne({ name: planData.name });
            if (existingPlan) {
                throw new Error('A plan with this name already exists.');
            }

            return await Plan.create(planData);
        } catch (error: unknown) {
            logger.error(error);
            throw new Error(
                error instanceof Error ? error.message : 'Error creating plan',
            );
        }
    }

    async getAllPlans(): Promise<InstanceType<typeof Plan>[]> {
        try {
            return await Plan.find();
        } catch (error: unknown) {
            logger.error(error);
            if (error instanceof Error) {
                throw new Error(`Error fetching plans: ${error.message}`);
            } else {
                throw new Error('Error fetching plans');
            }
        }
    }
}
