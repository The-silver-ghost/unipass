import { PaymentStrategy } from './CheckoutContext';
import { PaymentLogger } from './PaymentLogger';

export interface CreditCardCredentials {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
}

export class CreditCardStrategy implements PaymentStrategy {
    private actualCost: number;
    private credentials: CreditCardCredentials;

    constructor(actualCost: number, credentials: CreditCardCredentials) {
        this.actualCost = actualCost;
        this.credentials = credentials;
    }

    pay(amount: number): boolean {
        if (!this.credentials.cardNumber || !this.credentials.expiryDate || !this.credentials.cvv) {
            PaymentLogger.log('Credit Card', amount, false);
            return false;
        }

        if (amount === this.actualCost) {
            console.log(`[Credit Card] Processing RM${amount} via Credit Card Gateway.`);
            PaymentLogger.log('Credit Card', amount, true);
            return true;
        }

        PaymentLogger.log('Credit Card', amount, false);
        return false;
    }
}
