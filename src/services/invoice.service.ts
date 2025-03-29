import Invoice from '../models/invoice.model';

class InvoiceService {
    async fetchInvoices(userId: string): Promise<any> {
        const invoices = await Invoice.find({ userId })
            .populate('paymentMethodId', 'cardType last4')
            .lean();
        return invoices;
    }

    async fetchInvoiceById(invoiceId: string, userId: string): Promise<any> {
        const invoice = await Invoice.findOne({
            _id: invoiceId,
            userId,
        })
            .populate('paymentMethodId', 'cardType last4')
            .lean();
        if (!invoice) {
            throw new Error('Invoice not found');
        }
        return invoice;
    }
}

export default InvoiceService;
