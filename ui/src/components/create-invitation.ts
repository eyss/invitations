import { LitElement, css, html } from 'lit';
import { contextProvided } from '@holochain-open-dev/context';
import { state, property } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { msg } from '@lit/localize';

/**mwc-elements imports */
import {
  Card,
  List,
  Icon,
  Button,
  ListItem,
  Snackbar,
} from '@scoped-elements/material-web';

import { AgentAvatar, ProfilePrompt, SearchAgent } from '@holochain-open-dev/profiles';

import { InvitationsStore } from '../state/invitations-store';

import { invitationsStoreContext } from '../context';
import { AgentPubKeyB64, Dictionary } from '@holochain-open-dev/core-types';
import { sharedStyles } from '../shared-styles';
import { StoreSubscriber } from 'lit-svelte-stores';

/**
 * @element create-invitation-form
 */
export class CreateInvitation extends ScopedElementsMixin(LitElement) {
  
  @contextProvided({ context: invitationsStoreContext })
  _store!: InvitationsStore;

  @state()
  invitees: AgentPubKeyB64[] = [];

  _allProfiles = new StoreSubscriber(
    this,
    () => this._store?.profilesStore.knownProfiles
  );

  addInvitee(e: CustomEvent) {
    this.invitees = [...this.invitees, e.detail.agentPubKey];
  }

  removeInvitee(index: number) {
    this.invitees.splice(index, 1);
    this.requestUpdate();
  }

  async sendInvitation() {
    if (this.invitees.length > 0) {
      try {
        await this._store.sendInvitation(this.invitees);
        this.invitees = [];
      } catch (e) {
        (this.shadowRoot?.getElementById('error-message') as Snackbar).show();
      }
      await this._store.fetchMyPendingInvitations();
      this.requestUpdate();
    }
  }

  async _pedignInvitations() {
    await this._store.fetchMyPendingInvitations();
  }

  renderInviteesList() {
    return html`
      <mwc-list>
        ${this.invitees.map(
          (agentPubKey, index) => html` <mwc-list-item hasMeta graphic="avatar">
            <agent-avatar slot="graphic" .agentPubKey=${agentPubKey}>
            </agent-avatar>

            <span>${this._allProfiles.value[agentPubKey]?.nickname || ''}</span>
            <mwc-icon
              slot="meta"
              id="${agentPubKey}"
              @click=${() => this.removeInvitee(index)}
              >close</mwc-icon
            >
          </mwc-list-item>`
        )}
      </mwc-list>
    `;
  }

  renderInvitationError() {
    return html`<mwc-snackbar
      id="error-message"
      labelText="Can't send invitation. Please try again later."
    ></mwc-snackbar>`;
  }

  render() {
    return html`
      ${this.renderInvitationError()}
      <mwc-card style="flex: 1;">
        <div class="column" style="margin: 16px; flex: 1;">
          <span class="title" style="margin-bottom: 16px;"
            >Create Invitation</span
          >
          <search-agent
            @agent-selected="${this.addInvitee}"
            clear-on-select
            style="margin-bottom: 16px;"
          ></search-agent>

          <div
            class="flex-scrollable-parent"
            style="flex: 1; margin-bottom: 16px;"
          >
            <div class="flex-scrollable-container">
              <div class="flex-scrollable-y">${this.renderInviteesList()}</div>
            </div>
          </div>

          <mwc-button
            label="Send Invitation"
            @click=${this.sendInvitation}
            .disabled=${Object.keys(this.invitees).length === 0}
          >
            <mwc-icon slot="icon">send</mwc-icon>
          </mwc-button>
        </div>
      </mwc-card>
    `;
  }

  static get scopedElements() {
    return {
      'search-agent': SearchAgent,
      'agent-avatar': AgentAvatar,
      'profile-prompt': ProfilePrompt,
      'mwc-icon': Icon,
      'mwc-list': List,
      'mwc-card': Card,
      'mwc-list-item': ListItem,
      'mwc-snackbar': Snackbar,
      'mwc-button': Button,
    };
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          display: flex;
        }
      `,
    ];
  }
}

