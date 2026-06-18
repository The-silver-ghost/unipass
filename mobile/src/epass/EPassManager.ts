import { EPassContext } from './EPassContext';
import { EPassState } from './EPassState';
import { ActiveState } from './ActiveState';
import { ScannedState } from './ScannedState';
import { ExpiredState } from './ExpiredState';
import { CancelledState } from './CancelledState';
import { RefundedState } from './RefundedState';

export class EPassManager {
    static getStateInstance(stateString: string): EPassState {
        switch (stateString.toLowerCase()) {
            case 'active':
                return new ActiveState();
            case 'scanned':
                return new ScannedState();
            case 'expired':
                return new ExpiredState();
            case 'cancelled':
                return new CancelledState();
            case 'refunded':
                return new RefundedState();
            default:
                return new ActiveState();
        }
    }

    static createContext(stateString: string, epassId: string, registrationId: string): EPassContext {
        const state = this.getStateInstance(stateString);
        return new EPassContext(state, epassId, registrationId);
    }
}
