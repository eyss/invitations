# Invitations Zome
## Installation and usage

### Including the zome in your DNA

1. Create a new `invitations` folder in the `zomes` of the consuming DNA.
2. Add a new `Cargo.toml` in that folder. In its content, paste the `Cargo.toml` content from any zome.
3. Change the `name` properties of the `Cargo.toml` file to `invitations`.
4. Add this zome as a dependency in the `Cargo.toml` file:

```toml
[dependencies]
profiles = {git = "https://github.com/eyss/hc_zome_invitations", package = "hc_zome_invitations"}
```

5. Create a `src` folder besides the `Cargo.toml` with this content:

```rust
extern crate hc_zome_invitations;
```

6. Add the zome into your `dna.yaml` file with the name `invitations`.
7. Compile the DNA with the usual `CARGO_TARGET_DIR=target cargo build --release --target wasm32-unknown-unknown`.

### Using the UI module

1. Install the module with `npm install "https://github.com/eyss/hc_zome_invitations#ui-build"`.


2. Import and create the mobx store for profiles and for this module, and define the custom elements you need in your app:

```js
import { connectDeps } from "@holochain-open-dev/common";
import {
  ProfilePrompt,
  ProfilesStore,
  ProfilesService,
} from "@holochain-open-dev/profiles";
import { InvitationsStore, InvitationsService, InvitationsList, CreateInvitation } from "@eyss/invitations";
import { AppWebsocket } from "@holochain/conductor-api";

async function setupProfiles() {
  const appWebsocket = await ConductorApi.AppWebsocket.connect(
    process.env.CONDUCTOR_URL,
    12000
  );
  const appInfo = await appWebsocket.appInfo({
    installed_app_id: "test-app",
  });

  const cellId = appInfo.cell_data[0].cell_id;

  const profilesService = new ProfilesService(appWebsocket, cellId);
  const profilesStore = new ProfilesStore(profilesService);

  const invitationsService = new InvitationsService(appWebsocket, cellId);
  const invitationsStore = new InvitationsStore(invitationsService, profilesStore);

  customElements.define(
    "profile-prompt",
    connectDeps(ProfilePrompt, profilesStore)
  );
  customElements.define(
    "invitations-list",
    connectDeps(InvitationsList, invitationsStore)
  );
  customElements.define(
    "create-invitation",
    connectDeps(CreateInvitation, invitationsStore)
  );
}
```

3. All the elements you have defined are now available to use as normal HTML tags:

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
