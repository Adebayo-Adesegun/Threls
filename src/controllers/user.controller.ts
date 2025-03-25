import { Request, Response } from 'express';
import { before, POST, route } from 'awilix-express';
import passport from 'passport';
import Validate from '../middlewares/validateRequest';
import SubscriptionService from '../services/subscription.service';
import createSubcriptionSchema from '../validations/user/createSubscription.validation';
import { User } from '../interfaces/user/user.interface';
import { CreateSubscription } from '../interfaces/user/create-subscription.interface';
import SanitizerService from '../services/sanitizer.service';

@route('/user')
@before(passport.authenticate('jwt', { session: false }))
class UserController {
    constructor(
        private readonly subscriptionService: SubscriptionService,
        private readonly sanitizerService: SanitizerService,
    ) {}

    @POST()
    @route('/subscription')
    @Validate(createSubcriptionSchema)
    async createSubScription(req: Request, res: Response): Promise<Response> {
        const createSubscription = req.body as CreateSubscription;
        const user = req.user as User;

        const newSubscription =
            await this.subscriptionService.createSubscription(
                createSubscription,
                user._id,
            );
        return res
            .status(201)
            .json(
                this.sanitizerService.formatResponse(
                    true,
                    'suscription created successfully',
                    newSubscription,
                ),
            );
    }

    @POST()
    @route('/subscription/:id/cancel')
    async cancelSubscription(req: Request, res: Response): Promise<Response> {
        const { id: subscriptionId } = req.params;
        const user = req.user as User;
        await this.subscriptionService.cancelSubscription(
            subscriptionId,
            user._id,
        );
        return res
            .status(200)
            .json(
                this.sanitizerService.formatResponse(
                    true,
                    'Subscription cancelled successfully',
                ),
            );
    }
}

export default UserController;
