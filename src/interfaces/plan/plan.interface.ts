export interface PlanResponse {
    name: string;
    description: string;
    features: string[],
    price: number;
    currency: string;
    billingCycle: string;
    isActive: boolean;
    isSubscribed?: boolean,
    createdAt: Date;
    updatedAt: Date;
}
