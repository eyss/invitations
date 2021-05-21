import { BaseElement, DepsElement } from '@holochain-open-dev/common';
import { InvitationsStore } from '../invitations.store';
import { Icon } from '@material/mwc-icon';
import { List } from 'scoped-material-components/mwc-list';
import { ListItem } from '@material/mwc-list/mwc-list-item';
import { Button } from 'scoped-material-components/mwc-button';
import { Snackbar } from 'scoped-material-components/mwc-snackbar';
import { TabBar } from 'scoped-material-components/mwc-tab-bar';
import { Tab } from 'scoped-material-components/mwc-tab';
declare const InvitationItem_base: typeof BaseElement;
export declare abstract class InvitationItem extends InvitationItem_base implements DepsElement<InvitationsStore> {
    abstract get _deps(): InvitationsStore;
    loaded: boolean;
    invitation_entry_hash: string;
    clicked: boolean;
    static styles: import("lit-element").CSSResult;
    get invitationEntryInfo(): import("../types").InvitationEntryInfo;
    firstUpdated(): Promise<void>;
    _rejectInvitation(): Promise<void>;
    _acceptInvitation(): Promise<void>;
    get invitationStatus(): string;
    _clickHandler(): void;
    _invitationStatusInfo(): import("lit-element").TemplateResult;
    _invitationActionButtons(): import("lit-element").TemplateResult;
    _invitationInviterAgent(): import("lit-element").TemplateResult;
    _haveYouInteracted(): boolean;
    render(): import("lit-element").TemplateResult | undefined;
    getScopedElements(): {
        'mwc-icon': typeof Icon;
        'mwc-list': typeof List;
        'mwc-list-item': typeof ListItem;
        'mwc-tab': typeof Tab;
        'mwc-tab-bar': typeof TabBar;
        'mwc-button': typeof Button;
        'mwc-snackbar': typeof Snackbar;
    };
}
export {};
