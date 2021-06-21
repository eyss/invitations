import { __decorate } from "tslib";
import { html, css } from 'lit';
import { state } from 'lit/decorators.js';
import { MobxLitElement } from '@adobe/lit-mobx';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { requestContext } from '@holochain-open-dev/context';
import { sharedStyles } from '../shared-styles';
import { InvitationItem } from './invitation-item';
import { INVITATIONS_STORE_CONTEXT } from '../types';
/**mwc-elements imports */
import { Card } from 'scoped-material-components/mwc-card';
import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';
/**
 * @element invitation-list
 */
export class InvitationsList extends ScopedElementsMixin(MobxLitElement) {
    constructor() {
        super(...arguments);
        this.loaded = false;
    }
    async firstUpdated() {
        await this._store.fetchMyPendingInvitations();
        this.loaded = true;
    }
    renderPendingInvitations() {
        if (Object.entries(this._store.invitations).length === 0)
            return html `<div class="column center-content" style="flex: 1;">
        <span class="placeholder">There are no pending invitations yet</span>
      </div>`;
        return html ` <div class="flex-scrollable-parent" style="flex: 1;">
      <div class="flex-scrollable-container">
        <div class="flex-scrollable-y">
          ${Object.entries(this._store.invitations).map(element => {
            return html `<invitation-item
              .invitation_entry_hash=${element[1].invitation_entry_hash}
            >
            </invitation-item>`;
        })}
        </div>
      </div>
    </div>`;
    }
    render() {
        return html `
      <mwc-card style="flex: 1;">
        <div class="column" style="margin: 16px; flex: 1;">
          <span class="title" style="margin-bottom: 8px;"
            >Pending Invitations</span
          >
          ${this.loaded
            ? this.renderPendingInvitations()
            : html `<div class="column center-content" style="flex: 1;">
                <mwc-circular-progress indeterminate></mwc-circular-progress>
              </div>`}
        </div>
      </mwc-card>
    `;
    }
    static get scopedElements() {
        return {
            'mwc-card': Card,
            'invitation-item': InvitationItem,
            'mwc-circular-progress': CircularProgress,
        };
    }
}
InvitationsList.styles = [
    css `
      .invitations {
        padding: 1em;
        margin: 1em;
        display: block;
        overflow-y: auto;
      }
    `,
    sharedStyles,
];
__decorate([
    requestContext(INVITATIONS_STORE_CONTEXT)
], InvitationsList.prototype, "_store", void 0);
__decorate([
    state()
], InvitationsList.prototype, "loaded", void 0);
// import { MobxReactionUpdate } from '@adobe/lit-mobx';
// import {
//   BaseElement,
//   connectDeps,
//   DepsElement,
// } from '@holochain-open-dev/common';
// import { html, css, property, query } from 'lit-element';
// import { InvitationsStore } from '../invitations.store';
// import { InvitationItem } from './invitation-item';
// import { Card } from 'scoped-material-components/mwc-card';
// import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';
// import { sharedStyles } from '../shared-styles';
// export abstract class InvitationsList
//   extends MobxReactionUpdate(BaseElement)
//   implements DepsElement<InvitationsStore>
// {
//   abstract get _deps(): InvitationsStore;
//   static styles = [css`
//     .invitations {
//       padding: 1em;
//       margin: 1em;
//       display: block;
//       overflow-y: auto;
//     }
//   `, sharedStyles];
//   @property({ type: Boolean })
//   loaded = false;
//   @query('#id')
//   first: any;
//   async firstUpdated() {
//     await this._deps.fetchMyPendingInvitations();
//     this.loaded = true;
//   }
//   renderPendingInvitations() {
//     if (Object.entries(this._deps.invitations).length === 0)
//       return html`<div class="column center-content" style="flex: 1;">
//         <span class="placeholder">There are no pending invitations yet</span>
//       </div>`;
//     return html` <div class="flex-scrollable-parent" style="flex: 1;">
//       <div class="flex-scrollable-container">
//         <div class="flex-scrollable-y">
//           ${Object.entries(this._deps.invitations).map(element => {
//             return html`<invitation-item
//               .invitation_entry_hash=${element[1].invitation_entry_hash}
//             >
//             </invitation-item>`;
//           })}
//         </div>
//       </div>
//     </div>`;
//   }
//   render() {
//     return html`
//       <mwc-card style="flex: 1;">
//         <div class="column" style="margin: 16px; flex: 1;">
//           <span class="title" style="margin-bottom: 8px;">Pending Invitations</span>
//           ${this.loaded
//             ? this.renderPendingInvitations()
//             : html`<div class="column center-content" style="flex: 1;">
//                 <mwc-circular-progress indeterminate></mwc-circular-progress>
//               </div>`}
//         </div>
//       </mwc-card>
//     `;
//   }
//   getScopedElements() {
//     return {
//       'invitation-item': connectDeps(InvitationItem, this._deps),
//       'mwc-card': Card,
//       'mwc-circular-progress': CircularProgress,
//     };
//   }
// }
//# sourceMappingURL=invitation-list.js.map