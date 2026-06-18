import { EPassState } from './EPassState';
import { EPassContext } from './EPassContext';

export class ScannedState implements EPassState {
    getStateName(): string { return 'Scanned'; }

    scan(context: EPassContext): void {
        throw new Error("E-Pass is already scanned.");
    }

    expire(context: EPassContext): void {
        // According to instructions, if scanned, it can transition to expired if event ends.
        // Actually, if it's already scanned, maybe it stays scanned? Let's allow transitioning to Expired or just stay Scanned.
        // It doesn't really matter, but let's prevent exceptions.
    }

    requestRefund(context: EPassContext, isFree: boolean): void {
        throw new Error("Cannot request a refund for a scanned E-Pass.");
    }

    approveRefund(context: EPassContext): void {
        throw new Error("Cannot refund a scanned E-Pass.");
    }

    canShowQRCode(): boolean { return false; }
    canRequestRefund(): boolean { return false; }
    canBeDeleted(): boolean { return false; } // It can be deleted if event ends, but we rely on event_end_date for that.
}
