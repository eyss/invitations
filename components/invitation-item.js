import { __decorate } from "tslib";
import { html, css } from 'lit';
import { state } from 'lit/decorators.js';
import { MobxLitElement } from '@adobe/lit-mobx';
import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import { requestContext } from '@holochain-open-dev/context';
/**mwc-elements imports */
import { Icon } from '@material/mwc-icon';
import { List } from 'scoped-material-components/mwc-list';
import { Button } from 'scoped-material-components/mwc-button';
import { ListItem } from '@material/mwc-list/mwc-list-item';
import { toJS } from 'mobx';
import { INVITATIONS_STORE_CONTEXT } from '../types';
/**
 * @element invitation-item
 * @fires invitation-completed - after the invitation its accepted by all the invitees
 */
export class InvitationItem extends ScopedRegistryHost(MobxLitElement) {
    constructor() {
        super(...arguments);
        this.loaded = false;
        this.clicked = false;
        this.invitation_entry_hash = '';
    }
    get invitationEntryInfo() {
        return this._store.invitations[this.invitation_entry_hash];
    }
    get invitationStatus() {
        if (this.invitationEntryInfo.invitees_who_rejected.length > 0) {
            return 'rejected';
        }
        if (this.invitationEntryInfo.invitees_who_accepted.length ===
            this.invitationEntryInfo.invitation.invitees.length) {
            return 'completed';
        }
        return 'pending';
    }
    async firstUpdated() {
        await this._store.profilesStore.fetchAgentProfile(this.invitationEntryInfo.invitation.inviter);
        this.invitationEntryInfo.invitation.invitees.map(async (invitee_pub_key) => {
            await this._store.profilesStore.fetchAgentProfile(invitee_pub_key);
        });
        this.loaded = true;
    }
    async _rejectInvitation() {
        await this._store.rejectInvitation(this.invitation_entry_hash);
    }
    async _acceptInvitation() {
        const invitation = toJS(this._store.invitations[this.invitation_entry_hash].invitation);
        await this._store.acceptInvitation(this.invitation_entry_hash);
        if (!this._store.invitations[this.invitation_entry_hash] ||
            this._store.isInvitationCompleted(this.invitation_entry_hash)) {
            this.dispatchEvent(new CustomEvent('invitation-completed', {
                detail: { invitation },
                bubbles: true,
                composed: true,
            }));
        }
    }
    _clickHandler() {
        this.clicked = !this.clicked;
    }
    _invitationIcon() {
        if (this.invitationStatus == 'rejected') {
            return html `
       <mwc-icon slot="graphic">close</mwc-icon>
      `;
        }
        else {
            return html `
        ${this.invitationStatus == 'completed'
                ? html `<mwc-icon slot="graphic">check</mwc-icon>`
                : html `<mwc-icon slot="graphic">pending</mwc-icon>`}
      `;
        }
    }
    _invitationActionButtons() {
        return html `
      <span slot="secondary">
        <mwc-button icon="check" @click="${this._acceptInvitation}"
          >ACCEPT</mwc-button
        >
        <mwc-button icon="close" @click="${this._rejectInvitation}">
          REJECT</mwc-button
        >
      </span>
    `;
    }
    _invitationInviterAgent() {
        const my_pub_key = this._store.profilesStore.myAgentPubKey;
        const fromMe = this.invitationEntryInfo.invitation.inviter === my_pub_key;
        return html `
      <span
        ><span class="secondary-text">from </span> ${fromMe
            ? 'you'
            : this._store.profilesStore.profileOf(this.invitationEntryInfo.invitation.inviter).nickname}
      </span>
    `;
    }
    _haveYouInteracted() {
        const my_pub_key = this._store.profilesStore.myAgentPubKey;
        const agents_who_already_interacted = this.invitationEntryInfo.invitees_who_accepted.concat(this.invitationEntryInfo.invitees_who_rejected);
        const result = agents_who_already_interacted.find(agent_pub_key => agent_pub_key === my_pub_key);
        if (result != undefined) {
            return true;
        }
        return false;
    }
    render() {
        if (this.loaded && this.invitationEntryInfo) {
            return html `
        <mwc-list-item
          id="element"
          twoline
          graphic="avatar"
          hasMeta
          @click="${this._clickHandler}"
        >

        ${this._invitationIcon()}
        ${this._invitationInviterAgent()}

        ${!this._haveYouInteracted() &&
                this._invitationActionButtons()}

        </mwc-list-item>
      `;
        }
    }
}
InvitationItem.styles = css `
    .invitation_info {

      font-family: 'Roboto';

      padding: 0.3em;
      margin: 0.3em;
      border: 1px solid gray;

      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      color: rgba(0, 0, 0, 0.54);
      font-size: 14px;
      overflow: auto;
      width: auto;
      transition-property: all;
    }

    .data {
      padding: 1em;
      margin: 1em;
      display: flex;
      align-items: flex-start;

      color: rgba(0, 0, 0, 0.54);
      flex-direction: column;
      overflow-x: hidden;
    }

    .data .center {
      align-self: center;
    }
    .secondary-text {
      color: rgba(0, 0, 0, 0.54);
    }

`;
InvitationItem.elementDefinitions = {
    'mwc-icon': Icon,
    'mwc-list': List,
    'mwc-button': Button,
    'mwc-list-item': ListItem,
};
__decorate([
    requestContext(INVITATIONS_STORE_CONTEXT)
], InvitationItem.prototype, "_store", void 0);
__decorate([
    state()
], InvitationItem.prototype, "loaded", void 0);
__decorate([
    state()
], InvitationItem.prototype, "clicked", void 0);
__decorate([
    state()
], InvitationItem.prototype, "invitation_entry_hash", void 0);
// import {
//   BaseElement,
//   connectDeps,
//   DepsElement,
// } from '@holochain-open-dev/common';
// // import { html, css, LitElement, property, query, queryAll } from 'lit-element';
// import { MobxReactionUpdate } from '@adobe/lit-mobx';
// export abstract class InvitationItem
//   extends MobxReactionUpdate(BaseElement)
//   implements DepsElement<InvitationsStore>
// {
//   abstract get _deps(): InvitationsStore;
//   @property({ type: Boolean })
//   loaded = false;
//   @property({ type: String })
//   invitation_entry_hash = '';
//   @property({ type: Boolean })
//   clicked = false;
//   static styles = css`
//     .invitation_info {
//       font-family: 'Roboto';
//       padding: 0.3em;
//       margin: 0.3em;
//       border: 1px solid gray;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       flex-direction: column;
//       color: rgba(0, 0, 0, 0.54);
//       font-size: 14px;
//       overflow: auto;
//       width: auto;
//       transition-property: all;
//     }
//     .data {
//       padding: 1em;
//       margin: 1em;
//       display: flex;
//       align-items: flex-start;
//       color: rgba(0, 0, 0, 0.54);
//       flex-direction: column;
//       overflow-x: hidden;
//     }
//     .data .center {
//       align-self: center;
//     }
//     .secondary-text {
//       color: rgba(0, 0, 0, 0.54);
//     }
//   `;
//   get invitationEntryInfo() {
//     return this._deps.invitations[this.invitation_entry_hash];
//   }
//   async firstUpdated() {
//     // this.invitation_entry_info = this._deps.invitations[this.invitation_entry_hash];
//     // this.setInvitationStatus();
//     // this.profiles[this.invitation_entry_info.invitation.inviter] = await this.getAgentProfile(this.invitation_entry_info.invitation.inviter);
//     await this._deps.profilesStore.fetchAgentProfile(
//       this.invitationEntryInfo.invitation.inviter
//     );
//     this.invitationEntryInfo.invitation.invitees.map(async invitee_pub_key => {
//       await this._deps.profilesStore.fetchAgentProfile(invitee_pub_key);
//     });
//     // this.invitation_entry_info.invitation.timestamp = new Date(this.invitation_entry_info.invitation.timestamp.secs * 1000);
//     this.loaded = true;
//   }
//   async _rejectInvitation() {
//     let result = await this._deps.rejectInvitation(this.invitation_entry_hash);
//   }
//   async _acceptInvitation() {
//     //añadir el handler
//     const invitation = toJS(
//       this._deps.invitations[this.invitation_entry_hash].invitation
//     );
//     await this._deps.acceptInvitation(this.invitation_entry_hash);
//     if (
//       !this._deps.invitations[this.invitation_entry_hash] ||
//       this._deps.isInvitationCompleted(this.invitation_entry_hash)
//     ) {
//       let myEvent = new CustomEvent('invitation-completed', {
//         detail: { invitation },
//         bubbles: true,
//         composed: true,
//       });
//       console.log('fire', myEvent)
//       this.dispatchEvent(myEvent);
//     }
//   }
//   get invitationStatus(): string {
//     if (this.invitationEntryInfo.invitees_who_rejected.length > 0) {
//       return 'rejected';
//     }
//     if (
//       this.invitationEntryInfo.invitees_who_accepted.length ===
//       this.invitationEntryInfo.invitation.invitees.length
//     ) {
//       return 'completed';
//     }
//     return 'pending';
//   }
//   _clickHandler() {
//     this.clicked = !this.clicked;
//   }
//   _invitationStatusInfo() {
//     if (this.invitationStatus == 'rejected') {
//       return html`
//         <span slot="secondary">
//           rejected by :
//           ${this.invitationEntryInfo.invitees_who_rejected.length}/${this
//             .invitationEntryInfo.invitation.invitees.length}
//           invitees
//         </span>
//         <mwc-icon slot="meta">close</mwc-icon>
//       `;
//     } else {
//       return html`
//         <span slot="secondary">
//           accepted by :
//           ${this.invitationEntryInfo.invitees_who_accepted.length}/${this
//             .invitationEntryInfo.invitation.invitees.length}
//           invitees
//         </span>
//         ${this.invitationStatus == 'completed'
//           ? html`<mwc-icon slot="meta">check</mwc-icon>`
//           : html`<mwc-icon slot="meta">pending</mwc-icon>`}
//       `;
//     }
//   }
//   _invitationActionButtons() {
//     return html`
//       <span slot="secondary">
//         <mwc-button icon="check" @click="${this._acceptInvitation}"
//           >ACCEPT</mwc-button
//         >
//         <mwc-button icon="close" @click="${this._rejectInvitation}">
//           REJECT</mwc-button
//         >
//       </span>
//     `;
//   }
//   _invitationInviterAgent() {
//     const my_pub_key = this._deps.profilesStore.myAgentPubKey;
//     const fromMe = this.invitationEntryInfo.invitation.inviter === my_pub_key;
//     return html`
//       <span
//         ><span class="secondary-text">from </span> ${fromMe
//           ? 'you'
//           : this._deps.profilesStore.profileOf(
//               this.invitationEntryInfo.invitation.inviter
//             ).nickname}
//       </span>
//     `;
//   }
//   _haveYouInteracted() {
//     const my_pub_key = this._deps.profilesStore.myAgentPubKey;
//     const agents_who_already_interacted =
//       this.invitationEntryInfo.invitees_who_accepted.concat(
//         this.invitationEntryInfo.invitees_who_rejected
//       );
//     let result = agents_who_already_interacted.find(
//       agent_pub_key => agent_pub_key === my_pub_key
//     );
//     if (result != undefined) {
//       return true;
//     }
//     return false;
//   }
//   render() {
//     if (this.loaded && this.invitationEntryInfo) {
//       return html`
//         <mwc-list-item
//           id="element"
//           twoline
//           graphic="avatar"
//           hasMeta
//           @click="${this._clickHandler}"
//         >
//           <mwc-icon slot="graphic">mail</mwc-icon>
//           ${this._invitationInviterAgent()}
//           ${this.clicked &&
//           !(
//             this.invitationEntryInfo.invitation.inviter ===
//             this._deps.profilesStore.myAgentPubKey
//           ) &&
//           !this._haveYouInteracted()
//             ? this._invitationActionButtons()
//             : this._invitationStatusInfo()}
//         </mwc-list-item>
//       `;
//     }
//   }
//   getScopedElements() {
//     return {
//       'mwc-icon': Icon,
//       'mwc-list': List,
//       'mwc-list-item': ListItem,
//       'mwc-tab': Tab,
//       'mwc-tab-bar': TabBar,
//       'mwc-button': Button,
//       'mwc-snackbar': Snackbar,
//     };
//   }
// }
//# sourceMappingURL=invitation-item.js.map