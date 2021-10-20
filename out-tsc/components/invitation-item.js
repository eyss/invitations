import { __decorate } from "tslib";
import { html, css, LitElement } from 'lit';
import { state } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { contextProvided } from '@lit-labs/context';
import { StoreSubscriber } from 'lit-svelte-stores';
/**mwc-elements imports */
import { List, Icon, Button, ListItem } from '@scoped-elements/material-web';
import { invitationsStoreContext } from '../context';
import { profilesStoreContext, } from '@holochain-open-dev/profiles';
import { getInvitationStatus, isInvitationCompleted } from '../state/selectors';
import { InvitationStatus } from '../types';
/**
 * @element invitation-item
 * @fires invitation-completed - after the invitation its accepted by all the invitees
 */
export class InvitationItem extends ScopedElementsMixin(LitElement) {
    constructor() {
        super(...arguments);
        this.loaded = false;
        this.clicked = false;
        this.invitationEntryHash = '';
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
    async firstUpdated() {
        await this._profilesStore.fetchAgentProfile(this._invitation.value.invitation.inviter);
        const promises = this._invitation.value.invitation.invitees.map(invitee_pub_key => this._profilesStore.fetchAgentProfile(invitee_pub_key));
        await Promise.all(promises);
        this.loaded = true;
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
    _invitationIcon() {
        if (this.invitationStatus === InvitationStatus.Rejected) {
            return html ` <mwc-icon slot="graphic">close</mwc-icon> `;
        }
        else {
            return html `
        ${this.invitationStatus === InvitationStatus.Completed
                ? html `<mwc-icon slot="graphic">check</mwc-icon>`
                : html `<mwc-icon slot="graphic">pending</mwc-icon>`}
      `;
        }
    }
    _invitationActionButtons() {
        if (this._haveYouInteracted() || this.fromMe)
            return html ``;
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
        if (this.fromMe) {
            return html `
        <span>
          <span class="secondary-text">to </span>
          ${this._knownProfiles.value[this._invitation.value.invitation.invitees[0]].nickname}
        </span>
      `;
        }
        else
            return html `
        <span
          ><span class="secondary-text">from </span>
          ${this._knownProfiles.value[this._invitation.value.invitation.inviter]
                .nickname}
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
        if (this.loaded && this._invitation.value) {
            return html `
        <mwc-list-item
          id="element"
          twoline
          graphic="avatar"
          hasMeta
          @click="${this._clickHandler}"
        >
          ${this._invitationIcon()} ${this._invitationInviterAgent()}
          ${this._invitationActionButtons()}
        </mwc-list-item>
      `;
        }
    }
    static get scopedElements() {
        return {
            'mwc-icon': Icon,
            'mwc-list': List,
            'mwc-button': Button,
            'mwc-list-item': ListItem,
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
    contextProvided({ context: invitationsStoreContext })
], InvitationItem.prototype, "_store", void 0);
__decorate([
    contextProvided({ context: profilesStoreContext })
], InvitationItem.prototype, "_profilesStore", void 0);
__decorate([
    state()
], InvitationItem.prototype, "loaded", void 0);
__decorate([
    state()
], InvitationItem.prototype, "clicked", void 0);
__decorate([
    state()
], InvitationItem.prototype, "invitationEntryHash", void 0);
//# sourceMappingURL=invitation-item.js.map