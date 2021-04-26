import { MobxReactionUpdate } from '@adobe/lit-mobx';
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

export class InvitationItem extends LitElement {
  @property({ type: String })
  propertyName = 'Hola mUndo';

  @property({ type: Boolean })
  activated = false;

  static styles = css`
    .invitation_info {
      // color: green;
      // background-color: red;
      padding: 0.1em;
      border: 1px solid gray;
      height : 100px;

    }
  `;

  // @mouseover="${this._toggle}"
  // @mouseout="${this._toggle}"



  render() {
    return html`
      <mwc-list-item
        twoline
        graphic="avatar"
        hasMeta
        @click = "${this._toggle}"
      >
        <span>${this.propertyName}</span>
        <span slot="secondary">0x4A26e382Ab282992d1BAEd09ce1a4f8E559D53C0</span>
        <mwc-icon slot="graphic">mail</mwc-icon>
        <mwc-icon slot="meta">thumb_down_off_alt</mwc-icon>
      </mwc-list-item>


      ${this.activated ? html`<div class="invitation_info">Cosas de ${this.propertyName}</div>` : html``}
    `;
  }

  _toggle() {
    this.activated = !this.activated;
  }

  getScopedElements() {
    return {
      'mwc-icon': Icon,
      'mwc-list': List,
      'mwc-list-item': ListItem,
    };
  }
}

customElements.define('invitation-item', InvitationItem);

// <li
// class="invitation_item"
// @mouseover="${this._toggle}"
// @mouseout="${this._toggle}"
// >
// <p>${this.propertyName}</p>
// ${this.activated ? html`<div>Cosas de la invitacion</div>` : html``}
// </li>
