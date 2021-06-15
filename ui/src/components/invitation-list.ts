import { html, css } from 'lit';
import { state, query } from 'lit/decorators.js';

import { MobxLitElement } from '@adobe/lit-mobx';
import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import { requestContext } from '@holochain-open-dev/context';

import { sharedStyles } from '../shared-styles';
import { InvitationItem } from './invitation-item';
import { InvitationsStore } from '../invitations.store';
import { INVITATIONS_STORE_CONTEXT, Dictionary, AgentPubKey } from '../types';

/**mwc-elements imports */
import { Card } from 'scoped-material-components/mwc-card';
import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';


/**
 * @element invitation-list
 */

export class InvitationsList extends ScopedRegistryHost(MobxLitElement) {

  @requestContext(INVITATIONS_STORE_CONTEXT)
  _store!: InvitationsStore;

  static styles = [css`
    .invitations {
      padding: 1em;
      margin: 1em;
      display: block;
      overflow-y: auto;
    }
  `, sharedStyles];

  @state()
  loaded = false;

  async firstUpdated() {
    await this._store.fetchMyPendingInvitations();
    this.loaded = true;
  }

  renderPendingInvitations() {
    if (Object.entries(this._store.invitations).length === 0)
      return html`<div class="column center-content" style="flex: 1;">
        <span class="placeholder">There are no pending invitations yet</span>
      </div>`;

    return html` <div class="flex-scrollable-parent" style="flex: 1; overflow-x:hidden;">
      <div class="flex-scrollable-container"  >
        <div class="flex-scrollable-y" style="flex: 1; overflow-x:hidden;" >
          ${Object.entries(this._store.invitations).map(element => {
      return html`<invitation-item
              .invitation_entry_hash=${element[1].invitation_entry_hash}
            >
            </invitation-item>`;
    })}
        </div>
      </div>
    </div>`;
  }

  render() {
    
    return html`
      <mwc-card style="flex: 1;">
        <div class="column" style="margin: 16px; flex: 1;">
          <span class="title" style="margin-bottom: 8px;">Pending Invitations</span>
          ${this.loaded
            ? this.renderPendingInvitations()
            : html`<div class="column center-content" style="flex: 1;">
                <mwc-circular-progress indeterminate></mwc-circular-progress>
              </div>`}
        </div>
      </mwc-card>
    `;
  }

  static elementDefinitions = {
    'mwc-card': Card,
    'invitation-item': InvitationItem,
    'mwc-circular-progress': CircularProgress,
  };
}