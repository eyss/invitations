import { __decorate } from "tslib";
import { html, css, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { contextProvided } from '@holochain-open-dev/context';
import { StoreSubscriber } from 'lit-svelte-stores';
/**mwc-elements imports */
import { List, Icon, Button, ListItem } from '@scoped-elements/material-web';
import { invitationsStoreContext } from '../context';
import { AgentAvatar, profilesStoreContext, } from '@holochain-open-dev/profiles';
import { getInvitationStatus, isInvitationCompleted } from '../state/selectors';
import { InvitationStatus } from '../types';
import { SlBadge } from '@scoped-elements/shoelace';
/**
 * @element invitation-item
 * @fires invitation-completed - after the invitation its accepted by all the invitees
 */
export class InvitationItem extends ScopedElementsMixin(LitElement) {
    constructor() {
        super(...arguments);
        this.clicked = false;
        this._invitation = new StoreSubscriber(this, () => this._store.invitationInfo(this.invitationEntryHash));
        this._knownProfiles = new StoreSubscriber(this, () => this._profilesStore.knownProfiles);
    }
    get invitationStatus() {
        return getInvitationStatus(this._invitation.value);
    }
    get fromMe() {
        const my_pub_key = this._profilesStore.myAgentPubKey;
        return this._invitation.value.invitation.inviter === my_pub_key;
    }
    async _clearInvitation() {
        await this._store.clearInvitation(this.invitationEntryHash);
    }
    async _rejectInvitation() {
        const result = await this._store.rejectInvitation(this.invitationEntryHash);
    }
    async _acceptInvitation() {
        await this._store.acceptInvitation(this.invitationEntryHash);
        if (isInvitationCompleted(this._invitation.value)) {
            this.dispatchEvent(new CustomEvent('invitation-completed', {
                detail: this._invitation.value,
                bubbles: true,
                composed: true,
            }));
        }
    }
    _clickHandler() {
        this.clicked = !this.clicked;
    }
    _invitationStatus() {
        if (this.invitationStatus === InvitationStatus.Rejected) {
            return html `<sl-badge pill variant="danger">Rejected</sl-badge> `;
        }
        else if (this.invitationStatus === InvitationStatus.Completed) {
            return html `<sl-badge pill variant="success">Accepted</sl-badge>`;
        }
        else {
            return html `<sl-badge pill variant="warning">Pending</sl-badge> `;
        }
    }
    _invitationActionButtons() {
        if (this._haveYouInteracted())
            return html ``;
        if (this.fromMe) {
            if (this.invitationStatus === InvitationStatus.Rejected) {
                return html `
          <span slot="secondary">
            <mwc-button icon="clear_all" @click="${this._clearInvitation}"
              >Clear</mwc-button
            >
          </span>
        `;
            }
            else {
                return html ``;
            }
        }
        else {
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
    }
    _invitationInviterAgent() {
        var _a, _b;
        if (this.fromMe) {
            return html `
        <span>
          <span class="secondary-text">to </span>
          ${(_a = this._knownProfiles.value[this._invitation.value.invitation.invitees[0]]) === null || _a === void 0 ? void 0 : _a.nickname}
        </span>
      `;
        }
        else
            return html `
        <span
          ><span class="secondary-text">from </span>
          ${(_b = this._knownProfiles.value[this._invitation.value.invitation.inviter]) === null || _b === void 0 ? void 0 : _b.nickname}
        </span>
      `;
    }
    _haveYouInteracted() {
        const my_pub_key = this._profilesStore.myAgentPubKey;
        const agents_who_already_interacted = this._invitation.value.invitees_who_accepted.concat(this._invitation.value.invitees_who_rejected);
        const result = agents_who_already_interacted.find(agent_pub_key => agent_pub_key === my_pub_key);
        if (result != undefined) {
            return true;
        }
        return false;
    }
    render() {
        var _a;
        if (this._invitation.value) {
            return html `
        <div class="row" style="flex: 1;">
          <mwc-list-item
            id="element"
            twoline
            graphic="avatar"
            @click="${this._clickHandler}"
            style="flex: 1;"
          >
            <agent-avatar
              slot="graphic"
              .agentPubKey=${(_a = this._invitation.value) === null || _a === void 0 ? void 0 : _a.invitation.inviter}
            ></agent-avatar>
            ${this._invitationInviterAgent()} ${this._invitationActionButtons()}
          </mwc-list-item>
          <div style="align-self: center; margin-right: 16px;">
            ${this._invitationStatus()}
          </div>
        </div>
      `;
        }
    }
    static get scopedElements() {
        return {
            'agent-avatar': AgentAvatar,
            'mwc-icon': Icon,
            'mwc-list': List,
            'sl-badge': SlBadge,
            'mwc-button': Button,
            'mwc-list-item': ListItem,
        };
    }
}
InvitationItem.styles = css `
    .row {
      display: flex;
      flex-direction: row;
    }

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
    contextProvided({ context: invitationsStoreContext })
], InvitationItem.prototype, "_store", void 0);
__decorate([
    contextProvided({ context: profilesStoreContext })
], InvitationItem.prototype, "_profilesStore", void 0);
__decorate([
    property({ type: String, attribute: 'invitation-entry-hash' })
], InvitationItem.prototype, "invitationEntryHash", void 0);
__decorate([
    state()
], InvitationItem.prototype, "clicked", void 0);
//# sourceMappingURL=invitation-item.js.map