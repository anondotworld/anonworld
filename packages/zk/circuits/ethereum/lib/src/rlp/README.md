# RLP decoding

This is a [Noir](https://noir-lang.org) library for [RLP](https://ethereum.org/en/developers/docs/data-structures-and-encoding/rlp/) decoding.

RLP encoding operates on two types of items - a string and a list. Therefore this library exports two functions:

```rust
pub fn decode_string<N>(data: Fragment) -> RlpFragment;
```

```rust
pub fn decode_list<N, NUM_FIELDS>(data: Fragment) -> RlpList<NUM_FIELDS>;
```

**Note:** For string elements - offset points at the beginning of the data itself, while for lists - it points at the beginning of it's RLP Header.

The library also exports a more performant special case version of `decode_list`, that can be used when the input consists exclusively of strings of length <= 55 bytes:

```rust
pub fn decode_list_of_small_strings<N, NUM_FIELDS>(data: Fragment) -> RlpList<NUM_FIELDS>;
```

## Example

```rust
let rlp = [0x82, 0x10, 0x00]; // "0x1000"
decode_string(Fragment::from_array(rlp));
// {offset: 1, length: 2, data_type: STRING}

let rlp = [0xc2, 0x80, 0x10]; // ["", "0x10"]
decode_list(Fragment::from_array(rlp));
// [{offset: 2, length: 0, data_type: STRING}, {offset: 2, length: 1, data_type: STRING}]
```

### What is a Fragment?

[Fragment](../misc/README.md) is a dynamically-sized view into a comptime-sized sequence of elements.

# RLP types

## RlpFragment

```Rust
struct RlpFragment {
    offset: u32,
    length: u32,
    data_type: u32 // 0 for STRING, 1 for LIST
}
```

`RlpFragment` contains the `offset` and `length` of the decoded item within the input data. It also contains the `data_type` of an item. Unlike the Fragment it does not contain the data as RLP data can have multiple fields and having multiple data copies is costly.

Whe working with RLP data - it's a common pattern to have a structure (Tx, Log, Receipt) and its RLP encoding and comparing both field by field. To simplify this flow - we export some helper methods on `RlpFragment`. Each of those methods accepts `field_name`, `rlp` and `expected_value`.

- `field_name` is used in assertion messages
- `rlp` contains the data to compare the `value` against using `offset` and `length` from `RlpFragment`
- `value` expected value of particular type

```rust
let rlp = [...];
let decoded = decode_list(Fragment::from_array(rlp));
decoded.get(0).assert_eq_u64("nonce", rlp, 0x10);
decoded.get(1).assert_eq_address("to", rlp, [...]);
```

### The full list of those methods:

- `assert_eq_bytes`
- `assert_eq_bounded_vec`
- `assert_empty_string`
- `assert_eq_u1`
- `assert_eq_u8`
- `assert_eq_u32`
- `assert_eq_u64`
- `assert_eq_u128`
- `assert_eq_address`
- `assert_eq_bytes32`

## RlpList

```Rust
type RlpList<MAX_FIELDS> = BoundedVec<RlpFragment, MAX_FIELDS>;
```

`RlpList` is a list of `RlpFragments`. As the length before decoding data is unknown, the maximum number of fields needs to be passed as a generic parameter. Don't forget to check the actual number of fields returned.

## Acknowledgements

This lib was inspired by [noir-trie-proofs](https://github.com/aragonzkresearch/noir-trie-proofs/blob/main/lib/src/rlp.nr).
