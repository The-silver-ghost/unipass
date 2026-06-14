import { PaymentStrategy } from './CheckoutContext';

export class FreeRegistrationStrategy implements PaymentStrategy { 
    pay(amount: number): boolean { 
        console.log("Free event, no payment needed."); 
        return true; 
    } 
} 
