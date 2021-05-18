import { MobxReactionUpdate } from '@adobe/lit-mobx';
import {
  BaseElement,
  connectDeps,
  DepsElement,
} from '@holochain-open-dev/common';

import { html, css, property, query} from 'lit-element';
import { InvitationsStore } from '../invitations.store';
import { InvitationItem } from './invitation-item';


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


  @property({ type: Boolean })
  loaded = false;

  @query("#id")
  first:any;


  async firstUpdated() {

    await this._deps.fectMyPendingInvitations();
    this.loaded = true;
  }

  updated(){

    console.log("the store was modified");
    this.requestUpdate();
    
  }


  eventListener(){
    console.log("Event listened");
  }

  render() {

    if (this.loaded) {

      return html`
        <div class="invitations" @my-event="${this.eventListener}">
          ${Object.entries(this._deps.invitations).map(element => {
        return html`<invitation-item .invitation_entry_hash=${element[1].invitation_entry_hash} </invitation-item>`;
      })
        }
      </div>
    `;

    }
  }

  getScopedElements() {
    return {
      'invitation-item': connectDeps(InvitationItem, this._deps),
    };
  }
}

