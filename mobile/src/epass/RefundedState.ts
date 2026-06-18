import { EPassState } from './EPassState';
import { EPassContext } from './EPassContext';

export class RefundedState implements EPassState {
    getStateName(): string { return 'Refunded'; }

    scan(context: EPassContext): void {
        throw new Error("E-Pass has been refunded.");
    }

    expire(context: EPassContext): void {
        // Ignored
    }

    requestRefund(context: EPassContext, isFree: boolean): void {
        throw new Error("E-Pass is already refunded.");
    }

    approveRefund(context: EPassContext): void {
        throw new Error("E-Pass is already refunded.");
    }

    canShowQRCode(): boolean { return false; }
    canRequestRefund(): boolean { return false; }
    canBeDeleted(): boolean { return true; }
}
