import { Card } from './card.interface';

export interface CreateSubscription {
    plan_id: string;
    card: Card;
}
