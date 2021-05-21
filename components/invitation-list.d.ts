import { BaseElement, DepsElement } from '@holochain-open-dev/common';
import { InvitationsStore } from '../invitations.store';
import { Card } from 'scoped-material-components/mwc-card';
import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';
declare const InvitationsList_base: typeof BaseElement;
export declare abstract class InvitationsList extends InvitationsList_base implements DepsElement<InvitationsStore> {
    abstract get _deps(): InvitationsStore;
    static styles: import("lit-element").CSSResult[];
    loaded: boolean;
    first: any;
    firstUpdated(): Promise<void>;
    renderPendingInvitations(): import("lit-element").TemplateResult;
    render(): import("lit-element").TemplateResult;
    getScopedElements(): {
        'invitation-item': import("lit-element").Constructor<HTMLElement>;
        'mwc-card': typeof Card;
        'mwc-circular-progress': typeof CircularProgress;
    };
}
export {};
