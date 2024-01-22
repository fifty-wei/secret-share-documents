# Secret Contracts Starter Pack

This is a template to build secret contracts in Rust to run in
[Secret Network](https://github.com/scrtlabs/SecretNetwork).
To understand the framework better, please read the overview in the
[cosmwasm repo](https://github.com/CosmWasm/cosmwasm/blob/master/README.md),
and dig into the [cosmwasm docs](https://www.cosmwasm.com).
This assumes you understand the theory and just want to get coding.

## Using your project

Check the [Developing] section bellow to explain
more on how to run tests and develop code. Or go through the
[online tutorial](https://www.cosmwasm.com/docs/getting-started/intro) to get a better feel
of how to develop.

[Publishing](./Publishing.md) contains useful information on how to publish your contract
to the world, once you are ready to deploy it on a running blockchain. And

[Importing](./Importing.md) contains information about pulling in other contracts or crates
that have been published.

You can also find lots of useful recipes in the `Makefile` which you can use
if you have `make` installed (very recommended. at least check them out).

Please replace this README file with information about your specific project. You can keep
the `Developing.md` and `Publishing.md` files as useful referenced, but please set some
proper description in the README.


# Developing

If you have recently created a contract with this template, you probably could use some
help on how to build and test the contract, as well as prepare it for production. This
file attempts to provide a brief overview, assuming you have installed a recent
version of Rust already (eg. 1.41+).



## Prerequisites

Before starting, make sure you have [rustup](https://rustup.rs/) along with a
recent `rustc` and `cargo` version installed. Currently, we are testing on 1.41+.

And you need to have the `wasm32-unknown-unknown` target installed as well.

You can check that via:

```sh
rustc --version
cargo --version
rustup target list --installed
# if wasm32 is not listed above, run this
rustup target add wasm32-unknown-unknown
```

## Compiling and running tests

Now that you created your custom contract, make sure you can compile and run it before
making any changes. Go into the

```sh
# this will produce a wasm build in ./target/wasm32-unknown-unknown/release/secret_share_documents.wasm
cargo wasm
```

```sh
# this runs unit tests with helpful backtraces
RUST_BACKTRACE=1 cargo unit-test

# this runs integration tests with cranelift backend (uses rust stable)
cargo integration-test

# auto-generate json schema
cargo schema
```


## Run integration tests

To run the latest integration tests, you need to explicitely rebuild the Wasm file with
`cargo wasm` and then run `cargo integration-test`.

## Generating JSON Schema

While the Wasm calls (`init`, `handle`, `query`) accept JSON, this is not enough
information to use it. We need to expose the schema for the expected messages to the
clients. You can generate this schema by calling `cargo schema`, which will output
4 files in `./schema`, corresponding to the 3 message types the contract accepts,
as well as the internal `State`.

These files are in standard json-schema format, which should be usable by various
client side tools, either to auto-generate codecs, or just to validate incoming
json wrt. the defined schema.


## Preparing the Wasm bytecode for production

Before we upload it to a chain, we need to ensure the smallest output size possible,
as this will be included in the body of a transaction. We also want to have a
reproducible build process, so third parties can verify that the uploaded Wasm
code did indeed come from the claimed rust code.

To solve both these issues, we have produced `rust-optimizer`, a docker image to
produce an extremely small build output in a consistent manner. The suggest way
to run it is this:

```sh
docker run --rm -v "$$(pwd)":/contract \
    --mount type=volume,source="$$(basename "$$(pwd)")_cache",target=/contract/target \
    --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
    enigmampc/secret-contract-optimizer:1.0.8
```

We must mount the contract code to `/contract`. You can use an absolute path instead
of `$(pwd)` if you don't want to `cd` to the directory first. The other two
volumes are nice for speedup. Mounting `/contract/target` in particular is useful
to avoid docker overwriting your local dev files with root permissions.
Note the `/contract/target` cache is unique for each contract being compiled to limit
interference, while the registry cache is global.

This is rather slow compared to local compilations, especially the first compile
of a given contract. The use of the two volume caches is very useful to speed up
following compiles of the same contract.

This produces a `contract.wasm` file in the current directory (which must be the root
directory of your rust project, the one with `Cargo.toml` inside). As well as
`hash.txt` containing the Sha256 hash of `contract.wasm`, and it will rebuild
your schema files as well.

### Testing production build

Once we have this compressed `contract.wasm`, we may want to ensure it is actually
doing everything it is supposed to (as it is about 4% of the original size).
If you update the "WASM" line in `tests/integration.rs`, it will run the integration
steps on the optimized build, not just the normal build. I have never seen a different
behavior, but it is nice to verify sometimes.

```rust
static WASM: &[u8] = include_bytes!("../contract.wasm");
```

Note that this is the same (deterministic) code you will be uploading to
a blockchain to test it out, as we need to shrink the size and produce a
clear mapping from wasm hash back to the source code.
