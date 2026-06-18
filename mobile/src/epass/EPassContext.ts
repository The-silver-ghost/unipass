import { EPassState } from './EPassState';

export class EPassContext {
    private state: EPassState;
    public epassId: string;
    public registrationId: string;

    constructor(initialState: EPassState, epassId: string, registrationId: string) {
        this.state = initialState;
        this.epassId = epassId;
        this.registrationId = registrationId;
    }

    public setState(state: EPassState): void {
        this.state = state;
    }

    public getStateName(): string {
        return this.state.getStateName();
    }

    public scan(): void {
        this.state.scan(this);
    }

    public expire(): void {
        this.state.expire(this);
    }

    public requestRefund(isFree: boolean): void {
        this.state.requestRefund(this, isFree);
    }

    public approveRefund(): void {
        this.state.approveRefund(this);
    }

    public canShowQRCode(): boolean {
        return this.state.canShowQRCode();
    }

    public canRequestRefund(): boolean {
        return this.state.canRequestRefund();
    }

    public canBeDeleted(): boolean {
        return this.state.canBeDeleted();
    }
}
