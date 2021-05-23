# Invitations Zome

## nix-shell setup

At first, run from the root folder of this repository to enter the nix-shell:

```bash
nix-shell
```

**You need to be inside this nix-shell to run any of the instructions below.**

## Building the DNA

```bash
cd zome
CARGO_TARGET_DIR=target cargo build --release --target wasm32-unknown-unknown
hc dna pack workdir/dna
hc app pack workdir/happ
```

## Starting the UI

Enter the UI folder:

```bash
cd ui
```

If you haven't yet:

```bash
npm install
```

Then, run this inside the nix-shell in one terminal:

```bash
npm run start-alice
```

And this in another terminal inside the nix-shell as well:

```bash
npm run start-bob
```