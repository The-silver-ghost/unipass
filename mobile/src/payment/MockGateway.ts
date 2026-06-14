import { CheckoutContext } from './CheckoutContext';
import { resolveStrategy } from './PaidEvent';

//Credit Card
const cardStrategy = resolveStrategy(150, 'card');
const cardContext = new CheckoutContext(cardStrategy);
cardContext.executePayment(150);

//FPX
const fpxStrategy = resolveStrategy(80, 'fpx');
const fpxContext = new CheckoutContext(fpxStrategy);
fpxContext.executePayment(80);

//E-Wallet
const ewalletStrategy = resolveStrategy(50, 'ewallet');
const ewalletContext = new CheckoutContext(ewalletStrategy);
ewalletContext.executePayment(50);

//Free
const freeStrategy = resolveStrategy(0, 'free');
const freeContext = new CheckoutContext(freeStrategy);
freeContext.executePayment(0);
