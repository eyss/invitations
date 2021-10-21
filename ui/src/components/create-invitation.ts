import { LitElement, css, html } from 'lit';
import { contextProvided } from '@lit-labs/context';
import { state, query } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';

/**mwc-elements imports */
import {
  Card,
  List,
  Icon,
  Button,
  ListItem,
  Snackbar,
} from '@scoped-elements/material-web';

import { ProfilePrompt, SearchAgent } from '@holochain-open-dev/profiles';

import { InvitationsStore } from '../state/invitations-store';

import { invitationsStoreContext } from '../context';
import { AgentPubKeyB64, Dictionary } from '@holochain-open-dev/core-types';
import { sharedStyles } from '../shared-styles';

/**
 * @element create-invitation-form
 */
export class CreateInvitation extends ScopedElementsMixin(LitElement) {
  @contextProvided({ context: invitationsStoreContext })
  _store!: InvitationsStore;

  @state()
  invitees: Dictionary<string> = {};

  addInvitee(e: CustomEvent) {
    this.invitees[e.detail.agent.agent_pub_key] =
      e.detail.agent.profile.nickname;
    this.requestUpdate();
  }

  removeInvitee(e: Event) {
    const node: any = e.target;
    delete this.invitees[node.id];
    this.requestUpdate();
  }

  async sendInvitation() {
    //this is the input for the create invitation method define in the holochain side
    const invitees_list: AgentPubKeyB64[] = [];

    Object.entries(this.invitees).map(element => {
      invitees_list.push(element[0]);
      delete this.invitees[element[0]];
    });

    if (invitees_list.length > 0) {
      try {
        await this._store.sendInvitation(invitees_list);
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
    const invitees = Object.entries(this.invitees);
    return html`
      <mwc-list>
        ${invitees.map(element => {
          const invitee_nickname = element[1];

          return html` <mwc-list-item hasMeta>
            <span>${invitee_nickname}</span>
            <mwc-icon
              slot="meta"
              id="${element[0]}"
              @click="${this.removeInvitee}"
              >close</mwc-icon
            >
          </mwc-list-item>`;
        })}
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
