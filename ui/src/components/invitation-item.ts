import { html, css, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';

import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { contextProvided } from '@holochain-open-dev/context';
import { StoreSubscriber } from 'lit-svelte-stores';

/**mwc-elements imports */
import { List, Icon, Button, ListItem } from '@scoped-elements/material-web';

import { InvitationsStore } from '../state/invitations-store';

import { invitationsStoreContext } from '../context';
import {
  AgentAvatar,
  ProfilesStore,
  profilesStoreContext,
} from '@holochain-open-dev/profiles';
import { getInvitationStatus, isInvitationCompleted } from '../state/selectors';
import { InvitationStatus } from '../types';
import { SlBadge } from '@scoped-elements/shoelace';
import { EntryHashB64 } from '@holochain-open-dev/core-types';

/**
 * @element invitation-item
 * @fires invitation-completed - after the invitation its accepted by all the invitees
 */
export class InvitationItem extends ScopedElementsMixin(LitElement) {
  @contextProvided({ context: invitationsStoreContext })
  _store!: InvitationsStore;
  @contextProvided({ context: profilesStoreContext })
  _profilesStore!: ProfilesStore;

  @property({ type: String, attribute: 'invitation-entry-hash' })
  invitationEntryHash!: EntryHashB64;

  @state()
  clicked = false;
  
  @state()
  _locked = false;
  
  _invitation = new StoreSubscriber(this, () =>
    this._store.invitationInfo(this.invitationEntryHash)
  );
  _knownProfiles = new StoreSubscriber(
    this,
    () => this._profilesStore.knownProfiles
  );

  get invitationStatus(): InvitationStatus {
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
    if(!this._locked){
      this._locked = true
      const result = await this._store.rejectInvitation(this.invitationEntryHash);
      this._locked = false
    }
  }

  async _acceptInvitation() {
    if(!this._locked){
      this._locked = true
      await this._store.acceptInvitation(this.invitationEntryHash)
      this._locked = false
    
      if (isInvitationCompleted(this._invitation.value)) {
        this.dispatchEvent(
          new CustomEvent('invitation-completed', {
            detail: this._invitation.value,
            bubbles: true,
            composed: true,
          })
        );
      } else{
        console.warn("invitation was not accepted, try again")
      }
    }
  }

  _clickHandler() {
    this.clicked = !this.clicked;
  }

  _invitationStatus() {
    if (this.invitationStatus === InvitationStatus.Rejected) {
      return html`<sl-badge pill variant="danger">Rejected</sl-badge> `;
    } else if (this.invitationStatus === InvitationStatus.Completed) {
      return html`<sl-badge pill variant="success">Accepted</sl-badge>`;
    } else {
      return html`<sl-badge pill variant="warning">Pending</sl-badge> `;
    }
  }

  _invitationActionButtons() {
    if (this._haveYouInteracted()) return html``;
    if (this.fromMe) {
      if (this.invitationStatus === InvitationStatus.Rejected) {
        return html`
          <span slot="secondary">
            <mwc-button icon="clear_all" @click="${this._clearInvitation}"
              >Clear</mwc-button
            >
          </span>
        `;
      } else {
        return html``;
      }
    } else {
      return html`
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
    if (this.fromMe) {
      return html`
        <span>
          <span class="secondary-text">to </span>
          ${this._knownProfiles.value[
            this._invitation.value.invitation.invitees[0]
          ]?.nickname}
        </span>
      `;
    } else
      return html`
        <span
          ><span class="secondary-text">from </span>
          ${this._knownProfiles.value[this._invitation.value.invitation.inviter]
            ?.nickname}
        </span>
      `;
  }

  _haveYouInteracted() {
    const my_pub_key = this._profilesStore.myAgentPubKey;
    const agents_who_already_interacted =
      this._invitation.value.invitees_who_accepted.concat(
        this._invitation.value.invitees_who_rejected
      );
    const result = agents_who_already_interacted.find(
      agent_pub_key => agent_pub_key === my_pub_key
    );

    if (result != undefined) {
      return true;
    }

    return false;
  }
  render() {
    if (this._invitation.value) {
      if (this._locked){
        return html`<div class="row" style="flex: 1;">
          <div class="fill center-content">
            Synching network, retry if your action fails  <mwc-circular-progress indeterminate></mwc-circular-progress>
          </div>
        </div>`; 
      }
      return html`
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
              .agentPubKey=${this._invitation.value?.invitation.inviter}
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

  static styles = css`
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
}
