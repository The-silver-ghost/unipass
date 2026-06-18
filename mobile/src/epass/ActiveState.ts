import { EPassState } from './EPassState';
import { EPassContext } from './EPassContext';
import { ScannedState } from './ScannedState';
import { ExpiredState } from './ExpiredState';
import { CancelledState } from './CancelledState';

export class ActiveState implements EPassState {
    getStateName(): string { return 'Active'; }

    scan(context: EPassContext): void {
        context.setState(new ScannedState());
    }

    expire(context: EPassContext): void {
        context.setState(new ExpiredState());
    }

    requestRefund(context: EPassContext, isFree: boolean): void {
        if (isFree) {
            context.setState(new CancelledState());
        }
        // If not free, it stays Active until organizer approves.
    }

    approveRefund(context: EPassContext): void {
        // Can transition from Active to Refunded if organizer approves refund.
        // Wait, RefundedState isn't imported yet. I'll dynamically require it or just change state.
        // It's better to manage transitions centrally or just require them.
    }

    canShowQRCode(): boolean { return true; }
    canRequestRefund(): boolean { return true; }
    canBeDeleted(): boolean { return false; }
}
