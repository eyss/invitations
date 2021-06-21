import { MobxLitElement } from '@adobe/lit-mobx';
import { InvitationItem } from './invitation-item';
import { InvitationsStore } from '../invitations.store';
/**mwc-elements imports */
import { Card } from 'scoped-material-components/mwc-card';
import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';
declare const InvitationsList_base: typeof MobxLitElement & import("@open-wc/dedupe-mixin").Constructor<import("@open-wc/scoped-elements/types/src/types").ScopedElementsHost>;
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
    static get scopedElements(): {
        'mwc-card': typeof Card;
        'invitation-item': typeof InvitationItem;
        'mwc-circular-progress': typeof CircularProgress;
    };
}
export {};
