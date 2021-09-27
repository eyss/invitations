import { LitElement } from 'lit';
/**mwc-elements imports */
import { Card, List, Icon, Button, ListItem } from '@scoped-elements/material-web';
import { ProfilePrompt, SearchAgent } from '@holochain-open-dev/profiles';
import { InvitationsStore } from '../state/invitations-store';
import { Dictionary } from '@holochain-open-dev/core-types';
declare const CreateInvitation_base: typeof LitElement & import("@open-wc/dedupe-mixin").Constructor<import("@open-wc/scoped-elements/types/src/types").ScopedElementsHost>;
/**
 * @element create-invitation-form
 */
export declare class CreateInvitation extends CreateInvitation_base {
    _store: InvitationsStore;
    invitees: Dictionary<string>;
    addInvitee(e: CustomEvent): void;
    removeInvitee(e: Event): void;
    sendInvitation(): Promise<void>;
    _pedignInvitations(): Promise<void>;
    renderInviteesList(): import("lit").TemplateResult<1>;
    render(): import("lit").TemplateResult<1>;
    static get scopedElements(): {
        'search-agent': typeof SearchAgent;
        'profile-prompt': typeof ProfilePrompt;
        'mwc-icon': typeof Icon;
        'mwc-list': typeof List;
        'mwc-card': typeof Card;
        'mwc-list-item': typeof ListItem;
        'mwc-button': typeof Button;
    };
    static get styles(): import("lit").CSSResult[];
}
export {};
