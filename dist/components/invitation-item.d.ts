import { LitElement } from 'lit';
import { StoreSubscriber } from 'lit-svelte-stores';
/**mwc-elements imports */
import { List, Icon, Button, ListItem } from '@scoped-elements/material-web';
import { InvitationsStore } from '../state/invitations-store';
import { AgentAvatar, ProfilesStore } from '@holochain-open-dev/profiles';
import { InvitationStatus } from '../types';
import { SlBadge } from '@scoped-elements/shoelace';
import { EntryHashB64 } from '@holochain-open-dev/core-types';
declare const InvitationItem_base: typeof LitElement & import("@open-wc/dedupe-mixin").Constructor<import("@open-wc/scoped-elements/types/src/types").ScopedElementsHost>;
/**
 * @element invitation-item
 * @fires invitation-completed - after the invitation its accepted by all the invitees
 */
export declare class InvitationItem extends InvitationItem_base {
    _store: InvitationsStore;
    _profilesStore: ProfilesStore;
    invitationEntryHash: EntryHashB64;
    clicked: boolean;
    _locked: boolean;
    _invitation: StoreSubscriber<import("../types").InvitationEntryInfo>;
    _knownProfiles: StoreSubscriber<Record<string, import("@holochain-open-dev/profiles").Profile>>;
    get invitationStatus(): InvitationStatus;
    get fromMe(): boolean;
    _clearInvitation(): Promise<void>;
    _rejectInvitation(): Promise<void>;
    _acceptInvitation(): Promise<void>;
    _clickHandler(): void;
    _invitationStatus(): import("lit-html").TemplateResult<1>;
    _invitationActionButtons(): import("lit-html").TemplateResult<1>;
    _invitationInviterAgent(): import("lit-html").TemplateResult<1>;
    _haveYouInteracted(): boolean;
    render(): import("lit-html").TemplateResult<1> | undefined;
    static get scopedElements(): {
        'agent-avatar': typeof AgentAvatar;
        'mwc-icon': typeof Icon;
        'mwc-list': typeof List;
        'sl-badge': typeof SlBadge;
        'mwc-button': typeof Button;
        'mwc-list-item': typeof ListItem;
    };
    static styles: import("lit").CSSResult;
}
export {};
