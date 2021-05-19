import {
  BaseElement,
  connectDeps,
  DepsElement,
} from '@holochain-open-dev/common';
import { html, css, LitElement, property, query, queryAll } from 'lit-element';
import { InvitationsStore } from '../invitations.store';

import { Icon } from '@material/mwc-icon';
import { List } from '@material/mwc-list';
import { ListItem } from '@material/mwc-list/mwc-list-item';
import { Button } from '@material/mwc-button';
import { Snackbar } from '@material/mwc-snackbar';

import { TabBar } from '@material/mwc-tab-bar';
import { Tab } from '@material/mwc-tab';
import { InvitationEntryInfo } from '../types';
import { MobxReactionUpdate } from '@adobe/lit-mobx';
import { AgentPubKey } from '@holochain/conductor-api';
import { promises } from 'dns';
import {
  Dictionary,
  Profile,
  ProfilePrompt,
} from '@holochain-open-dev/profiles';
import { Profiler } from 'inspector';
import { ok } from 'assert';

export abstract class InvitationItem
  extends MobxReactionUpdate(BaseElement)
  implements DepsElement<InvitationsStore> {
  abstract get _deps(): InvitationsStore;

  @property({ type: Boolean })
  loaded = false;

  @property({ type: String })
  invitation_entry_hash = '';

  @property({ type: Boolean })
  clicked = false;

  static styles = css`
    .invitation_info {
      // color: green;
      // background-color: red;
      font-family: 'Roboto';

      padding: 0.3em;
      margin: 0.3em;
      border: 1px solid gray;
      // height : 100px;

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
      // justify-content: flex-start;
      // border: 1px solid gray;

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

  async getAgentProfile(AgentPubKey: string): Promise<Profile> {
    let agentProfile: any = this._deps.profilesStore.profileOf(AgentPubKey);

    if (agentProfile) {
      return agentProfile;
    } else {
      await this._deps.profilesStore.fetchAgentProfile(AgentPubKey);
      return this._deps.profilesStore.profiles[AgentPubKey];
    }
  }

  get invitationEntryInfo() {
    return this._deps.invitations[this.invitation_entry_hash];
  }

  async firstUpdated() {
    // this.invitation_entry_info = this._deps.invitations[this.invitation_entry_hash];
    // this.setInvitationStatus();

    // this.profiles[this.invitation_entry_info.invitation.inviter] = await this.getAgentProfile(this.invitation_entry_info.invitation.inviter);

    await this._deps.profilesStore.fetchAgentProfile(this.invitationEntryInfo.invitation.inviter);

    this.invitationEntryInfo.invitation.invitees.map(async invitee_pub_key => {
      await this._deps.profilesStore.fetchAgentProfile(invitee_pub_key);
    });

    // this.invitation_entry_info.invitation.timestamp = new Date(this.invitation_entry_info.invitation.timestamp.secs * 1000);
    this.loaded = true;
  }

  async _rejectInvitation() {
    let result = await this._deps.rejectInvitation(this.invitation_entry_hash);
  }

  async _acceptInvitation() {
    //añadir el handler

    this._deps.acceptInvitation(this.invitation_entry_hash).then(()=>{

      console.log("you have clicked on accept here");
      
      if(this.invitationEntryInfo.invitation.invitees.length ===
         this.invitationEntryInfo.invitees_who_accepted.length + 1
      ){

        let invitees = [...this.invitationEntryInfo.invitation.invitees, this.invitationEntryInfo.invitation.inviter
        ];

        invitees = invitees.filter(
          invitee => this._deps.profilesStore.myAgentPubKey != invitee
        )

        let myEvent = new CustomEvent('invitation-completed', {
          detail: { invitees },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(myEvent);

      }

    });

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

  _clickHandler() {
    this.clicked = !this.clicked;
  }

  _invitationStatusInfo() {
    if (this.invitationStatus == 'rejected') {
      return html`
        <span slot="secondary">
          rejected by :
          ${this.invitationEntryInfo.invitees_who_rejected.length}/${this
            .invitationEntryInfo.invitation.invitees.length}
          invitees
        </span>
        <mwc-icon slot="meta">close</mwc-icon>
      `;
    } else {
      return html`
        <span slot="secondary">
          accepted by :
          ${this.invitationEntryInfo.invitees_who_accepted.length}/${this
            .invitationEntryInfo.invitation.invitees.length}
          invitees
        </span>
        ${this.invitationStatus == 'completed'
          ? html`<mwc-icon slot="meta">check</mwc-icon>`
          : html`<mwc-icon slot="meta">pending</mwc-icon>`}
      `;
    }
  }

  _invitationActionButtons() {
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
    const my_pub_key = this._deps.profilesStore.myAgentPubKey;

    if (this.invitationEntryInfo.invitation.inviter === my_pub_key) {
      return html`
        <span>from <span class="secondary-text"> you </span> </span>
      `;
    } else {

      return html`
        <span>from
          <span class="secondary-text">
            ${this._deps.profilesStore.profileOf(
              this.invitationEntryInfo.invitation.inviter
            ).nickname}</span
          >
        </span>
      `;

    }
  }

  _haveYouInteracted() {
    const my_pub_key = this._deps.profilesStore.myAgentPubKey;
    const agents_who_already_interacted = this.invitationEntryInfo.invitees_who_accepted.concat(
      this.invitationEntryInfo.invitees_who_rejected
    );
    let result = agents_who_already_interacted.find(
      agent_pub_key => agent_pub_key === my_pub_key
    );

    if (result != undefined) {
      return true;
    }

    return false;
  }

  render() {
    if (this.loaded) {
      return html`
        <mwc-list-item
          id="element"
          twoline
          graphic="avatar"
          hasMeta
          @click="${this._clickHandler}"
        >
          <mwc-icon slot="graphic">mail</mwc-icon>

          ${this._invitationInviterAgent()}
          ${this.clicked &&
          !(
            this.invitationEntryInfo.invitation.inviter ===
            this._deps.profilesStore.myAgentPubKey
          ) &&
          !this._haveYouInteracted()
            ? this._invitationActionButtons()
            : this._invitationStatusInfo()}
        </mwc-list-item>
      `;
    }
  }

  getScopedElements() {
    return {
      'mwc-icon': Icon,
      'mwc-list': List,
      'mwc-list-item': ListItem,
      'mwc-tab': Tab,
      'mwc-tab-bar': TabBar,
      'mwc-button': Button,
      'mwc-snackbar': Snackbar,
    };
  }
}

// twoline graphic="avatar" hasMeta
// <span>Invitation Entry</span>
// <span slot="secondary">${this.invitation_entry_info.invitation_entry_hash} </span>
// <mwc-icon slot="graphic">mail</mwc-icon>
// <mwc-button slot="meta">Hola</mwc-button>

// <div style="display:flex" class="list-item" >

// <mwc-list-item class="no-hover" twoline graphic="avatar" hasMeta>

//   <span>Invitation Entry</span>
//   <span slot="secondary">${this.invitation_entry_info.invitation_entry_hash} </span>
//   <mwc-icon slot="graphic">mail</mwc-icon>

// </mwc-list-item>

// <mwc-button slot="meta" style="align-self:center;">Hola</mwc-button>

// </div>

// <mwc-button  style="align-self:center;">Hola</mwc-button>
