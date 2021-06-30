import { MobxLitElement } from '@adobe/lit-mobx';
/**mwc-elements imports */
import { Icon } from 'scoped-material-components/mwc-icon';
import { List } from 'scoped-material-components/mwc-list';
import { Button } from 'scoped-material-components/mwc-button';
import { ListItem } from 'scoped-material-components/mwc-list-item';
import { InvitationsStore } from '../invitations.store';
import { ProfilesStore } from '@holochain-open-dev/profiles';
declare const InvitationItem_base: typeof MobxLitElement & import("@open-wc/dedupe-mixin").Constructor<import("@open-wc/scoped-elements/types/src/types").ScopedElementsHost>;
/**
 * @element invitation-item
 * @fires invitation-completed - after the invitation its accepted by all the invitees
 */
export declare class InvitationItem extends InvitationItem_base {
    _store: InvitationsStore;
    _profilesStore: ProfilesStore;
    loaded: boolean;
    clicked: boolean;
    invitation_entry_hash: string;
    static styles: import("lit").CSSResultGroup;
    get invitationEntryInfo(): import("../types").InvitationEntryInfo;
    get invitationStatus(): string;
    get fromMe(): boolean;
    firstUpdated(): Promise<void>;
    _rejectInvitation(): Promise<void>;
    _acceptInvitation(): Promise<void>;
    _clickHandler(): void;
    _invitationIcon(): import("lit").TemplateResult<1>;
    _invitationActionButtons(): import("lit").TemplateResult<1>;
    _invitationInviterAgent(): import("lit").TemplateResult<1>;
    _haveYouInteracted(): boolean;
    render(): import("lit").TemplateResult<1> | undefined;
    static get scopedElements(): {
        'mwc-icon': typeof Icon;
        'mwc-list': typeof List;
        'mwc-button': typeof Button;
        'mwc-list-item': typeof ListItem;
    };
}
export {};
