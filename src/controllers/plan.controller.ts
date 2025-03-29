import { Request, Response } from 'express';
import { before, GET, POST, route } from 'awilix-express';
import passport from 'passport';
import PlanService from '../services/plan.service';
import Validate from '../middlewares/validateRequest';
import SanitizerService from '../services/sanitizer.service';
import authorizeRole from '../middlewares/auth';
import { createPlanSchema } from '../schemas/validations/plan/createPlan.validation';

/**
 * @swagger
 * tags:
 *   name: Plan
 *   description: Plan management
 */

@route('/plan')
@before(passport.authenticate('jwt', { session: false }))
class PlanController {
    constructor(
        private readonly planService: PlanService,
        private readonly sanitizerService: SanitizerService,
    ) {}

    /**
     * @swagger
     * components:
     *   schemas:
     *     CreatePlan:
     *       type: object
     *       required:
     *         - name
     *         - price
     *       properties:
     *         name:
     *           type: string
     *           description: The name of the plan
     *         price:
     *           type: number
     *           description: The price of the plan
     *     Plan:
     *       type: object
     *       properties:
     *         id:
     *           type: string
     *           description: The auto-generated ID of the plan
     *         name:
     *           type: string
     *           description: The name of the plan
     *         price:
     *           type: number
     *           description: The price of the plan
     *         createdAt:
     *           type: string
     *           format: date-time
     *           description: The creation date of the plan
     *         updatedAt:
     *           type: string
     *           format: date-time
     *           description: The last update date of the plan
     */

    /**
     * @swagger
     * /plan:
     *   post:
     *     summary: Create a new plan
     *     tags: [Plan]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreatePlan'
     *     responses:
     *       201:
     *         description: Plan created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *                 data:
     *                   $ref: '#/components/schemas/Plan'
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     */
    @POST()
    @before(authorizeRole('admin'))
    @Validate(createPlanSchema)
    async createPlan(req: Request, res: Response): Promise<Response> {
        const newPlan = await this.planService.createPlan(req.body);
        return res
            .status(201)
            .json(
                this.sanitizerService.formatResponse(
                    true,
                    'Plan created successfully',
                    newPlan,
                ),
            );
    }

    /**
     * @swagger
     * /plan:
     *   get:
     *     summary: Get all plans
     *     tags: [Plan]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Fetched plans successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Plan'
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     */
    @GET()
    @before(authorizeRole('admin'))
    public async getPlans(req: Request, res: Response): Promise<Response> {
        const plans = await this.planService.getAllPlans();
        return res
            .status(200)
            .json(
                this.sanitizerService.formatResponse(
                    true,
                    'Fetched plans successfully',
                    plans,
                ),
            );
    }
}

export default PlanController;
