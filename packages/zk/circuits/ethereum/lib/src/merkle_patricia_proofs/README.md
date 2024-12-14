# merkle_patricia_proofs

**merkle_patricia_proofs** is a [Noir](https://noir-lang.org) library for verifying proofs in a [Merkle Patricia Trie](https://ethereum.org/en/developers/docs/data-structures-and-encoding/patricia-merkle-trie/).

It exports function **verify_merkle_proof** that takes a `key`, `value`, `root` and a `proof`, and
verifies whether:

- the value is stored under the given key in the proof,
- the nodes given by the proof hash to the hashes given by the proof and to the given root.

## verify_merkle_proof interface

```rust
pub fn verify_merkle_proof<MAX_PREFIXED_KEY_NIBBLE_LEN, MAX_VALUE_LEN, MAX_DEPTH, MAX_LEAF_LEN>(
    key: Key<MAX_PREFIXED_KEY_NIBBLE_LEN>,
    value: Value<MAX_VALUE_LEN>,
    root: Hash,
    proof: Proof<MAX_DEPTH, MAX_LEAF_LEN>
)
```

**verify_merkle_proof** doesn't return a boolean value but rather succeeds or fails depending on the correctness of given arguments. It takes four parameteres described below:

### Key

`key: Key<MAX_PREFIXED_KEY_NIBBLE_LEN>`: the left-padded key as an array of bytes. The `Key` type is defined as follows:

```rust
type Key<MAX_PREFIXED_KEY_NIBBLE_LEN> = [u8; MAX_PREFIXED_KEY_NIBBLE_LEN];
```

**Note:** the key must be left-padded to `MAX_PREFIXED_KEY_NIBBLE_LEN` which is `(MAX_KEY_LEN + 1) * 2` (prefixed key length in nibbles). This is needed because this value is used underneath for computation. So, when one decides on `MAX_KEY_LEN`, they need to pass a key in bytes that is left-padded to `MAX_PREFIXED_KEY_NIBBLE_LEN: u32 = (MAX_KEY_LEN + 1) * 2`.

**Note:** This library does not support keys longer than 495 bytes (`MAX_KEY_LEN <= 495`).

### Value

`value: Value<MAX_VALUE_LEN>`: the left-padded value as an array of bytes. The `Value` type is defined as follows:

```rust
type Value<MAX_VALUE_LEN> = [u8; MAX_VALUE_LEN];
```

### Root

`root: Hash`: the root of the merkle patricia trie (in bytes) that the proof will be verified against. The `Hash` type is defined as follows:

```rust
type Hash = [u8; 32];
```

### Proof

`proof: Proof<MAX_DEPTH, MAX_LEAF_LEN>`: the proof consisting of nodes along the key path. The `Proof` structure is defined as follows:

```rust
struct Proof<MAX_DEPTH_NO_LEAF, MAX_LEAF_LEN> {
	nodes: [Node; MAX_DEPTH_NO_LEAF],
	leaf: Leaf<MAX_LEAF_LEN>,
	depth: u64
}
```

`Proof` consists of: the nodes except for the leaf node, the leaf node and the depth. A `Node` is an array of bytes of maximum length `MAX_NODE_LEN: u32 = 532`. The leaf however can have arbitrary length as it contains a value of arbitrary length. That's why it is separated from the rest of the nodes. A `Leaf` is an array of bytes of maximum length `MAX_LEAF_LEN`.

**Why is the maximum length of a node equal to 532?**
A node is an RLP-encoded branch or extension node which means that apart from the data it holds, it additionally consists of RLP headers. If a node is a branch node, in a maximum case, it consists of 16 32-bit hashes and an empty string. When RLP headers are taken into account, the maximum length of a branch node is `3 + (16 * (1 + 32) + 1) = 532`.
If the node is an extension node, in a maximum case, it consists of a prefixed key part and a hash. As the maximum length of the key this library supports is 495, when accounting for RLP headers, the maximum length of an extension node is `1 + (2 + (1 + 495)) + (1 + 32) = 532`.

## Acknowledgements

This lib was inspired by [noir-trie-proofs](https://github.com/aragonzkresearch/noir-trie-proofs).
