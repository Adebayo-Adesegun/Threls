import { Request, Response } from 'express';
import { before, GET, POST, route } from 'awilix-express';
import passport from 'passport';
import PlanService from '../services/plan.service';
import Validate from '../middlewares/validateRequest';
import CreatePlanSchema from '../validations/plan/createPlan.validation';

@route('/plan')
@before(passport.authenticate('jwt', { session: false }))
class PlanController {
    constructor(private readonly planService: PlanService) {}

    @POST()
    @Validate(CreatePlanSchema)
    async createPlan(req: Request, res: Response): Promise<Response> {
        const newPlan = await this.planService.createPlan(req.body);
        return res.status(201).json(newPlan);
    }

    @GET()
    public async getPlans(req: Request, res: Response): Promise<Response> {
        const plans = await this.planService.getAllPlans();
        return res.status(200).json(plans);
    }
}

export default PlanController;
