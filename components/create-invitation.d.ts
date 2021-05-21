import { BaseElement, DepsElement } from '@holochain-open-dev/common';
import { Dictionary } from '@holochain-open-dev/profiles';
import { InvitationsStore } from '../invitations.store';
import { Button } from 'scoped-material-components/mwc-button';
import { Icon } from '@material/mwc-icon';
import { List } from 'scoped-material-components/mwc-list';
import { ListItem } from '@material/mwc-list/mwc-list-item';
import { Card } from 'scoped-material-components/mwc-card';
import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';
declare const CreateInvitation_base: typeof BaseElement;
export declare abstract class CreateInvitation extends CreateInvitation_base implements DepsElement<InvitationsStore> {
    abstract get _deps(): InvitationsStore;
    static styles: import("lit-element").CSSResult[];
    invitees: Dictionary<String>;
    _addInvitee(e: CustomEvent): void;
    _removeInvitee(e: Event): void;
    _sendInvitation(): Promise<void>;
    _pedignInvitations(): Promise<void>;
    renderInviteesList(): import("lit-element").TemplateResult;
    render(): import("lit-element").TemplateResult;
    getScopedElements(): {
        'mwc-circular-progress': typeof CircularProgress;
        'mwc-icon': typeof Icon;
        'mwc-list': typeof List;
        'mwc-card': typeof Card;
        'mwc-list-item': typeof ListItem;
        'mwc-button': typeof Button;
        'search-agent': import("lit-element").Constructor<HTMLElement>;
    };
}
export {};
