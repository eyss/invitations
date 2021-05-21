import { __decorate } from "tslib";
import { BaseElement, } from '@holochain-open-dev/common';
import { html, css, property } from 'lit-element';
import { Icon } from '@material/mwc-icon';
import { List } from 'scoped-material-components/mwc-list';
import { ListItem } from '@material/mwc-list/mwc-list-item';
import { Button } from 'scoped-material-components/mwc-button';
import { Snackbar } from 'scoped-material-components/mwc-snackbar';
import { TabBar } from 'scoped-material-components/mwc-tab-bar';
import { Tab } from 'scoped-material-components/mwc-tab';
import { MobxReactionUpdate } from '@adobe/lit-mobx';
import { toJS } from 'mobx';
export class InvitationItem extends MobxReactionUpdate(BaseElement) {
    constructor() {
        super(...arguments);
        this.loaded = false;
        this.invitation_entry_hash = '';
        this.clicked = false;
    }
    get invitationEntryInfo() {
        return this._deps.invitations[this.invitation_entry_hash];
    }
    async firstUpdated() {
        // this.invitation_entry_info = this._deps.invitations[this.invitation_entry_hash];
        // this.setInvitationStatus();
        // this.profiles[this.invitation_entry_info.invitation.inviter] = await this.getAgentProfile(this.invitation_entry_info.invitation.inviter);
        await this._deps.profilesStore.fetchAgentProfile(this.invitationEntryInfo.invitation.inviter);
        this.invitationEntryInfo.invitation.invitees.map(async (invitee_pub_key) => {
            await this._deps.profilesStore.fetchAgentProfile(invitee_pub_key);
        });
        // this.invitation_entry_info.invitation.timestamp = new Date(this.invitation_entry_info.invitation.timestamp.secs * 1000);
        this.loaded = true;
    }
    async _rejectInvitation() {
        let result = await this._deps.rejectInvitation(this.invitation_entry_hash);
    }
    async _acceptInvitation() {
        //añadir el handler
        const invitation = toJS(this._deps.invitations[this.invitation_entry_hash].invitation);
        await this._deps.acceptInvitation(this.invitation_entry_hash);
        if (!this._deps.invitations[this.invitation_entry_hash] ||
            this._deps.isInvitationCompleted(this.invitation_entry_hash)) {
            let myEvent = new CustomEvent('invitation-completed', {
                detail: { invitation },
                bubbles: true,
                composed: true,
            });
            console.log('fire', myEvent);
            this.dispatchEvent(myEvent);
        }
    }
    get invitationStatus() {
        if (this.invitationEntryInfo.invitees_who_rejected.length > 0) {
            return 'rejected';
        }
        if (this.invitationEntryInfo.invitees_who_accepted.length ===
            this.invitationEntryInfo.invitation.invitees.length) {
            return 'completed';
        }
        return 'pending';
    }
    _clickHandler() {
        this.clicked = !this.clicked;
    }
    _invitationStatusInfo() {
        if (this.invitationStatus == 'rejected') {
            return html `
        <span slot="secondary">
          rejected by :
          ${this.invitationEntryInfo.invitees_who_rejected.length}/${this
                .invitationEntryInfo.invitation.invitees.length}
          invitees
        </span>
        <mwc-icon slot="meta">close</mwc-icon>
      `;
        }
        else {
            return html `
        <span slot="secondary">
          accepted by :
          ${this.invitationEntryInfo.invitees_who_accepted.length}/${this
                .invitationEntryInfo.invitation.invitees.length}
          invitees
        </span>
        ${this.invitationStatus == 'completed'
                ? html `<mwc-icon slot="meta">check</mwc-icon>`
                : html `<mwc-icon slot="meta">pending</mwc-icon>`}
      `;
        }
    }
    _invitationActionButtons() {
        return html `
      <span slot="secondary">
        <mwc-button icon="check" @click="${this._acceptInvitation}"
          >ACCEPT</mwc-button
        >
        <mwc-button icon="close" @click="${this._rejectInvitation}">
          REJECT</mwc-button
        >
      </span>
    `;
    }
    _invitationInviterAgent() {
        const my_pub_key = this._deps.profilesStore.myAgentPubKey;
        const fromMe = this.invitationEntryInfo.invitation.inviter === my_pub_key;
        return html `
      <span
        ><span class="secondary-text">from </span> ${fromMe
            ? 'you'
            : this._deps.profilesStore.profileOf(this.invitationEntryInfo.invitation.inviter).nickname}
      </span>
    `;
    }
    _haveYouInteracted() {
        const my_pub_key = this._deps.profilesStore.myAgentPubKey;
        const agents_who_already_interacted = this.invitationEntryInfo.invitees_who_accepted.concat(this.invitationEntryInfo.invitees_who_rejected);
        let result = agents_who_already_interacted.find(agent_pub_key => agent_pub_key === my_pub_key);
        if (result != undefined) {
            return true;
        }
        return false;
    }
    render() {
        if (this.loaded && this.invitationEntryInfo) {
            return html `
        <mwc-list-item
          id="element"
          twoline
          graphic="avatar"
          hasMeta
          @click="${this._clickHandler}"
        >
          <mwc-icon slot="graphic">mail</mwc-icon>

          ${this._invitationInviterAgent()}
          ${this.clicked &&
                !(this.invitationEntryInfo.invitation.inviter ===
                    this._deps.profilesStore.myAgentPubKey) &&
                !this._haveYouInteracted()
                ? this._invitationActionButtons()
                : this._invitationStatusInfo()}
        </mwc-list-item>
      `;
        }
    }
    getScopedElements() {
        return {
            'mwc-icon': Icon,
            'mwc-list': List,
            'mwc-list-item': ListItem,
            'mwc-tab': Tab,
            'mwc-tab-bar': TabBar,
            'mwc-button': Button,
            'mwc-snackbar': Snackbar,
        };
    }
}
InvitationItem.styles = css `
    .invitation_info {
      font-family: 'Roboto';

      padding: 0.3em;
      margin: 0.3em;
      border: 1px solid gray;

      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      color: rgba(0, 0, 0, 0.54);
      font-size: 14px;
      overflow: auto;
      width: auto;
      transition-property: all;
    }

    .data {
      padding: 1em;
      margin: 1em;
      display: flex;
      align-items: flex-start;

      color: rgba(0, 0, 0, 0.54);
      flex-direction: column;
      overflow-x: hidden;
    }

    .data .center {
      align-self: center;
    }
    .secondary-text {
      color: rgba(0, 0, 0, 0.54);
    }
  `;
__decorate([
    property({ type: Boolean })
], InvitationItem.prototype, "loaded", void 0);
__decorate([
    property({ type: String })
], InvitationItem.prototype, "invitation_entry_hash", void 0);
__decorate([
    property({ type: Boolean })
], InvitationItem.prototype, "clicked", void 0);
//# sourceMappingURL=invitation-item.js.map