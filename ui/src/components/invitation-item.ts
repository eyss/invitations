import { html, css } from 'lit';
import { state } from 'lit/decorators.js';

import { MobxLitElement } from '@adobe/lit-mobx';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { requestContext } from '@holochain-open-dev/context';

/**mwc-elements imports */
import { Icon } from 'scoped-material-components/mwc-icon';
import { List } from 'scoped-material-components/mwc-list';
import { Button } from 'scoped-material-components/mwc-button';
import { ListItem } from 'scoped-material-components/mwc-list-item';

import { toJS } from 'mobx';
import { InvitationsStore } from '../invitations.store';

import { INVITATIONS_STORE_CONTEXT } from '../types';
import {
  ProfilesStore,
  PROFILES_STORE_CONTEXT,
} from '@holochain-open-dev/profiles';

/**
 * @element invitation-item
 * @fires invitation-completed - after the invitation its accepted by all the invitees
 */

export class InvitationItem extends ScopedElementsMixin(MobxLitElement) {
  @requestContext(INVITATIONS_STORE_CONTEXT)
  _store!: InvitationsStore;
  @requestContext(PROFILES_STORE_CONTEXT)
  _profilesStore!: ProfilesStore;

  @state()
  loaded = false;
  @state()
  clicked = false;
  @state()
  invitation_entry_hash = '';

  static styles = css`
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

  get fromMe() {
    const my_pub_key = this._profilesStore.myAgentPubKey;

    return this.invitationEntryInfo.invitation.inviter === my_pub_key;
  }

  async firstUpdated() {
    await this._profilesStore.fetchAgentProfile(
      this.invitationEntryInfo.invitation.inviter
    );

    this.invitationEntryInfo.invitation.invitees.map(async invitee_pub_key => {
      await this._profilesStore.fetchAgentProfile(invitee_pub_key);
    });

    this.loaded = true;
  }
  async _rejectInvitation() {
    const result = await this._store.rejectInvitation(
      this.invitation_entry_hash
    );
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
      );
    }
  }
  _clickHandler() {
    this.clicked = !this.clicked;
  }

  _invitationIcon() {
    if (this.invitationStatus == 'rejected') {
      return html` <mwc-icon slot="graphic">close</mwc-icon> `;
    } else {
      return html`
        ${this.invitationStatus == 'completed'
          ? html`<mwc-icon slot="graphic">check</mwc-icon>`
          : html`<mwc-icon slot="graphic">pending</mwc-icon>`}
      `;
    }
  }

  _invitationActionButtons() {
    if (this._haveYouInteracted() || this.fromMe) return html``;
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
  _invitationInviterAgent() {
    return html`
      <span
        ><span class="secondary-text">from </span> ${this.fromMe
          ? 'you'
          : this._profilesStore.profileOf(
              this.invitationEntryInfo.invitation.inviter
            ).nickname}
      </span>
    `;
  }
  _haveYouInteracted() {
    const my_pub_key = this._profilesStore.myAgentPubKey;
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
  render() {
    if (this.loaded && this.invitationEntryInfo) {
      return html`
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
  static elementDefinitions = {
    'mwc-icon': Icon,
    'mwc-list': List,
    'mwc-button': Button,
    'mwc-list-item': ListItem,
  };
}
