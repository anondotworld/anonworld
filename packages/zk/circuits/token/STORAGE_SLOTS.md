# Solidity storage slots

This is a [Noir](https://noir-lang.org) library for calculating storage locations (later: slots) of Solidity variables. More on storage layout and slots [here](./STORAGE_LAYOUT.md).

The library consists of the following functions:

- ```rust
  pub(crate) fn mapping(slot: Bytes32, key: Bytes32) -> Bytes32;
  ```

  Takes in the mapping `slot`, the `key` and outputs the respective value `slot`.

- ```rust
  pub(crate) fn dynamic_array(slot: Bytes32, size: Field, index: Field) -> Bytes32;
  ```

  Takes in the array `slot`, the element `size` and `index` and outputs the respective element `slot`.

  ```rust
  pub(crate) fn dynamic_array_with_precalculated_slot(slot: Bytes32, size: Field, index: Field) -> Bytes32;
  ```

  Similar to a function above, but instead of taking in the array slot it takes in the slot of it's first element which is equal to the `keccak` of the array slot.

  This is useful in cases like EIP 1967 where storage slot is computed manually from variable name instead of numeric storage slot to avoid collisions and achieve storage slots stability throughout code upgrades.
  Example:
  Storage slot `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc` (obtained as `bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1))`.

- ```rust
  pub(crate) fn struct_slot(slot: Bytes32, offset: Field) -> Bytes32;
  ```

  Takes in the struct `slot`, the element `offset` and outputs the respective struct field `slot`.

## Examples

Below is the example of how we can use this library to find a storage slot of an NFT owner by `token_id`.

### [CryptoPunks](https://etherscan.io/address/0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb#code)

Owners of tokens are stored in a map at position 10.

```solidity
mapping (uint => address) public punkIndexToAddress;
```

```rust
let owner_slot = mapping(field_to_bytes32(10), token_id)
```

### [Bored Ape Yacht Club](https://etherscan.io/token/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d#code)

This contract is harder to read, but we can use [evm.storage](https://evm.storage/eth/19967215/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d#table) to find storage layout.

```solidity
struct MapEntry {
    _key bytes32;
    _value bytes32; // This contains padded owner address
};

struct EnumerableMap {
    MapEntry[] _entries;
    mapping(bytes32 => uint256) _indexes;
};

EnumerableMap _tokenOwners;
```

`_tokenOwners` is a struct that occupies slots 2 and 3, but we are only interested in it's first field.

`_entries` is a dynamic array of structs (of size 2) and we are interested in the second field (with offset 1).
`_entries` array is indexed by `token_id`.

```rust
let array_elem_size = 2; // This element is a struct with two fields. Owner is the second field
let array_elem_idx = bytes32_to_field(token_id);
let struct_owner_field_offset = 1;
let owner_slot = struct_slot(
    dynamic_array(2, array_elem_size, array_elem_idx),
    struct_owner_field_offset
);
```
