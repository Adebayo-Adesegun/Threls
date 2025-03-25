import { Card } from './card.interface';

export interface CreateSubscription {
    planId: string;
    card: Card;
}
