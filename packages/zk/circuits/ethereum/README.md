# Noir Ethereum history api circuits

Noir circuits for proving and verifying historical data on the Ethereum blockchain and other EVMs.

## Main library content

The main library is available in [lib/](./lib) directory and consists of:

- Generation of proofs for:
  - [block headers](./get_header/README.md)
  - [ethereum accounts](./get_account/README.md)
  - [smart contract storage variables](./get_storage/README.md)
  - [transaction](./get_transaction/README.md)
  - [receipts](./get_receipt/README.md)
  - [logs](./get_log/README.md)
- [rlp decoding](./lib/src/rlp/README.md) used by Ethereum to store data
- [merkle patricia proofs](./lib/src/merkle_patricia_proofs/README.md) - implementation for Ethereum Merkle Patricia tries
- [fragments](./lib/src/misc/fragment.nr) structure similar to Rust's slice, used for parsing data
- Basic Ethereum data types:
  [U256](./lib/src/misc/uint256.nr),
  [Address](./lib/src/misc/types.nr),
  [Bytes32](./lib/src/misc/types.nr),
  [Hash](./lib/src/misc/types.nr), along with util functions.

Additionally, there are binary crates used for recursive proving. See detailed structure in the following section.

## Circuit folder structure

| Package                                             | Description                                          | Docs                                      |
| --------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------- |
| [`lib`](./lib/)                                     | Main library containing oracles & verifiers          | [Docs](./lib/README.md)                   |
| [`get_header`](./get_header/)                       | Binary crate for generating header proofs            | [Docs](./get_header/README.md)            |
| [`get_account`](./get_header/)                      | Binary crate for generating account proofs           | [Docs](./get_account/README.md)           |
| [`get_storage`](./get_storage/)                     | Binary crate for generating storage proofs           | [Docs](./get_storage/README.md)           |
| [`get_storage_recursive`](./get_storage_recursive/) | Binary crate for generating recursive storage proofs | [Docs](./get_storage_recursive/README.md) |
| [`get_receipt`](./get_receipt/)                     | Binary crate for generating receipt proofs           | [Docs](./get_receipt/README.md)           |
| [`get_transaction`](./get_transaction/)             | Binary crate for generating transaction proofs       | [Docs](./get_transaction/README.md)       |
| [`get_log`](./get_log/)                             | Binary crate for generating log proofs               | [Docs](./get_log/README.md)       |

### Recursive binaries

Some binary crates have `_recursive` suffix. This means that their `main` function is decorated with `#[recursive]` attribute. It instructs `nargo` to generate proofs that are possible to verify within another circuit using `std::verify_proof`. Unfortunately - Solidity can only verify normal proofs, so we need both.

## Compile

```sh
nargo compile --workspace
```

or a single package:

```sh
nargo compile --package ${package_name}
```

Compiled artifacts will be placed in [target](../../target/) folder.

## Test

```sh
nargo test
```

Note: _New `nargo` runs tests in parallel and prints the whole test output at the end, so it's expected to not see any output for the first couple of seconds._

## Profile

```sh
nargo info --workspace
```

or a single package:

```sh
nargo info --package ${package_name}
```

## Generate Solidity verifiers

```sh
nargo codegen-verifier --workspace
```

or a single package:

```sh
nargo codegen-verifier --package ${package_name}
```

Note: _This step may take up to several minutes._

Generated verifiers will be placed in [`contract/${package_name}/plonk_vk.sol`](../../contract/) folder.

Each one will have a `verify(bytes proof, bytes32[] publicInputs) (bool)` function that can be used to verify proofs.

## Generate proofs

### Prerequisites

We use oracles and therefore you need to run the `Oracle server` before generating proofs.
Please consult [Oracle server](../oracles/README.md#starting-oracle-server) docs on how to start it or [noir docs](https://noir-lang.org/docs/how_to/how-to-oracles/#step-3---usage-with-nargo) for detailed docs on oracle usage.

```sh
nargo prove --package ${package_name} --oracle-resolver http://localhost:5555
```

Generated proofs will be placed in [proofs](../../proofs/) folder.
