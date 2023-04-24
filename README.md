
![CI](https://github.com/eyss/invitations/actions/workflows/main.yml/badge.svg)

# Invitation Zome

## Installation and usage

### Including the zome in your DNA

1. Create a new `invitation` folder in the `zomes/coordinator` and `zomes/integrity` of the consuming DNA.
2. Add a `Cargo.toml` in both folders. In the content, paste the `Cargo.toml` content from any zome.
3. Change the `name` properties of the `Cargo.toml` file to `invitation`.
4. Add this zome as a dependency in the `Cargo.toml` file:

```toml
[dependencies]
invitation = {git = "https://github.com/eyss/invitations", package = "invitation"}
```

5. Create a `src` folder besides the `Cargo.toml` with this content:

```rust
extern crate invitation;
```

6. Add the zome into your `dna.yaml` file with the name `invitation`.
7. Compile the DNA with the usual `CARGO_TARGET_DIR=target cargo build --release --target wasm32-unknown-unknown`.

### Using the UI module

1. Install the module with `npm install "https://github.com/eyss/invitation#ui-build"`.



