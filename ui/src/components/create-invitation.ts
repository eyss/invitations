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

import { Button } from '@material/mwc-button';



import { Icon } from '@material/mwc-icon';
import { List } from '@material/mwc-list';
import { ListItem } from '@material/mwc-list/mwc-list-item';



import { CircularProgress } from '@material/mwc-circular-progress';

import {AgentPubKey} from '../types'



export abstract class CreateInvitation
  extends MobxReactionUpdate(BaseElement)
  implements DepsElement<InvitationsStore> {
  abstract get _deps(): InvitationsStore;

  static styles = css`
    
    .invitation_form {
      display: grid;
      justify-content: center;

      margin: 1em;
      padding: 1em;
      height: 300px;
      min-width: 250px;
      max-width: 250px;
      overflow-y: auto;
      // background-color: yellow;
      border: 1px solid gray;
    }

    .red{
      overflow-y:auto;
      margin-top: 1em;
      margin-bottom: 1em;
    }
  
    .blue{
      justify-self:center;
    }

  `;

  constructor() {
    super();
  }

  @property({ type: Array })
  invitees: Dictionary<String> = {};


  _addInvitee(e: CustomEvent) {

    console.log(e.detail.agent.profile.nickname);  
    
    this.invitees[e.detail.agent.agent_pub_key] = e.detail.agent.profile.nickname;
    this.requestUpdate();
  
  }

  _removeInvitee(e:Event) {
    let node:any = e.target;    
    delete this.invitees[node.id];
    this.requestUpdate();
  }

  async _printInvitees() {
    console.table(this.invitees);    
  }

  async _sendInvitation(){

    //this is the input for the create invitation method define in the holochain side 
    let invitees_list:AgentPubKey[] = [];

    Object.entries(this.invitees).map(element=>{
      invitees_list.push(element[0]);

      delete this.invitees[element[0]]
    });

    await this._deps.sendInvitation(invitees_list);
    await this._pedignInvitations();

    this.requestUpdate();

    console.log(this.invitees);
  }

  async _pedignInvitations(){

    await this._deps.fectMyPendingInvitations();

    Object.entries(this._deps.invitations).map((element)=>{
      console.log(element[1]);
    })

  }

  async firstUpdated() { }

  async _printMe() {
    console.log(this._deps.profilesStore.myAgentPubKey);
  }

  InviteesList() {
  return html`
      
    <mwc-list>

    ${Object.entries(this.invitees).map(element => {
      return html`
        <mwc-list-item hasMeta>
          <span>${element[1]}</span>
          <mwc-icon slot="meta" id ="${element[0]}" @click ="${this._removeInvitee}">close</mwc-icon>
          </mwc-list-item>`;
        })
    }

  </mwc-list>
  `
}






  render() {
    return html`

      <div class="invitation_form">

        <div class="green">
          <h4 style="text-align: center;"> Create Invitation</h4>
          <search-agent @agent-selected="${this._addInvitee}" include-myself clear-on-select ></search-agent>
        </div>

        
        <div class ="red">
          ${this.InviteesList()}
        </div>
      
        <div class="blue">
          <mwc-button label="send" @click="${this._sendInvitation}";
          }">
            <mwc-icon slot="icon">send</mwc-icon>
          </mwc-button>
        </div>
  
      </div>


      
    `;
  }

  getScopedElements() {
    return {
      'mwc-circular-progress': CircularProgress,
      'mwc-icon': Icon,
      'mwc-list': List,
      'mwc-list-item': ListItem,
      'mwc-button': Button,
      'search-agent': connectDeps(SearchAgent, this._deps.profilesStore)
    };
  }
}


// this elements are used for testing purposes
// <button @click = "${this._printInvitees}">CLick me </button>
// <button @click = "${this._printMe}">Alice</button>
// <button @click = "${this._pedignInvitations}">Invitations</button>


// InviteesList() {

//   let entries = [1,2,3,4,5,6,7]

//   return html`
      
//     <mwc-list>

//     ${ entries.map((element)=>{

//       return html`
//         <mwc-list-item hasMeta>
//           <span>${element}</span>
//           <mwc-icon slot="meta"  @click ="${this._removeInvitee}">close</mwc-icon>
//         </mwc-list-item>`;

//     })    
//     }

//   </mwc-list>
//   `
// }
