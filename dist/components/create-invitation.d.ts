import { LitElement } from 'lit';
/**mwc-elements imports */
import { Card, List, Icon, Button, ListItem, Snackbar } from '@scoped-elements/material-web';
import { AgentAvatar, ProfilePrompt, SearchAgent } from '@holochain-open-dev/profiles';
import { InvitationsStore } from '../state/invitations-store';
import { AgentPubKeyB64, Dictionary } from '@holochain-open-dev/core-types';
import { StoreSubscriber } from 'lit-svelte-stores';
declare const CreateInvitation_base: typeof LitElement & import("@open-wc/dedupe-mixin").Constructor<import("@open-wc/scoped-elements/types/src/types").ScopedElementsHost>;
/**
 * @element create-invitation-form
 */
export declare class CreateInvitation extends CreateInvitation_base {
    _store: InvitationsStore;
    invitees: AgentPubKeyB64[];
    _allProfiles: StoreSubscriber<Dictionary<import("@holochain-open-dev/profiles").Profile>>;
    addInvitee(e: CustomEvent): void;
    removeInvitee(index: number): void;
    sendInvitation(): Promise<void>;
    _pedignInvitations(): Promise<void>;
    renderInviteesList(): import("lit-html").TemplateResult<1>;
    renderInvitationError(): import("lit-html").TemplateResult<1>;
    render(): import("lit-html").TemplateResult<1>;
    static get scopedElements(): {
        'search-agent': typeof SearchAgent;
        'agent-avatar': typeof AgentAvatar;
        'profile-prompt': typeof ProfilePrompt;
        'mwc-icon': typeof Icon;
        'mwc-list': typeof List;
        'mwc-card': typeof Card;
        'mwc-list-item': typeof ListItem;
        'mwc-snackbar': typeof Snackbar;
        'mwc-button': typeof Button;
    };
    static get styles(): import("lit").CSSResult[];
}
export {};
