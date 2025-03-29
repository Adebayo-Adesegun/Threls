import mongoose from 'mongoose';
import { PlanResponse } from '../../src/interfaces/plan/plan.interface';
import Plan from '../../src/models/plan.model';
import Subscription from '../../src/models/subscription.model';
import PlanService from '../../src/services/plan.service';

jest.mock('../../src/models/plan.model');

describe('PlanService', () => {
    let planService: PlanService;

    beforeEach(() => {
        planService = new PlanService();
        jest.clearAllMocks();
    });

    describe('createPlan', () => {
        it('should create a new plan when name is unique', async () => {
            const planData = { name: 'Basic Plan', price: 10 };

            // Mock `findOne` to return a query chain with `lean()`
            (Plan.findOne as jest.Mock).mockReturnValue({
                lean: jest.fn().mockResolvedValue(null),
            });

            (Plan.create as jest.Mock).mockResolvedValue({
                toObject: () => planData,
            });

            const result = await planService.createPlan(planData);

            expect(Plan.findOne).toHaveBeenCalledWith({ name: planData.name });
            expect(Plan.create).toHaveBeenCalledWith(planData);
            expect(result).toEqual(planData);
        });

        it('should throw an error if a plan with the same name exists', async () => {
            (Plan.findOne as jest.Mock).mockReturnValue({
                lean: jest.fn().mockResolvedValue({ name: 'Basic Plan' }),
            });

            await expect(
                planService.createPlan({ name: 'Basic Plan' }),
            ).rejects.toThrow('A plan with this name already exists.');

            expect(Plan.findOne).toHaveBeenCalledWith({ name: 'Basic Plan' });
            expect(Plan.create).not.toHaveBeenCalled();
        });
    });

    describe('getAllPlans', () => {
        it('should return all plans with isSubscribed as false if no active subscription', async () => {
            const mockPlans = [
                {
                    name: 'Basic Plan',
                    description: 'Basic Plan',
                    features: ['feat 1', 'feat 2'],
                    price: 10,
                    currency: 'USD',
                    billingCycle: 'MONTHLY',
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];
    
            jest.spyOn(Subscription, 'findOne').mockReturnValue({
                lean: jest.fn().mockResolvedValue(null),
            } as any);
    
            jest.spyOn(Plan, 'find').mockReturnValue({
                lean: jest.fn().mockResolvedValue(mockPlans),
            } as any);
    
            const result = await planService.getAllPlans('someUserId');
    
            expect(result).toEqual([
                {
                    ...mockPlans[0],
                    isSubscribed: false,
                },
            ]);
        });
    });

    describe('updatePlan', () => {
        it('should update the plan and return the updated object', async () => {
            const planId = '123';
            const updateData = { price: 15 };
            const updatedPlan = { _id: planId, name: 'Basic Plan', price: 15 };

            (Plan.findByIdAndUpdate as jest.Mock).mockResolvedValue(
                updatedPlan,
            );

            const result = await planService.updatePlan(planId, updateData);

            expect(Plan.findByIdAndUpdate).toHaveBeenCalledWith(
                planId,
                updateData,
                {
                    new: true,
                    runValidators: true,
                    lean: true,
                },
            );
            expect(result).toEqual(updatedPlan);
        });

        it('should throw an error if the plan is not found', async () => {
            (Plan.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

            await expect(
                planService.updatePlan('nonexistentId', { price: 15 }),
            ).rejects.toThrow('Plan not found.');

            expect(Plan.findByIdAndUpdate).toHaveBeenCalled();
        });
    });
});
