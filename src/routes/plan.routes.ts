// import { Router } from 'express';
// import container from '../di-container';
// import PlanController from '../controllers/plan.controller';
// import validateSchema from '../middlewares/validateSchema';
// import CreatePlanSchema from '../validations/plan/createPlan.dto';

// const planRouter = Router();
// const planController = container.resolve<PlanController>('planController');

// planRouter.post(
//     '/plan',
//     validateSchema(CreatePlanSchema),
//     planController.createPlan,
// );

// export default planRouter;
