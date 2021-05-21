import { __decorate } from "tslib";
import { MobxReactionUpdate } from '@adobe/lit-mobx';
import { BaseElement, connectDeps, } from '@holochain-open-dev/common';
import { html, css, property, query } from 'lit-element';
import { InvitationItem } from './invitation-item';
import { Card } from 'scoped-material-components/mwc-card';
import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';
import { sharedStyles } from '../shared-styles';
export class InvitationsList extends MobxReactionUpdate(BaseElement) {
    constructor() {
        super(...arguments);
        this.loaded = false;
    }
    async firstUpdated() {
        await this._deps.fetchMyPendingInvitations();
        this.loaded = true;
    }
    renderPendingInvitations() {
        if (Object.entries(this._deps.invitations).length === 0)
            return html `<div class="column center-content" style="flex: 1;">
        <span class="placeholder">There are no pending invitations yet</span>
      </div>`;
        return html ` <div class="flex-scrollable-parent" style="flex: 1;">
      <div class="flex-scrollable-container">
        <div class="flex-scrollable-y">
          ${Object.entries(this._deps.invitations).map(element => {
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
          <span class="title" style="margin-bottom: 8px;">Pending Invitations</span>
          ${this.loaded
            ? this.renderPendingInvitations()
            : html `<div class="column center-content" style="flex: 1;">
                <mwc-circular-progress indeterminate></mwc-circular-progress>
              </div>`}
        </div>
      </mwc-card>
    `;
    }
    getScopedElements() {
        return {
            'invitation-item': connectDeps(InvitationItem, this._deps),
            'mwc-card': Card,
            'mwc-circular-progress': CircularProgress,
        };
    }
}
InvitationsList.styles = [css `
    .invitations {
      padding: 1em;
      margin: 1em;
      display: block;
      overflow-y: auto;
    }
  `, sharedStyles];
__decorate([
    property({ type: Boolean })
], InvitationsList.prototype, "loaded", void 0);
__decorate([
    query('#id')
], InvitationsList.prototype, "first", void 0);
//# sourceMappingURL=invitation-list.js.map