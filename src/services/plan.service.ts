import { PlanResponse } from '../interfaces/plan/plan.interface';
import Plan from '../models/plan.model';

export default class PlanService {
    async createPlan(
        planData: Partial<Record<string, any>>,
    ): Promise<PlanResponse> {
        const {
            name,
            description,
            features,
            price,
            currency,
            is_active: isActive,
            billing_cycle: billingCycle,
        } = planData;
        const existingPlan = await Plan.findOne({ name: planData.name }).lean();
        if (existingPlan) {
            throw new Error('A plan with this name already exists.');
        }
        const createPlan = await Plan.create({
            name,
            description,
            features,
            price,
            currency,
            isActive,
            billingCycle,
        });
        return createPlan.toObject();
    }

    async getAllPlans(): Promise<PlanResponse[]> {
        const plans = await Plan.find().lean();
        return plans;
    }

    async updatePlan(
        planId: string,
        updateData: Partial<Record<string, any>>,
    ): Promise<PlanResponse | null> {
        const updatedPlan = await Plan.findByIdAndUpdate(planId, updateData, {
            new: true,
            runValidators: true,
            lean: true,
        });

        if (!updatedPlan) {
            throw new Error('Plan not found.');
        }

        return updatedPlan;
    }
}
