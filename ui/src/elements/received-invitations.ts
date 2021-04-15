import { html, css, LitElement, property } from 'lit-element';
import {
  BaseElement,
  connectDeps,
  DepsElement,
} from '@holochain-open-dev/common';
import { MobxReactionUpdate } from '@adobe/lit-mobx';
import { InvitationsStore } from '../invitations.store';

export abstract class ReceivedInvitations
  extends MobxReactionUpdate(BaseElement)
  implements DepsElement<InvitationsStore> {
  @property({ type: String }) title = 'Hey there';

  @property({ type: Number }) counter = 5;

  abstract get _deps(): InvitationsStore;

  async firstUpdated() {
    await this._deps.fetchMyReceivedInvititations();
  }

  render() {
    return html`
      ${Object.values(this._deps.receivedInvitations).map(
        invitation => html`${invitation}`
      )}
    `;
  }
}
