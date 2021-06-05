import { MobxLitElement } from '@adobe/lit-mobx';
/**mwc-elements imports */
import { Card } from 'scoped-material-components/mwc-card';
import { List } from 'scoped-material-components/mwc-list';
import { Icon } from 'scoped-material-components/mwc-icon';
import { Button } from 'scoped-material-components/mwc-button';
import { ListItem } from 'scoped-material-components/mwc-list-item';
import { Dictionary, ProfilePrompt, SearchAgent } from '@holochain-open-dev/profiles';
import { InvitationsStore } from '../invitations.store';
declare const CreateInvitation_base: typeof MobxLitElement;
/**
 * @element create-invitation-form
 */
export declare class CreateInvitation extends CreateInvitation_base {
    _store: InvitationsStore;
    invitees: Dictionary<string>;
    _addInvitee(e: CustomEvent): void;
    _removeInvitee(e: Event): void;
    _sendInvitation(): Promise<void>;
    _pedignInvitations(): Promise<void>;
    renderInviteesList(): import("lit-html").TemplateResult<1>;
    render(): import("lit-html").TemplateResult<1>;
    static elementDefinitions: {
        'search-agent': typeof SearchAgent;
        'profile-prompt': typeof ProfilePrompt;
        'mwc-icon': typeof Icon;
        'mwc-list': typeof List;
        'mwc-card': typeof Card;
        'mwc-list-item': typeof ListItem;
        'mwc-button': typeof Button;
    };
    static get styles(): import("lit").CSSResultGroup[];
}
export {};
