import Plan from '../models/plan.model';

export default class PlanService {
    async createPlan(
        planData: Partial<Record<string, any>>,
    ): Promise<InstanceType<typeof Plan>> {
        try {
            return await Plan.create(planData);
        } catch (error: any) {
            throw new Error(`Error creating plan: ${error.message}`);
        }
    }
}
