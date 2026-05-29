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
    private actualCost: number;

    constructor(actualCost: number){
        this.actualCost = actualCost;
    }

    pay(amount: number): boolean { 
        if(amount === this.actualCost){
        console.log(`Routing RM${amount} through E-Wallet API.`); 
        return true; 
        }else{
            console.log('Payment Failed');
            return false;
        }
    }
} 

class FPXStrategy implements PaymentStrategy { 
    private actualCost: number;

    constructor(actualCost: number){
        this.actualCost = actualCost;
    }

    pay(amount: number): boolean { 
        if(amount === this.actualCost){
        console.log(`Routing RM${amount} through FPX Banking API.`); 
        return true; 
        }else{
            console.log('Payment Failed');
            return false;
        }
    } 
} 

class CreditCardStrategy implements PaymentStrategy { 
    private actualCost: number;

    constructor(actualCost: number){
        this.actualCost = actualCost;
    }
    
    pay(amount: number): boolean { 
        if(amount === this.actualCost){
        console.log(`Processing RM${amount} via Credit Card Gateway.`); 
        return true;
        }else{
           console.log('Payment Failed');
            return false; 
        } 
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
