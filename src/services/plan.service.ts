import { PlanResponse } from '../interfaces/plan/plan.interface';
import Plan from '../models/plan.model';

export default class PlanService {
    async createPlan(
        planData: Partial<Record<string, any>>,
    ): Promise<PlanResponse> {
        const existingPlan = await Plan.findOne({ name: planData.name }).lean();
        if (existingPlan) {
            throw new Error('A plan with this name already exists.');
        }
        const createPlan = await Plan.create(planData);
        return createPlan.toObject();
    }

    async getAllPlans(): Promise<PlanResponse[]> {
        const plans = await Plan.find().lean();
        return plans;
    }
}
