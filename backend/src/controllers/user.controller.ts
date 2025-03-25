import { Request, Response } from 'express';
import { before, POST, route } from 'awilix-express';
import passport from 'passport';
import Validate from '../middlewares/validateRequest';
import SubscriptionService from '../services/subscription.service';
import createSubcriptionSchema from '../validations/user/createSubscription.validation';
import { User } from '../interfaces/user/user.interface';

@route('/user')
@before(passport.authenticate('jwt', { session: false }))
class UserController {
    constructor(private readonly subscriptionService: SubscriptionService) {}

    @POST()
    @route('/subscription')
    @Validate(createSubcriptionSchema)
    async createSubScription(req: Request, res: Response): Promise<Response> {
        const { planId, paymentMethodId } = req.body;
        const user = req.user as User;
        const newSubscription =
            await this.subscriptionService.createSubscription(
                user._id,
                planId,
                paymentMethodId,
            );
        return res.status(201).json(newSubscription);
    }

    @route('/subscription/:id/cancel')
    @POST()
    async cancelSubscription(req: Request, res: Response): Promise<Response> {
        const { id: subscriptionId } = req.params;
        if (!subscriptionId) {
            return res
                .status(400)
                .json({ message: 'Subscription ID required' });
        }
        const user = req.user as User;
        await this.subscriptionService.cancelSubscription(
            subscriptionId,
            user._id,
        );
        return res
            .status(200)
            .json({ message: 'Subscription cancelled successfully' });
    }
}

export default UserController;
