![CI](https://github.com/eyss/invitations/actions/workflows/main.yml/badge.svg)


# Invitations Zome

## Installation and usage

### Including the zome in your DNA

1. Create a new `invitations` folder in the `zomes` of the consuming DNA.
2. Add a new `Cargo.toml` in that folder. In its content, paste the `Cargo.toml` content from any zome.
3. Change the `name` properties of the `Cargo.toml` file to `invitations`.
4. Add this zome as a dependency in the `Cargo.toml` file:

```toml
[dependencies]
hc_zome_invitations = {git = "https://github.com/eyss/invitations", package = "hc_zome_invitations"}
```

5. Create a `src` folder besides the `Cargo.toml` with this content:

```rust
extern crate hc_zome_invitations;
```

6. Add the zome into your `dna.yaml` file with the name `invitations`.
7. Compile the DNA with the usual `CARGO_TARGET_DIR=target cargo build --release --target wasm32-unknown-unknown`.

### Using the UI module

1. Install the module with `npm install "https://github.com/eyss/invitations#ui-build"`.

2. Import and create the mobx store for profiles and for this module, and define the custom elements you need in your app:

```js
import {
  ProfilePrompt,
  SearchAgent,
  ProfilesStore,
  profilesStoreContext,
  ListProfiles,
} from "@holochain-open-dev/profiles";
import {
  InvitationsList,
  CreateInvitations,
  InvitationsStore,
} from "@eyss/invitations";
import { AppWebsocket } from "@holochain/conductor-api";
import { HolochainClient } from "@holochain-open-dev/cell-client";
import { LitElement, html } from "lit";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { ContextProvider } from "@lit-labs/context";

class InvitationsTest extends ScopedElementsMixin(LitElement) {
  static get properties() {
    return {
      loaded: {
        type: Boolean,
      },
    };
  }

  async firstUpdated() {
    const appWebsocket = await AppWebsocket.connect("ws://localhost:8888");
    const appInfo = await appWebsocket.appInfo({
      installed_app_id: "test-app",
    });

    const cellData = appInfo.cell_data[0];
    const cellClient = new HolochainClient(appWebsocket, cellData);

    new ContextProvider(
      this,
      profilesStoreContext,
      new ProfilesStore(cellClient, {
        avatarMode: "avatar",
      })
    );
    const invitationsStore = new InvitationsStore(cellClient, {
      clearOnInvitationComplete: false,
    });

    new ContextProvider(this, invitationsStoreContext, invitationsStore);

    this.loaded = true;
  }

  render() {
    if (!this.loaded) return html`<span>Loading...</span>`;
    return html`
      <profile-prompt>
        <create-invitation></create-invitation>
        <invitations-list include-myself></invitations-list>
      </profile-prompt>
    `;
  }

  static get scopedElements() {
    return {
      "create-invitation": ProfilePrompt,
      "invitations-list": SearchAgent,
      "list-profiles": ListProfiles,
    };
  }
}

customElements.define("invitations-test", InvitationsTest);
```

```html
...
<body>
  <profile-prompt style="height: 400px; width: 500px">
    <create-invitation></create-invitations>
    <invitations-list></invitations-list>
  </profile-prompt>
</body>
```

Take into account that at this point the elements already expect a holochain conductor running at `ws://localhost:8888`.

You can see a full working example [here](/ui/demo/index.html).

## Developer setup

Visit the [developer setup](/dev-setup.md).
