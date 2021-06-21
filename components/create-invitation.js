import { __decorate } from "tslib";
import { css, html } from 'lit';
import { requestContext } from '@holochain-open-dev/context';
import { state } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { MobxLitElement } from '@adobe/lit-mobx';
/**mwc-elements imports */
import { Card } from 'scoped-material-components/mwc-card';
import { List } from 'scoped-material-components/mwc-list';
import { Icon } from 'scoped-material-components/mwc-icon';
import { Button } from 'scoped-material-components/mwc-button';
import { ListItem } from 'scoped-material-components/mwc-list-item';
import { ProfilePrompt, SearchAgent, } from '@holochain-open-dev/profiles';
import { INVITATIONS_STORE_CONTEXT } from '../types';
import { sharedStyles } from '../shared-styles';
/**
 * @element create-invitation-form
 */
export class CreateInvitation extends ScopedElementsMixin(MobxLitElement) {
    constructor() {
        super(...arguments);
        this.invitees = {};
    }
    _addInvitee(e) {
        this.invitees[e.detail.agent.agent_pub_key] =
            e.detail.agent.profile.nickname;
        this.requestUpdate();
    }
    _removeInvitee(e) {
        const node = e.target;
        delete this.invitees[node.id];
        this.requestUpdate();
    }
    async _sendInvitation() {
        //this is the input for the create invitation method define in the holochain side
        const invitees_list = [];
        Object.entries(this.invitees).map(element => {
            invitees_list.push(element[0]);
            delete this.invitees[element[0]];
        });
        if (invitees_list.length > 0) {
            await this._store.sendInvitation(invitees_list);
            await this._store.fetchMyPendingInvitations();
            this.requestUpdate();
        }
    }
    async _pedignInvitations() {
        await this._store.fetchMyPendingInvitations();
    }
    renderInviteesList() {
        const invitees = Object.entries(this.invitees);
        return html `
      <mwc-list>
        ${invitees.map(element => {
            const invitee_nickname = element[1];
            return html ` <mwc-list-item hasMeta>
            <span>${invitee_nickname}</span>
            <mwc-icon
              slot="meta"
              id="${element[0]}"
              @click="${this._removeInvitee}"
              >close</mwc-icon
            >
          </mwc-list-item>`;
        })}
      </mwc-list>
    `;
    }
    render() {
        return html `
      <mwc-card style="flex: 1;">
        <div class="column" style="margin: 16px; flex: 1;">
          <span class="title" style="margin-bottom: 16px;"
            >Create Invitation</span
          >
          <search-agent
            @agent-selected="${this._addInvitee}"
            clear-on-select
            include-myself
            style="margin-bottom: 16px;"
          ></search-agent>

          <div
            class="flex-scrollable-parent"
            style="flex: 1; margin-bottom: 16px;"
          >
            <div class="flex-scrollable-container">
              <div class="flex-scrollable-y">${this.renderInviteesList()}</div>
            </div>
          </div>

          <mwc-button label="Send Invitation" @click=${this._sendInvitation}>
            <mwc-icon slot="icon">send</mwc-icon>
          </mwc-button>
        </div>
      </mwc-card>
    `;
    }
    static get styles() {
        return [
            sharedStyles,
            css `
        :host {
          display: flex;
        }
      `,
        ];
    }
}
CreateInvitation.elementDefinitions = {
    'search-agent': SearchAgent,
    'profile-prompt': ProfilePrompt,
    'mwc-icon': Icon,
    'mwc-list': List,
    'mwc-card': Card,
    'mwc-list-item': ListItem,
    'mwc-button': Button,
};
__decorate([
    requestContext(INVITATIONS_STORE_CONTEXT)
], CreateInvitation.prototype, "_store", void 0);
__decorate([
    state()
], CreateInvitation.prototype, "invitees", void 0);
// import { MobxReactionUpdate } from '@adobe/lit-mobx';
// import {
//   BaseElement,
//   connectDeps,
//   DepsElement,
// } from '@holochain-open-dev/common';
// import {
//   CreateProfileForm,
//   Dictionary,
//   ProfilePrompt,
//   SearchAgent,
// } from '@holochain-open-dev/profiles';
// import { html, css, property } from 'lit-element';
// import { InvitationsStore } from '../invitations.store';
// import { InvitationItem } from './invitation-item';
// import { Card } from 'scoped-material-components/mwc-card';
// import { List } from 'scoped-material-components/mwc-list';
// import { Icon } from '@material/mwc-icon';
// import { Button } from 'scoped-material-components/mwc-button';
// import { ListItem } from '@material/mwc-list/mwc-list-item';
// import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';
// import { sharedStyles } from '../shared-styles';
// import { AgentPubKey } from '../types';
// export abstract class CreateInvitation
//   extends MobxReactionUpdate(BaseElement)
//   implements DepsElement<InvitationsStore>
// {
//   abstract get _deps(): InvitationsStore;
//   static styles = [sharedStyles];
//   @property({ type: Array })
//   invitees: Dictionary<String> = {};
//   _addInvitee(e: CustomEvent) {
//     // console.log(e.detail.agent.profile.nickname);
//     this.invitees[e.detail.agent.agent_pub_key] =
//       e.detail.agent.profile.nickname;
//     this.requestUpdate();
//   }
//   _removeInvitee(e: Event) {
//     let node: any = e.target;
//     delete this.invitees[node.id];
//     this.requestUpdate();
//   }
//   async _sendInvitation() {
//     //this is the input for the create invitation method define in the holochain side
//     let invitees_list: AgentPubKey[] = [];
//     Object.entries(this.invitees).map(element => {
//       invitees_list.push(element[0]);
//       delete this.invitees[element[0]];
//     });
//     if(invitees_list.length > 0 ){
//       await this._deps.sendInvitation(invitees_list);
//       await this._deps.fetchMyPendingInvitations();
//       this.requestUpdate();
//     }
//   }
//   async _pedignInvitations() {
//     await this._deps.fetchMyPendingInvitations();
//   }
//   renderInviteesList() {
//     return html`
//       <mwc-list>
//         ${Object.entries(this.invitees).map(element => {
//           return html` <mwc-list-item hasMeta>
//             <span>${element[1]}</span>
//             <mwc-icon
//               slot="meta"
//               id="${element[0]}"
//               @click="${this._removeInvitee}"
//               >close</mwc-icon
//             >
//           </mwc-list-item>`;
//         })}
//       </mwc-list>
//     `;
//   }
//   render() {
//     return html`
//       <mwc-card style="flex: 1;">
//         <div class="column" style="margin: 16px; flex: 1;">
//           <span class="title" style="margin-bottom: 16px;"
//             >Create Invitation</span
//           >
//           <search-agent
//             @agent-selected="${this._addInvitee}"
//             clear-on-select
//             style="margin-bottom: 16px;"
//           ></search-agent>
//           <div
//             class="flex-scrollable-parent"
//             style="flex: 1; margin-bottom: 16px;"
//           >
//             <div class="flex-scrollable-container">
//               <div class="flex-scrollable-y">${this.renderInviteesList()}</div>
//             </div>
//           </div>
//           <mwc-button label="Send Invitation" @click=${this._sendInvitation}>
//             <mwc-icon slot="icon">send</mwc-icon>
//           </mwc-button>
//         </div>
//       </mwc-card>
//     `;
//   }
//   getScopedElements() {
//     return {
//       'mwc-circular-progress': CircularProgress,
//       'mwc-icon': Icon,
//       'mwc-list': List,
//       'mwc-card': Card,
//       'mwc-list-item': ListItem,
//       'mwc-button': Button,
//       'search-agent': connectDeps(SearchAgent, this._deps.profilesStore),
//     };
//   }
// }
//# sourceMappingURL=create-invitation.js.map