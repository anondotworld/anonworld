# Noir get_transaction binary circuit

This is a binary Noir crate used to generate transaction proofs.

```rust
fn main(chain_id: pub Field, block_number: pub u64, tx_idx: pub Field) -> pub TransactionWithinBlock<MAX_DATA_LEN>;
```

Prover data is located in [`Prover.toml`](Prover.toml)
