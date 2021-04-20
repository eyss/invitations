import { html, css, LitElement, property } from 'lit-element';
import {
  BaseElement,
  connectDeps,
  DepsElement,
} from '@holochain-open-dev/common';
import { SearchAgent } from '@holochain-open-dev/profiles';
import { MobxReactionUpdate } from '@adobe/lit-mobx';
import { InvitationsStore } from '../invitations.store';
import { Button } from 'scoped-material-components/mwc-button';
import { Invitation } from '../types';

export abstract class CreateInvitation
  extends MobxReactionUpdate(BaseElement)
  implements DepsElement<InvitationsStore> {
  abstract get _deps(): InvitationsStore;

  render() {
    return html` 
    
    <search-agents></search-agents>
    <mwc-button raised>Hello</mwc-button> 
    
    
    
    
    `;
  }

  getScopedElements() {
    return {
      'search-agents': connectDeps(SearchAgent, this._deps.profilesStore),
      'mwc-button': Button,
    };
  }
}
