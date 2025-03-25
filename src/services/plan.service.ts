import Plan from '../models/plan.model';

export default class PlanService {
    async createPlan(
        planData: Partial<Record<string, any>>,
    ): Promise<InstanceType<typeof Plan>> {
        const existingPlan = await Plan.findOne({ name: planData.name });
        if (existingPlan) {
            throw new Error('A plan with this name already exists.');
        }
        const createPlan = await Plan.create(planData);
        return createPlan;
    }

    async getAllPlans(): Promise<InstanceType<typeof Plan>[]> {
        const plans = await Plan.find();
        return plans;
    }
}
