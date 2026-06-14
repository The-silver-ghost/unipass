export class PaymentLogger {
    static log(method: string, amount: number, success: boolean): void {
        const status = success ? 'SUCCESS' : 'FAILED';
        const ref = `TXN-${Date.now()}`;//transaction reference
        console.log(`[${new Date().toISOString()}] [${status}] ${method} | RM${amount} | Ref: ${ref}`);
    }
}
