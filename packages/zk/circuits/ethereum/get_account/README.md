# Noir get_account binary circuit

This is a binary Noir crate used to generate state proofs.

```rust
fn main(chain_id: pub Field, block_no: pub Field, address: pub Address) -> pub AccountWithinBlock
```

Prover data is located in [`Prover.toml`](Prover.toml)
