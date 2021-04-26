import { MobxReactionUpdate } from '@adobe/lit-mobx';
import {
  BaseElement,
  connectDeps,
  DepsElement,
} from '@holochain-open-dev/common';
import { SearchAgent } from '@holochain-open-dev/profiles';
import { html, css, LitElement, property } from 'lit-element';
import { InvitationsStore } from '../invitations.store';
import { InvitationItem } from './InvitationItem';

import { Icon } from '@material/mwc-icon';
import { List } from '@material/mwc-list';
import { ListItem } from '@material/mwc-list/mwc-list-item';

// abstract class CreateInvitation
//   extends MobxReactionUpdate(BaseElement)
//   implements DepsElement<InvitationsStore>

export abstract class InvitationsList extends MobxReactionUpdate(BaseElement) {
  // abstract get _deps(): InvitationsStore;

  @property({ type: Array })
  elements = ['element1', 'element2', 'element3','element4', 'element5', 'element6'];

  static styles = css`

    .invitations {
      width: 50%;
      padding: 1em;
      margin: 1em;
      display:block; 
      overflow-y: auto;
    }
  `;

  render() {
    return html`
      <div class="invitations">
        ${this.elements.map(
          element => html`
            <invitation-item propertyName=${element}
              ><invitation-item></invitation-item
            ></invitation-item>
          `
        )}
      </div>
    `;
  }

  getScopedElements() {
    return {
      'invitation-item': InvitationItem,
    };
  }
}
