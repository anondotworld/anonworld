# Solidity storage layout

EVM storage is a mapping from a `bytes32` key to `bytes32` value. Each of 2<sup>256</sup> values is initialized to `0` by default. It's a kind of long-term memory used as smart contracts' storage. It allows contracts to use variables that aren't cleaned or removed after a function or transaction finish execution.

How variables are stored depends on compiler. This documentation describes how Solidity manages EVM storage.

In Solidity each value in EVM storage is called a **slot**: there are 2<sup>256</sup> slots - 32 bytes each.

From the perspective of storage layout, all values are divided into statically-sized and dynamically-sized and are stored accordingly.

## Statically-sized values

Statically-sized values are stored one after another in consecutive slots in the order of their initialization in the contract. First variable is stored in slot `0`, the second one in slot `1` and so on.

Fields of a structure are stored just as standalone variables:

```Solidity
contract Contract {
    struct A { uint256 a; uint256 b; } // slot 0 & 1
    uint c = 1; // slot 2
}
```

## Dynamically-sized values

Dynamically-sized values can't be stored in the same way as statically-sized values. Adding new elements to an existing dynamic array would demand reallocation of succeeding values.  
Instead, dynamically-sized values are stored at slots chosen by keccak hashing. This is where such an enormous number of storage slots is used - it prevents collisions.  
**Slot position `p`** - the starting position of a structure that is calculated based on previously appearing in contract values - is used to calculate further the positions of data.

### Dynamic arrays

In case of dynamic arrays, position `p` contains the length of the array. Position of the first element is calculated by `keccak256(p)`. The next elements are stored just as statically-sized array's elements - one after another in consecutive slots.

#### Example

```Solidity
contract Contract {
    struct A { uint256 a; uint256 b; }

    A[] array; // length of the array is stored at slot 0
    array.push(A(0x100000, 0x100000)); // slots keccak(0) & keccak(0) + 1
    array.push(A(0x100000, 0x100000)); // slots keccak(0) + 2 & keccak(0) + 3
}
```

### Mapping

Values of mapping are stored at slots calculated by keccak hash of concatenation of the key and `p` number. If the key is a value type, it is additionally padded to 32 bytes.

## Example

```Solidity
contract Contract {
    uint a = 1; // slot 0
    bytes32 b = [...]; //slot 1
    mapping(uint => uint) c; // keccak(key, 3)
    uint d = 1; //slot 4
}
```

## Packing

Packing means merging to values into one slot. This occurs when consecutive variables in the contract fit together into 32 bytes of one slot:

```Solidity
contract Contract {
    uint128 a = 0x100000; // slot 0 bytes [0..16)
    uint128 b = 0x100000; // slot 0 bytes [16..32)
}
```

Variables `a` and `b` will be packed into one slot and memory is saved since this contract uses only one slot.  
At the same time more gas is used when EVM has to perform additional bitwise operations to read only one of the variables stored in one slot - reading `a` and ignoring `b`.

Variables that appear after an array or structure variables, always start a new slot. Similarly arrays and structures also always start a new storage slot.
