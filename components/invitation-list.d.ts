import { MobxLitElement } from '@adobe/lit-mobx';
import { InvitationItem } from './invitation-item';
import { InvitationsStore } from '../invitations.store';
/**mwc-elements imports */
import { Card } from 'scoped-material-components/mwc-card';
import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';
declare const InvitationsList_base: typeof MobxLitElement;
/**
 * @element invitation-list
 */
export declare class InvitationsList extends InvitationsList_base {
    _store: InvitationsStore;
    static styles: import("lit").CSSResultGroup[];
    loaded: boolean;
    firstUpdated(): Promise<void>;
    renderPendingInvitations(): import("lit-html").TemplateResult<1>;
    render(): import("lit-html").TemplateResult<1>;
    static elementDefinitions: {
        'mwc-card': typeof Card;
        'invitation-item': typeof InvitationItem;
        'mwc-circular-progress': typeof CircularProgress;
    };
}
export {};
