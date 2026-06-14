import { PaymentStrategy } from './CheckoutContext';
import { PaymentLogger } from './PaymentLogger';

export interface FPXCredentials {
    bankCode: string;
    accountNumber: string;
}

export class FPXStrategy implements PaymentStrategy {
    private actualCost: number;
    private credentials: FPXCredentials;

    constructor(actualCost: number, credentials: FPXCredentials) {
        this.actualCost = actualCost;
        this.credentials = credentials;
    }

    pay(amount: number): boolean {
        if (!this.credentials.bankCode || !this.credentials.accountNumber) {
            PaymentLogger.log('FPX', amount, false);
            return false;
        }

        if (amount === this.actualCost) {
            console.log(`[FPX] Routing RM${amount} through FPX Banking API.`);
            PaymentLogger.log('FPX', amount, true);
            return true;
        }

        PaymentLogger.log('FPX', amount, false);
        return false;
    }
}
