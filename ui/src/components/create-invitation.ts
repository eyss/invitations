import { MobxReactionUpdate } from '@adobe/lit-mobx';
import {
  BaseElement,
  connectDeps,
  DepsElement,
} from '@holochain-open-dev/common';
import {
  CreateProfileForm,
  Dictionary,
  ProfilePrompt,
  SearchAgent,
} from '@holochain-open-dev/profiles';
import { html, css, property } from 'lit-element';
import { InvitationsStore } from '../invitations.store';
import { InvitationItem } from './invitation-item';

import { Button } from 'scoped-material-components/mwc-button';

import { Icon } from '@material/mwc-icon';
import { List } from 'scoped-material-components/mwc-list';
import { ListItem } from '@material/mwc-list/mwc-list-item';
import { Card } from 'scoped-material-components/mwc-card';

import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';

import { AgentPubKey } from '../types';
import { sharedStyles } from '../shared-styles';

export abstract class CreateInvitation
  extends MobxReactionUpdate(BaseElement)
  implements DepsElement<InvitationsStore>
{
  abstract get _deps(): InvitationsStore;

  static styles = [sharedStyles];

  @property({ type: Array })
  invitees: Dictionary<String> = {};

  _addInvitee(e: CustomEvent) {
    // console.log(e.detail.agent.profile.nickname);

    this.invitees[e.detail.agent.agent_pub_key] =
      e.detail.agent.profile.nickname;
    this.requestUpdate();
  }

  _removeInvitee(e: Event) {
    let node: any = e.target;
    delete this.invitees[node.id];
    this.requestUpdate();
  }

  async _sendInvitation() {
    //this is the input for the create invitation method define in the holochain side
    let invitees_list: AgentPubKey[] = [];

    Object.entries(this.invitees).map(element => {
      invitees_list.push(element[0]);

      delete this.invitees[element[0]];
    });

    await this._deps.sendInvitation(invitees_list);

    await this._deps.fetchMyPendingInvitations();

    this.requestUpdate();
  }

  async _pedignInvitations() {
    await this._deps.fetchMyPendingInvitations();
  }

  renderInviteesList() {
    return html`
      <mwc-list>
        ${Object.entries(this.invitees).map(element => {
          return html` <mwc-list-item hasMeta>
            <span>${element[1]}</span>
            <mwc-icon
              slot="meta"
              id="${element[0]}"
              @click="${this._removeInvitee}"
              >close</mwc-icon
            >
          </mwc-list-item>`;
        })}
      </mwc-list>
    `;
  }

  render() {
    return html`
      <mwc-card style="flex: 1;">
        <div class="column" style="margin: 16px; flex: 1;">
          <span class="title" style="margin-bottom: 16px;"
            >Create Invitation</span
          >
          <search-agent
            @agent-selected="${this._addInvitee}"
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

          <mwc-button label="Send Invitation" @click=${this._sendInvitation}>
            <mwc-icon slot="icon">send</mwc-icon>
          </mwc-button>
        </div>
      </mwc-card>
    `;
  }

  getScopedElements() {
    return {
      'mwc-circular-progress': CircularProgress,
      'mwc-icon': Icon,
      'mwc-list': List,
      'mwc-card': Card,
      'mwc-list-item': ListItem,
      'mwc-button': Button,
      'search-agent': connectDeps(SearchAgent, this._deps.profilesStore),
    };
  }
}
