import { EPassContext } from './EPassContext';

export interface EPassState {
    getStateName(): string;
    scan(context: EPassContext): void;
    expire(context: EPassContext): void;
    requestRefund(context: EPassContext, isFree: boolean): void;
    approveRefund(context: EPassContext): void;
    canShowQRCode(): boolean;
    canRequestRefund(): boolean;
    canBeDeleted(): boolean;
}
