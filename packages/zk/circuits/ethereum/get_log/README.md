# Noir get_log binary circuit

This is a binary Noir crate used to generate log proofs.

```rust
fn main(chain_id: pub Field, block_number: pub u64, tx_idx: pub Field, log_idx: pub u64) -> pub LogWithinBlock<...>;
```

Prover data is located in [`Prover.toml`](Prover.toml)
