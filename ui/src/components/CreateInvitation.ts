import { MobxReactionUpdate } from '@adobe/lit-mobx';
import {
  BaseElement,
  connectDeps,
  DepsElement,
} from '@holochain-open-dev/common';
import { CreateProfileForm, ProfilePrompt, SearchAgent } from '@holochain-open-dev/profiles';
import { html, css, property } from 'lit-element';
import { InvitationsStore } from '../invitations.store';
import { InvitationItem } from './InvitationItem';

export abstract class CreateInvitation
  extends MobxReactionUpdate(BaseElement)
  implements DepsElement<InvitationsStore> {
  abstract get _deps(): InvitationsStore;

  render() {
    return html`
      <div class="invitations">
        <h1>Hello World</h1>
        <search-agent include-myself ></search-agent>
        <h1>LOGIN</h1>
      </div>
    `;
  }

  getScopedElements() {
    return {
      'search-agent': connectDeps(SearchAgent, this._deps.profilesStore),
      'create-profile-form': connectDeps(CreateProfileForm, this._deps.profilesStore),
    };
  }
}
