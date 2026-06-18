import { EPassState } from './EPassState';
import { EPassContext } from './EPassContext';

export class CancelledState implements EPassState {
    getStateName(): string { return 'Cancelled'; }

    scan(context: EPassContext): void {
        throw new Error("E-Pass is cancelled.");
    }

    expire(context: EPassContext): void {
        // Ignored
    }

    requestRefund(context: EPassContext, isFree: boolean): void {
        throw new Error("E-Pass is already cancelled.");
    }

    approveRefund(context: EPassContext): void {
        throw new Error("Cannot approve refund for a cancelled E-Pass.");
    }

    canShowQRCode(): boolean { return false; }
    canRequestRefund(): boolean { return false; }
    canBeDeleted(): boolean { return true; }
}
