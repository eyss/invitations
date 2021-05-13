import { MobxReactionUpdate } from '@adobe/lit-mobx';
import {
  BaseElement,
  connectDeps,
  DepsElement,
} from '@holochain-open-dev/common';

import { SearchAgent } from '@holochain-open-dev/profiles';
import { html, css, LitElement, property } from 'lit-element';
import { InvitationsStore } from '../invitations.store';
import { InvitationItem } from './invitation-item';

import { Icon } from '@material/mwc-icon';
import { List } from '@material/mwc-list';
import { ListItem } from '@material/mwc-list/mwc-list-item';

import { InvitationEntryInfo } from '../types';

export abstract class InvitationsList
  extends MobxReactionUpdate(BaseElement)
  implements DepsElement<InvitationsStore> {
  abstract get _deps(): InvitationsStore;

  static styles = css`
    .invitations {
      width: 50%;
      padding: 1em;
      margin: 1em;
      display: block;
      overflow-y: auto;
    }
  `;

  async firstUpdated() {    

    await this._deps.fectMyPendingInvitations();
  }

  render() {
    return html`
      <div class="invitations">
        ${
          Object.entries(this._deps.invitations).map(element => {
            return html`<invitation-item .invitation_entry_hash=${element[1].invitation_entry_hash}> </invitation-item>`;
          })
        }
      </div>
    `;
  }

  getScopedElements() {
    return {
      'invitation-item': connectDeps(InvitationItem, this._deps),
    };
  }
}

