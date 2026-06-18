import { EPassState } from './EPassState';
import { EPassContext } from './EPassContext';

export class ExpiredState implements EPassState {
    getStateName(): string { return 'Expired'; }

    scan(context: EPassContext): void {
        throw new Error("E-Pass is expired.");
    }

    expire(context: EPassContext): void {
        // Already expired
    }

    requestRefund(context: EPassContext, isFree: boolean): void {
        throw new Error("Cannot request a refund for an expired E-Pass.");
    }

    approveRefund(context: EPassContext): void {
        throw new Error("Cannot refund an expired E-Pass.");
    }

    canShowQRCode(): boolean { return false; }
    canRequestRefund(): boolean { return false; }
    canBeDeleted(): boolean { return true; }
}
