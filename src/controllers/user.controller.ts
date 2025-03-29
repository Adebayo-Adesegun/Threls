import { Request, Response } from 'express';
import { before, GET, POST, route } from 'awilix-express';
import passport from 'passport';
import Validate from '../middlewares/validateRequest';
import SubscriptionService from '../services/subscription.service';
import { User } from '../interfaces/user/user.interface';
import { CreateSubscription } from '../interfaces/user/create-subscription.interface';
import SanitizerService from '../services/sanitizer.service';
import { createSubcriptionSchema } from '../schemas/validations/user/createSubscription.validation';
import InvoiceService from '../services/invoice.service';

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management and subscription operations
 */

@route('/user')
@before(passport.authenticate('jwt', { session: false }))
class UserController {
    constructor(
        private readonly subscriptionService: SubscriptionService,
        private readonly sanitizerService: SanitizerService,
        private readonly invoiceService: InvoiceService,
    ) {}

    /**
     * @swagger
     * /user/subscription:
     *   post:
     *     summary: Create a new subscription
     *     tags: [User]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/createSubcriptionSchema'
     *     responses:
     *       201:
     *         description: Subscription created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Subscription created successfully
     *                 data:
     *                   $ref: '#/components/schemas/Subscription'
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
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
                    'Subscription created successfully',
                    newSubscription,
                ),
            );
    }

    /**
     * @swagger
     * /user/subscription/{id}/cancel:
     *   post:
     *     summary: Cancel an existing subscription
     *     tags: [User]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The subscription ID
     *     responses:
     *       200:
     *         description: Subscription cancelled successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Subscription cancelled successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
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

    /**
     * @swagger
     * /user/invoice:
     *   get:
     *     summary: Retrieve all invoices for the authenticated user
     *     tags: [User]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: List of user invoices retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Invoices fetched successfully
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Invoice'
     *       401:
     *         description: Unauthorized
     */
    @GET()
    @route('/invoice')
    async getUserInvoices(req: Request, res: Response): Promise<Response> {
        const user = req.user as User;
        const invoices = await this.invoiceService.fetchInvoices(user._id);
        return res
            .status(200)
            .json(
                this.sanitizerService.formatResponse(
                    true,
                    'invoices fetched successfully',
                    invoices,
                ),
            );
    }

    /**
     * @swagger
     * /user/invoice/{id}:
     *   get:
     *     summary: Retrieve a specific invoice by ID for the authenticated user
     *     tags: [User]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The invoice ID
     *     responses:
     *       200:
     *         description: Invoice details retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Invoice fetched successfully
     *                 data:
     *                   $ref: '#/components/schemas/Invoice'
     *       400:
     *         description: Invalid invoice ID
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Invoice not found
     */
    @GET()
    @route('/invoice/:id')
    async getUserInvoiceById(req: Request, res: Response): Promise<Response> {
        const { id: invoiceId } = req.params;
        const user = req.user as User;
        const invoice = await this.invoiceService.fetchInvoiceById(
            invoiceId,
            user._id,
        );
        return res
            .status(200)
            .json(
                this.sanitizerService.formatResponse(
                    true,
                    'invoice fetched successfully',
                    invoice,
                ),
            );
    }
}

export default UserController;
