import { LitElement } from 'lit';
import { DynamicStore } from 'lit-svelte-stores';
/**mwc-elements imports */
import { Card, CircularProgress } from '@scoped-elements/material-web';
import { InvitationItem } from './invitation-item';
import { InvitationsStore } from '../state/invitations-store';
declare const InvitationsList_base: typeof LitElement & import("@open-wc/dedupe-mixin").Constructor<import("@open-wc/scoped-elements/types/src/types").ScopedElementsHost>;
/**
 * @element invitation-list
 */
export declare class InvitationsList extends InvitationsList_base {
    _store: InvitationsStore;
    _pendingInvitations: DynamicStore<import("@holochain-open-dev/core-types").Dictionary<import("..").InvitationEntryInfo>, this>;
    static styles: import("lit").CSSResult[];
    loaded: boolean;
    firstUpdated(): Promise<void>;
    renderPendingInvitations(): import("lit").TemplateResult<1>;
    render(): import("lit").TemplateResult<1>;
    static get scopedElements(): {
        'mwc-card': typeof Card;
        'invitation-item': typeof InvitationItem;
        'mwc-circular-progress': typeof CircularProgress;
    };
}
export {};
