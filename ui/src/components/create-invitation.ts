import { MobxReactionUpdate } from '@adobe/lit-mobx';
import {
  BaseElement,
  connectDeps,
  DepsElement,
} from '@holochain-open-dev/common';
import {
  CreateProfileForm,
  ProfilePrompt,
  SearchAgent,
} from '@holochain-open-dev/profiles';
import { html, css, property } from 'lit-element';
import { InvitationsStore } from '../invitations.store';
import { InvitationItem } from './invitation-item';


import {CircularProgress} from '@material/mwc-circular-progress';

export abstract class CreateInvitation
  extends MobxReactionUpdate(BaseElement)
  implements DepsElement<InvitationsStore> {
  abstract get _deps(): InvitationsStore;

  render() {
    return html`

      <h1>Hello WOrld</h1>

    `;
  }

  getScopedElements() {
    return {
      'mwc-circular-progress': CircularProgress,
    };
  }

}
