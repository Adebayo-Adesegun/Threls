import { Request, Response } from 'express';
import { before, GET, POST, route } from 'awilix-express';
import passport from 'passport';
import PlanService from '../services/plan.service';
import Validate from '../middlewares/validateRequest';
import CreatePlanSchema from '../validations/plan/createPlan.validation';
import SanitizerService from '../services/sanitizer.service';

@route('/plan')
@before(passport.authenticate('jwt', { session: false }))
class PlanController {
    constructor(
        private readonly planService: PlanService,
        private readonly sanitizerService: SanitizerService,
    ) {}

    @POST()
    @Validate(CreatePlanSchema)
    async createPlan(req: Request, res: Response): Promise<Response> {
        const newPlan = await this.planService.createPlan(req.body);
        return res
            .status(201)
            .json(
                this.sanitizerService.formatResponse(
                    true,
                    'plan created successfully',
                    newPlan,
                ),
            );
    }

    @GET()
    public async getPlans(req: Request, res: Response): Promise<Response> {
        const plans = await this.planService.getAllPlans();
        return res
            .status(200)
            .json(
                this.sanitizerService.formatResponse(
                    true,
                    'fetched plans successfully',
                    plans,
                ),
            );
    }
}

export default PlanController;
