import { PaymentStrategy } from './CheckoutContext';
import { FreeRegistrationStrategy } from './Free';
import { EWalletStrategy } from './EWalletStrategy';
import { FPXStrategy } from './FPXStrategy';
import { CreditCardStrategy } from './CreditCard';

export function resolveStrategy(price: number, method: string): PaymentStrategy {
    if (price === 0) return new FreeRegistrationStrategy();
    if (method === 'ewallet') return new EWalletStrategy(price, { walletId: 'wallet', pin: '000000' });
    if (method === 'fpx') return new FPXStrategy(price, { bankCode: 'BANK', accountNumber: '0000000000' });
    if (method === 'card') return new CreditCardStrategy(price, { cardNumber: '0000000000000000', expiryDate: '01/30', cvv: '000' });
    throw new Error(`Unknown payment method: ${method}`);
}
