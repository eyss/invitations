import { css, LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { createContext, contextProvided } from '@lit-labs/context';
import { StoreSubscriber } from 'lit-svelte-stores';
import { Icon, List, Button, ListItem, Card, CircularProgress } from '@scoped-elements/material-web';
import { profilesStoreContext, SearchAgent, ProfilePrompt } from '@holochain-open-dev/profiles';
import { serializeHash } from '@holochain-open-dev/core-types';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const sharedStyles = css `
  .column {
    display: flex;
    flex-direction: column;
  }
  .row {
    display: flex;
    flex-direction: row;
  }

  .title {
    font-size: 20px;
  }

  .fill {
    flex: 1;
  }

  .center-content {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  :host {
    display: flex;
  }

  .placeholder {
    color: rgba(0, 0, 0, 0.6);
    text-align: center;
  }

  .flex-scrollable-parent {
    position: relative;
    display: flex;
    flex: 1;
  }

  .flex-scrollable-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .flex-scrollable-x {
    max-width: 100%;
    overflow-x: auto;
  }
  .flex-scrollable-y {
    max-height: 100%;
    overflow-y: auto;
  }
`;

const invitationsStoreContext = createContext('hc_zome_invitations/store');

var InvitationStatus;
(function (InvitationStatus) {
    InvitationStatus[InvitationStatus["Pending"] = 0] = "Pending";
    InvitationStatus[InvitationStatus["Completed"] = 1] = "Completed";
    InvitationStatus[InvitationStatus["Rejected"] = 2] = "Rejected";
})(InvitationStatus || (InvitationStatus = {}));

function isInvitationCompleted(invitation) {
    return (invitation.invitation.invitees.length ===
        invitation.invitees_who_accepted.length);
}
function getInvitationStatus(invitation) {
    if (invitation.invitees_who_rejected.length > 0) {
        return InvitationStatus.Rejected;
    }
    if (invitation.invitees_who_accepted.length ===
        invitation.invitation.invitees.length) {
        return InvitationStatus.Completed;
    }
    return InvitationStatus.Pending;
}

/**
 * @element invitation-item
 * @fires invitation-completed - after the invitation its accepted by all the invitees
 */
class InvitationItem extends ScopedElementsMixin(LitElement) {
    constructor() {
        super(...arguments);
        this.loaded = false;
        this.clicked = false;
        this.invitationEntryHash = '';
        this._invitation = new StoreSubscriber(this, () => this._store.invitationInfo(this.invitationEntryHash));
        this._knownProfiles = new StoreSubscriber(this, () => this._profilesStore.knownProfiles);
    }
    get invitationStatus() {
        return getInvitationStatus(this._invitation.value);
    }
    get fromMe() {
        const my_pub_key = this._profilesStore.myAgentPubKey;
        return this._invitation.value.invitation.inviter === my_pub_key;
    }
    firstUpdated() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._profilesStore.fetchAgentProfile(this._invitation.value.invitation.inviter);
            const promises = this._invitation.value.invitation.invitees.map(invitee_pub_key => this._profilesStore.fetchAgentProfile(invitee_pub_key));
            yield Promise.all(promises);
            this.loaded = true;
        });
    }
    _rejectInvitation() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._store.rejectInvitation(this.invitationEntryHash);
        });
    }
    _acceptInvitation() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._store.acceptInvitation(this.invitationEntryHash);
            if (isInvitationCompleted(this._invitation.value)) {
                this.dispatchEvent(new CustomEvent('invitation-completed', {
                    detail: this._invitation.value,
                    bubbles: true,
                    composed: true,
                }));
            }
        });
    }
    _clickHandler() {
        this.clicked = !this.clicked;
    }
    _invitationIcon() {
        if (this.invitationStatus === InvitationStatus.Rejected) {
            return html ` <mwc-icon slot="graphic">close</mwc-icon> `;
        }
        else {
            return html `
        ${this.invitationStatus === InvitationStatus.Completed
                ? html `<mwc-icon slot="graphic">check</mwc-icon>`
                : html `<mwc-icon slot="graphic">pending</mwc-icon>`}
      `;
        }
    }
    _invitationActionButtons() {
        if (this._haveYouInteracted() || this.fromMe)
            return html ``;
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
        if (this.fromMe) {
            return html `
        <span>
          <span class="secondary-text">to </span>
          ${this._knownProfiles.value[this._invitation.value.invitation.invitees[0]].nickname}
        </span>
      `;
        }
        else
            return html `
        <span
          ><span class="secondary-text">from </span>
          ${this._knownProfiles.value[this._invitation.value.invitation.inviter]
                .nickname}
        </span>
      `;
    }
    _haveYouInteracted() {
        const my_pub_key = this._profilesStore.myAgentPubKey;
        const agents_who_already_interacted = this._invitation.value.invitees_who_accepted.concat(this._invitation.value.invitees_who_rejected);
        const result = agents_who_already_interacted.find(agent_pub_key => agent_pub_key === my_pub_key);
        if (result != undefined) {
            return true;
        }
        return false;
    }
    render() {
        if (this.loaded && this._invitation.value) {
            return html `
        <mwc-list-item
          id="element"
          twoline
          graphic="avatar"
          hasMeta
          @click="${this._clickHandler}"
        >
          ${this._invitationIcon()} ${this._invitationInviterAgent()}
          ${this._invitationActionButtons()}
        </mwc-list-item>
      `;
        }
    }
    static get scopedElements() {
        return {
            'mwc-icon': Icon,
            'mwc-list': List,
            'mwc-button': Button,
            'mwc-list-item': ListItem,
        };
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
__decorate([
    contextProvided({ context: invitationsStoreContext })
], InvitationItem.prototype, "_store", void 0);
__decorate([
    contextProvided({ context: profilesStoreContext })
], InvitationItem.prototype, "_profilesStore", void 0);
__decorate([
    state()
], InvitationItem.prototype, "loaded", void 0);
__decorate([
    state()
], InvitationItem.prototype, "clicked", void 0);
__decorate([
    state()
], InvitationItem.prototype, "invitationEntryHash", void 0);

/**
 * @element invitation-list
 */
class InvitationsList extends ScopedElementsMixin(LitElement) {
    constructor() {
        super(...arguments);
        this._pendingInvitations = new StoreSubscriber(this, () => this._store.pendingInvitations);
        this.loaded = false;
    }
    firstUpdated() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._store.fetchMyPendingInvitations();
            this.loaded = true;
        });
    }
    renderPendingInvitations() {
        if (Object.entries(this._pendingInvitations.value).length === 0)
            return html `<div class="column center-content" style="flex: 1;">
        <span class="placeholder">There are no pending invitations yet</span>
      </div>`;
        return html ` <div class="flex-scrollable-parent" style="flex: 1;">
      <div class="flex-scrollable-container">
        <div class="flex-scrollable-y">
          ${Object.entries(this._pendingInvitations.value).map(element => {
            return html `<invitation-item
              .invitationEntryHash=${element[1].invitation_entry_hash}
              @invitation-completed=${(e) => this.dispatchEvent(new CustomEvent('invitation-completed', {
                detail: e.detail,
                bubbles: true,
                composed: true,
            }))}
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
    contextProvided({ context: invitationsStoreContext })
], InvitationsList.prototype, "_store", void 0);
__decorate([
    state()
], InvitationsList.prototype, "loaded", void 0);

/**
 * @element create-invitation-form
 */
class CreateInvitation extends ScopedElementsMixin(LitElement) {
    constructor() {
        super(...arguments);
        this.invitees = {};
    }
    addInvitee(e) {
        this.invitees[e.detail.agent.agent_pub_key] =
            e.detail.agent.profile.nickname;
        this.requestUpdate();
    }
    removeInvitee(e) {
        const node = e.target;
        delete this.invitees[node.id];
        this.requestUpdate();
    }
    sendInvitation() {
        return __awaiter(this, void 0, void 0, function* () {
            //this is the input for the create invitation method define in the holochain side
            const invitees_list = [];
            Object.entries(this.invitees).map(element => {
                invitees_list.push(element[0]);
                delete this.invitees[element[0]];
            });
            if (invitees_list.length > 0) {
                yield this._store.sendInvitation(invitees_list);
                yield this._store.fetchMyPendingInvitations();
                this.requestUpdate();
            }
        });
    }
    _pedignInvitations() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._store.fetchMyPendingInvitations();
        });
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
              @click="${this.removeInvitee}"
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
            @agent-selected="${this.addInvitee}"
            clear-on-select
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

          <mwc-button label="Send Invitation" @click=${this.sendInvitation}>
            <mwc-icon slot="icon">send</mwc-icon>
          </mwc-button>
        </div>
      </mwc-card>
    `;
    }
    static get scopedElements() {
        return {
            'search-agent': SearchAgent,
            'profile-prompt': ProfilePrompt,
            'mwc-icon': Icon,
            'mwc-list': List,
            'mwc-card': Card,
            'mwc-list-item': ListItem,
            'mwc-button': Button,
        };
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
__decorate([
    contextProvided({ context: invitationsStoreContext })
], CreateInvitation.prototype, "_store", void 0);
__decorate([
    state()
], CreateInvitation.prototype, "invitees", void 0);

function noop() { }
function run(fn) {
    return fn();
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function subscribe(store, ...callbacks) {
    if (store == null) {
        return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
Promise.resolve();

const subscriber_queue = [];
/**
 * Creates a `Readable` store that allows reading by subscription.
 * @param value initial value
 * @param {StartStopNotifier}start start and stop notifications for subscriptions
 */
function readable(value, start) {
    return {
        subscribe: writable(value, start).subscribe
    };
}
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = new Set();
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (const subscriber of subscribers) {
                    subscriber[1]();
                    subscriber_queue.push(subscriber, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.add(subscriber);
        if (subscribers.size === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            subscribers.delete(subscriber);
            if (subscribers.size === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}
function derived(stores, fn, initial_value) {
    const single = !Array.isArray(stores);
    const stores_array = single
        ? [stores]
        : stores;
    const auto = fn.length < 2;
    return readable(initial_value, (set) => {
        let inited = false;
        const values = [];
        let pending = 0;
        let cleanup = noop;
        const sync = () => {
            if (pending) {
                return;
            }
            cleanup();
            const result = fn(single ? values[0] : values, set);
            if (auto) {
                set(result);
            }
            else {
                cleanup = is_function(result) ? result : noop;
            }
        };
        const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
            values[i] = value;
            pending &= ~(1 << i);
            if (inited) {
                sync();
            }
        }, () => {
            pending |= (1 << i);
        }));
        inited = true;
        sync();
        return function stop() {
            run_all(unsubscribers);
            cleanup();
        };
    });
}

class InvitationsService {
    constructor(cellClient, zomeName = 'invitations') {
        this.cellClient = cellClient;
        this.zomeName = zomeName;
    }
    sendInvitation(input) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.callZome('send_invitation', input);
        });
    }
    getMyPendingInvitations() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.callZome('get_my_pending_invitations', null);
        });
    }
    acceptInvitation(invitation_header_hash) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.callZome('accept_invitation', invitation_header_hash);
        });
    }
    rejectInvitation(invitation_header_hash) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.callZome('reject_invitation', invitation_header_hash);
        });
    }
    clearInvitation(invitation_header_hash) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.callZome('clear_invitation', invitation_header_hash);
        });
    }
    callZome(fn_name, payload) {
        return this.cellClient.callZome(this.zomeName, fn_name, payload);
    }
}

class InvitationsStore {
    constructor(cellClient, clearOnInvitationComplete = false) {
        this.cellClient = cellClient;
        this.clearOnInvitationComplete = clearOnInvitationComplete;
        this.invitations = writable({});
        this.pendingInvitations = derived(this.invitations, invitations => {
            const pending = {};
            for (const [hash, info] of Object.entries(invitations)) {
                if (!isInvitationCompleted(invitations[hash])) {
                    pending[hash] = info;
                }
            }
            return pending;
        });
        this.invitationsService = new InvitationsService(cellClient);
        this.invitationsService.cellClient.addSignalHandler(s => this.signalHandler(s));
    }
    invitationInfo(invitationHash) {
        return derived(this.invitations, invitations => invitations[invitationHash]);
    }
    get myAgentPubKey() {
        return serializeHash(this.invitationsService.cellClient.cellId[1]);
    }
    fetchMyPendingInvitations() {
        return __awaiter(this, void 0, void 0, function* () {
            // Pedir al backend
            const pending_invitations_entries_info = yield this.invitationsService.getMyPendingInvitations();
            this.invitations.update(invitations => {
                pending_invitations_entries_info.map(invitation_entry_info => {
                    invitations[invitation_entry_info.invitation_entry_hash] =
                        invitation_entry_info;
                });
                return invitations;
            });
        });
    }
    sendInvitation(inviteesList) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.invitationsService.sendInvitation(inviteesList);
            yield this.fetchMyPendingInvitations();
        });
    }
    acceptInvitation(invitation_entry_hash) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.invitationsService.acceptInvitation(invitation_entry_hash);
            return new Promise(resolve => {
                this.invitations.update(invitations => {
                    const invitationInfo = invitations[invitation_entry_hash];
                    invitationInfo.invitees_who_accepted.push(this.myAgentPubKey);
                    if (this.clearOnInvitationComplete &&
                        isInvitationCompleted(invitationInfo)) {
                        this.clearInvitation(invitation_entry_hash).then(() => resolve(null));
                    }
                    else {
                        resolve(null);
                    }
                    return invitations;
                });
            });
        });
    }
    rejectInvitation(invitation_entry_hash) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.invitationsService.rejectInvitation(invitation_entry_hash);
            this.invitations.update(invitations => {
                delete invitations[invitation_entry_hash];
                return invitations;
            });
        });
    }
    clearInvitation(invitation_entry_hash) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.invitationsService.clearInvitation(invitation_entry_hash);
        });
    }
    invitationReceived(signal) {
        const invitation = signal.payload.InvitationReceived;
        this.invitations.update(invitations => {
            invitations[invitation.invitation_entry_hash] = invitation;
            return invitations;
        });
    }
    invitationAccepted(signal) {
        return __awaiter(this, void 0, void 0, function* () {
            const invitation = signal.payload.InvitationAccepted;
            this.invitations.update(invitations => {
                invitations[invitation.invitation_entry_hash] = invitation;
                return invitations;
            });
            if (this.clearOnInvitationComplete && isInvitationCompleted(invitation)) {
                yield this.clearInvitation(invitation.invitation_entry_hash);
            }
        });
    }
    invitationRejected(signal) {
        const invitation = signal.payload.InvitationRejected;
        this.invitations.update(invitations => {
            invitations[invitation.invitation_entry_hash] = invitation;
            return invitations;
        });
    }
    signalHandler(signal) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (signal.data.payload.name) {
                case 'invitation received':
                    this.invitationReceived(signal.data.payload);
                    break;
                case 'invitation accepted':
                    this.invitationAccepted(signal.data.payload);
                    break;
                case 'invitation updated':
                    break;
                case 'invitation rejected':
                    this.invitationRejected(signal.data.payload);
                    break;
            }
        });
    }
}

export { CreateInvitation, InvitationStatus, InvitationsList, InvitationsService, InvitationsStore, invitationsStoreContext };
//# sourceMappingURL=index.js.map
