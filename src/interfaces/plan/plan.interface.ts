export interface PlanResponse {
    name: string;
    price: number;
    currency: string;
    billingCycle: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
