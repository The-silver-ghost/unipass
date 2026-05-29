interface PaymentStrategy { 
    pay(amount: number): boolean; 
} 

class FreeRegistrationStrategy implements PaymentStrategy { 
    pay(amount: number): boolean { 
        console.log("Free event, no payment needed."); 
        return true; 
    } 
} 

class EWalletStrategy implements PaymentStrategy { 
    pay(amount: number): boolean { 
        console.log(`Routing RM${amount} through E-Wallet API.`); 
        return true; 
    } 
} 

class FPXStrategy implements PaymentStrategy { 
    pay(amount: number): boolean { 
        console.log(`Routing RM${amount} through FPX Banking API.`); 
        return true; 
    } 
} 

class CreditCardStrategy implements PaymentStrategy { 
    pay(amount: number): boolean { 
        console.log(`Processing RM${amount} via Credit Card Gateway.`); 
        return true; 
    } 
} 

class CheckoutContext { 
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
        } 
    } 
} 
