# Noir get_header binary circuit

This is a binary Noir crate used to generate header proofs.

```rust
fn main(chain_id: pub Field, block_no: pub Field) -> distinct pub BlockHeaderPartial
```

Prover data is located in [`Prover.toml`](Prover.toml)
