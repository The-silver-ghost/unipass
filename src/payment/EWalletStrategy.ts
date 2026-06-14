import { PaymentStrategy } from './CheckoutContext';
import { PaymentLogger } from './PaymentLogger';

export interface EWalletCredentials {
    walletId: string;
    pin: string;
}

export class EWalletStrategy implements PaymentStrategy {
    private actualCost: number;
    private credentials: EWalletCredentials;

    constructor(actualCost: number, credentials: EWalletCredentials) {
        this.actualCost = actualCost;
        this.credentials = credentials;
    }

    pay(amount: number): boolean {
        if (!this.credentials.walletId || !this.credentials.pin) {
            PaymentLogger.log('E-Wallet', amount, false);
            return false;
        }

        if (amount === this.actualCost) {
            console.log(`[E-Wallet] Routing RM${amount} through E-Wallet API.`);
            PaymentLogger.log('E-Wallet', amount, true);
            return true;
        }

        PaymentLogger.log('E-Wallet', amount, false);
        return false;
    }
}
