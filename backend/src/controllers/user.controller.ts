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
}

export default UserController;
