import {LitElement, html, css } from 'lit';
import { state, query } from 'lit/decorators.js';

import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { contextProvided } from '@lit-labs/context';
import {DynamicStore} from 'lit-svelte-stores'

/**mwc-elements imports */
import { Card, CircularProgress } from '@scoped-elements/material-web';

import { sharedStyles } from '../shared-styles';
import { InvitationItem } from './invitation-item';
import { InvitationsStore } from '../state/invitations-store';
import { invitationsStoreContext } from '../context';

/**
 * @element invitation-list
 */
export class InvitationsList extends ScopedElementsMixin(LitElement) {
  @contextProvided({context: invitationsStoreContext})
  _store!: InvitationsStore;

  _pendingInvitations = new DynamicStore(this, ()=> this._store.pendingInvitations);

  static styles = [
    css`
      .invitations {
        padding: 1em;
        margin: 1em;
        display: block;
        overflow-y: auto;
      }
    `,
    sharedStyles,
  ];

  @state()
  loaded = false;

  async firstUpdated() {
    await this._store.fetchMyPendingInvitations();
    this.loaded = true;
  }

  renderPendingInvitations() {
    if (Object.entries(this._pendingInvitations.value).length === 0)
      return html`<div class="column center-content" style="flex: 1;">
        <span class="placeholder">There are no pending invitations yet</span>
      </div>`;

    return html` <div class="flex-scrollable-parent" style="flex: 1;">
      <div class="flex-scrollable-container">
        <div class="flex-scrollable-y">
          ${Object.entries(this._pendingInvitations.value).map(element => {
            return html`<invitation-item
              .invitation_entry_hash=${element[1].invitation_entry_hash}
              @invitation-completed=${(e: CustomEvent) =>
                this.dispatchEvent(
                  new CustomEvent('invitation-completed', {
                    detail: e.detail,
                    bubbles: true,
                    composed: true,
                  })
                )}
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
          <span class="title" style="margin-bottom: 8px;"
            >Pending Invitations</span
          >
          ${this.loaded
            ? this.renderPendingInvitations()
            : html`<div class="column center-content" style="flex: 1;">
                <mwc-circular-progress indeterminate></mwc-circular-progress>
              </div>`}
        </div>
      </mwc-card>
    `;
  }

  static get scopedElements() {
    return {
      'mwc-card': Card,
      'invitation-item': InvitationItem,
      'mwc-circular-progress': CircularProgress,
    };
  }
}
