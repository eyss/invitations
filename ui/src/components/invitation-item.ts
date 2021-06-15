
import { html, css } from 'lit';
import { state } from 'lit/decorators.js';

import { MobxLitElement } from '@adobe/lit-mobx';
import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import { requestContext } from '@holochain-open-dev/context';


/**mwc-elements imports */
import { Icon } from 'scoped-material-components/mwc-icon';
import { List } from 'scoped-material-components/mwc-list';
import { Button } from 'scoped-material-components/mwc-button';
import { ListItem } from 'scoped-material-components/mwc-list-item';


import { toJS } from 'mobx';
import { InvitationsStore } from '../invitations.store';


import { INVITATIONS_STORE_CONTEXT } from '../types';


/**
 * @element invitation-item
 * @fires invitation-completed - after the invitation its accepted by all the invitees
 */

export class InvitationItem extends ScopedRegistryHost(MobxLitElement) {

  @requestContext(INVITATIONS_STORE_CONTEXT)
  _store!: InvitationsStore;

  @state()
  loaded = false;
  @state()
  clicked = false;
  @state()
  invitation_entry_hash = '';

  static styles = css`
    .invitation {
      width:100%;
      display:grid;
      grid-template-columns: 0.3fr 0.7fr;
      padding: 1em;
      overflow-x:hidden;
    }

    .secondary-text {
      color: rgba(0, 0, 0, 0.54);
    }

`;

  get invitationEntryInfo() {
    return this._store.invitations[this.invitation_entry_hash];
  }
  get invitationStatus(): string {
    if (this.invitationEntryInfo.invitees_who_rejected.length > 0) {
      return 'rejected';
    }

    if (
      this.invitationEntryInfo.invitees_who_accepted.length ===
      this.invitationEntryInfo.invitation.invitees.length
    ) {
      return 'completed';
    }

    return 'pending';
  }
  async firstUpdated() {

    await this._store.profilesStore.fetchAgentProfile(
      this.invitationEntryInfo.invitation.inviter
    );

    this.invitationEntryInfo.invitation.invitees.map(async invitee_pub_key => {
      await this._store.profilesStore.fetchAgentProfile(invitee_pub_key);
    });

    this.loaded = true;
  }
  async _rejectInvitation() {
    await this._store.rejectInvitation(this.invitation_entry_hash);
  }
  async _acceptInvitation() {
    const invitation = toJS(
      this._store.invitations[this.invitation_entry_hash].invitation
    );

    await this._store.acceptInvitation(this.invitation_entry_hash);

    if (
      !this._store.invitations[this.invitation_entry_hash] ||
      this._store.isInvitationCompleted(this.invitation_entry_hash)
    ) {

      this.dispatchEvent(
        new CustomEvent('invitation-completed', {
          detail: { invitation },
          bubbles: true,
          composed: true,
        })
      )

    }
  }
  _clickHandler() {
    this.clicked = !this.clicked;
  }

  _invitationIcon() {
    if (this.invitationStatus == 'rejected') {
      return html`
       <mwc-icon slot="graphic">close</mwc-icon>
      `;
    } else {
      return html`
        ${this.invitationStatus == 'completed'
          ? html`<mwc-icon slot="graphic">check</mwc-icon>`
          : html`<mwc-icon slot="graphic">pending</mwc-icon>`}
      `;
    }
  }

  _invitationActionButtons() {

    if(!this._haveYouInteracted()){
      return html`      
        <mwc-button icon="check" @click="${this._acceptInvitation}">ACCEPT</mwc-button>
        <mwc-button icon="close" @click="${this._rejectInvitation}">REJECT</mwc-button>
      `;
    }else{
      return html``;
    }

  }
  _invitationInviterAgent() {
    const my_pub_key = this._store.profilesStore.myAgentPubKey;

    const fromMe = this.invitationEntryInfo.invitation.inviter === my_pub_key;

    return html`
      <span
        ><span class="secondary-text">from </span> ${fromMe
        ? 'you'
        : this._store.profilesStore.profileOf(
          this.invitationEntryInfo.invitation.inviter
        ).nickname}
      </span>
    `;
  }
  _haveYouInteracted() {
    const my_pub_key = this._store.profilesStore.myAgentPubKey;
    const agents_who_already_interacted =
      this.invitationEntryInfo.invitees_who_accepted.concat(
        this.invitationEntryInfo.invitees_who_rejected
      );
    const result = agents_who_already_interacted.find(
      agent_pub_key => agent_pub_key === my_pub_key
    );

    if (result != undefined) {
      return true;
    }
    return false;
  }

  _invitationStatusInfo() {

    if (this.invitationEntryInfo.invitees_who_rejected.length > 0) {

      return html`
      <span class="sencodary-text">
        rejected by :
        ${this.invitationEntryInfo.invitees_who_rejected.length}/${this
          .invitationEntryInfo.invitation.invitees.length}
        invitees
      </span>
      `;

    } else {
      return html`
        <span class="sencodary-text">
          accepted by :
          ${this.invitationEntryInfo.invitees_who_accepted.length}/${this
          .invitationEntryInfo.invitation.invitees.length}
          invitees
        </span>
        `;
    }
  }

  render() {
    if (this.loaded && this.invitationEntryInfo) {
      return html`
        <mwc-list-item
          id="element"
          graphic="avatar"
          hasMeta
          class="invitation"
          @click="${this._clickHandler}"
        >

        ${this._invitationIcon()}

        <div> 
         ${this._invitationInviterAgent()}
        </div>
        
        <div class="secondary-text">
          ${this._invitationStatusInfo()}
        </div>

        ${
          this._invitationActionButtons()
        }
       

        </mwc-list-item>
      `;
    }
  }
  static elementDefinitions = {
    'mwc-icon': Icon,
    'mwc-list': List,
    'mwc-button': Button,
    'mwc-list-item': ListItem,
  };
}