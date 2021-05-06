import {
  BaseElement,
  connectDeps,
  DepsElement,
} from '@holochain-open-dev/common';
import { html, css, LitElement, property } from 'lit-element';
import { InvitationsStore } from '../invitations.store';

import { Icon } from '@material/mwc-icon';
import { List } from '@material/mwc-list';
import { ListItem } from '@material/mwc-list/mwc-list-item';
import { Button } from '@material/mwc-button';

import { TabBar } from '@material/mwc-tab-bar';
import { Tab } from '@material/mwc-tab';
import { InvitationEntryInfo } from '../types';
import {  MobxReactionUpdate } from '@adobe/lit-mobx';

export abstract class InvitationItem
  extends MobxReactionUpdate(BaseElement)
  implements DepsElement<InvitationsStore> {

  abstract get _deps(): InvitationsStore;

  @property({ type: Boolean })
  activated = false; // this actived the invitation info div

  @property({ type: String })
  status = 'pending'; //(this status can be pending, accepted or rejected)

  @property({ type: String })
  icon = '';

  @property({ type: Number })
  active_tab = 0;

  @property({ type: Object })
  invitation_entry_info: InvitationEntryInfo = {
    invitation: {
      inviter: '',
      invitees: [],
      timestamp: '',
    },

    invitation_entry_hash: '',
    invitation_header_hash: '',
    invitees_who_accepted: [],
    invitees_who_rejected: [],
  };

  @property({ type: String })
  invitation_entry_hash = '';

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
    .secondary-text{
      color: rgba(0, 0, 0, 0.54)
    }
  

  `;

  firstUpdated() {
    this.invitation_entry_info = this._deps.invitations[this.invitation_entry_hash];
    this.setInvitationStatus();
  }

  async _updateItemInfo(){
    // await this._deps.fectMyPendingInvitations();//this statement its called from the store 
    this.invitation_entry_info = this._deps.invitations[this.invitation_entry_hash];
    this.requestUpdate();
  }


  async _rejectInvitation(){
    console.log("Rejecting invitation");
    await this._deps.rejectInvitation(this.invitation_entry_hash);
    await this._updateItemInfo();
  }

  async _aceptInvitation(){
    console.log("Acepcting invitation");
    await this._deps.acceptInvitation(this.invitation_entry_hash);
    await this._updateItemInfo();
  }

  setInvitationStatus() {

    if (this.invitation_entry_info.invitees_who_rejected.length > 0) {
      this.status = 'rejected';
      return;
    }
    if (
      this.invitation_entry_info.invitees_who_accepted.length ==
      this.invitation_entry_info.invitation.invitees.length
    ) {
      this.status = 'accepted';
     

      return;
    }
    this.status = 'pending';
    
    return;
  }

  render() {

    return html`
      <mwc-list-item twoline graphic="avatar" hasMeta @click="${this._toggle}" >
      
        <mwc-icon slot="graphic">mail</mwc-icon>
        <span>Invitation Entry:   <span class="secondary-text"> ${this.status}</span> </span>

        ${this.status == "rejected"?
          html`
            <span slot="secondary"> rejected by : ${this.invitation_entry_info.invitees_who_rejected.length}/${this.invitation_entry_info.invitation.invitees.length} invitees </span>
          `:
          html`
            <span slot="secondary"> accepted by : ${this.invitation_entry_info.invitees_who_accepted.length}/${this.invitation_entry_info.invitation.invitees.length} invitees </span>
            `
          }
          <mwc-icon slot="meta">info</mwc-icon>

      </mwc-list-item>


    ${this.activated
      ? html` <div class="">
          <mwc-tab-bar activeIndex="0">
            <mwc-tab
              @click="${this._setActiveTab}"
              label="Invitation Info"
              value="0"
            ></mwc-tab>
            <mwc-tab
              @click="${this._setActiveTab}"
              label="Accepted By"
              value="1"
            ></mwc-tab>
            <mwc-tab
              @click="${this._setActiveTab}"
              label="Rejected By"
              value="2"
            ></mwc-tab>
          </mwc-tab-bar>


          ${this.active_tab == 0
            ? html`
                <div class="data">
                  <div>
                    Inviter: ${this.invitation_entry_info.invitation.inviter}
                  </div>
                  <div>
                    Invitees:
                    <ul>
                      ${this.invitation_entry_info.invitation.invitees.map(
                        invitee => html` <li>${invitee}</li> `
                      )}
                    </ul>
                  </div>

                  <div>
                    Timestamp:${this.invitation_entry_info.invitation
                      .timestamp}
                  </div>

                  <div class="center">
                    ${this.status == 'pending'
                      ? html`
                          <mwc-button
                            label="ACCEPT"
                            icon="check"

                            @click="${this._aceptInvitation}"
                          ></mwc-button>
                          <mwc-button
                            label="REJECT"
                            icon="close"

                            @click="${this._rejectInvitation}"
                          ></mwc-button>
                        `
                      : html``}
                    ${this.status == 'rejected'
                      ? html`
                          <mwc-button
                            label="DELETE"
                            icon="delete"
                          ></mwc-button>
                        `
                      : html``}
                    ${this.status == 'accepted'
                      ? html`
                          <mwc-button
                            label="ACCEPTED"
                            icon="done"
                          ></mwc-button>
                        `
                      : html``}
                  </div>
                </div>
              `
            : html``}
            ${this.active_tab == 1
              ? html`
                  <div class="data">
                    <div>
                      Accepted_by:
                      <ul>
                        ${this.invitation_entry_info.invitees_who_accepted.map(
                          invitee => html` <li>${invitee}</li> `
                        )}
                      </ul>
                    </div>
                  </div>
                `
              : html``}
            ${this.active_tab == 2
              ? html`
                  <div class="data">
                    <div>
                      Rejected_by:
                      <ul>
                        ${this.invitation_entry_info.invitees_who_rejected.map(
                          invitee => html` <li>${invitee}</li> `
                        )}
                      </ul>
                    </div>
                  </div>
                `
              : html``}            




        </div>`
      : html``}
    `;
  }

  _toggle() {
    this.activated = !this.activated;
  }

  _setActiveTab(e: any) {
    this.active_tab = e.target.attributes.value.value;
  }

  getScopedElements() {
    return {
      'mwc-icon': Icon,
      'mwc-list': List,
      'mwc-list-item': ListItem,
      'mwc-tab': Tab,
      'mwc-tab-bar': TabBar,
      'mwc-button': Button,

    };
  }

  setItemIcon() {
    switch (this.status) {
      case 'pending':
        break;
      case 'accepted':
        this.icon = 'thumb_up_off_alt';
        break;
      case 'rejected':
        this.icon = 'thumb_down_off_alt';
        break;
      default:
        break;
    }
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
