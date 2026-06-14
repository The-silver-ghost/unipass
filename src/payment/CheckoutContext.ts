export interface PaymentStrategy { 
    pay(amount: number): boolean; 
} 

export class CheckoutContext { 
    private strategy: PaymentStrategy; 
    constructor(strategy: PaymentStrategy) { 
        this.strategy = strategy; 
    } 
 
    public setStrategy(strategy: PaymentStrategy): void { 
        this.strategy = strategy; 
    } 
 
    public executePayment(amount: number): void { 
        const success = this.strategy.pay(amount); 
        if (success) { 
            console.log("Proceeding to ticket generation..."); 
        } else {
            console.log("Payment failed. Please try again.");
        }
    } 
} 
