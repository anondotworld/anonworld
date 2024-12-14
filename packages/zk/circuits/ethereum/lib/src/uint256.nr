use dep::std::ops::Add;
use crate::misc::types::Bytes32;
use crate::misc::bytes32::field_to_bytes32;
use crate::misc::arrays::memcpy_up_to_length;

global uint128_overflow_value = 340282366920938463463374607431768211456; // 2^128

struct U256 {
    high: U128,
    low: U128,
}

impl U256 {
    fn new(high: U128, low: U128) -> Self {
        Self { high, low }
    }

    fn zero() -> Self {
        Self { high: U128::from_integer(0), low: U128::from_integer(0) }
    }

    fn one() -> Self {
        Self { high: U128::from_integer(0), low: U128::from_integer(1) }
    }

    fn from_field(field: Field) -> Self {
        U256::from(field_to_bytes32(field))
    }
}

impl From<Bytes32> for U256 {
    fn from(bytes: Bytes32) -> Self {
        let mut high_bytes = [0; 16];
        memcpy_up_to_length(&mut high_bytes, bytes, 16, 16);
        let high = U128::from_le_bytes(high_bytes);

        let mut low_bytes = [0; 16];
        memcpy_up_to_length(&mut low_bytes, bytes, 0, 16);
        let low = U128::from_le_bytes(low_bytes);

        U256::new(high, low)
    }
}

impl Into<Bytes32> for U256 {
    fn into(self) -> Bytes32 {
        let mut bytes = [0; 32];
        memcpy_up_to_length(&mut bytes, self.low.to_le_bytes(), 0, 16);

        let high_bytes = self.high.to_le_bytes();
        for i in 0..16 {
            bytes[i + 16] = high_bytes[i];
        }

        bytes
    }
}

impl Eq for U256 {
    fn eq(self, other: U256) -> bool {
        (self.high == other.high) & (self.low == other.low)
    }
}

impl Add for U256 {
    fn add(self, other: Self) -> Self {
        let lo: Field = self.low.to_integer() + other.low.to_integer();

        let mut low = U128::from_integer(0);
        let mut carry = 0;
        if(lo.lt(uint128_overflow_value)) {
            low = U128::from_integer(lo);
        } else {
            low = U128::from_integer(lo - uint128_overflow_value);
            carry = 1;
        }

        let hi: Field = self.high.to_integer() + other.high.to_integer() + carry;
        assert(hi.lt(uint128_overflow_value), "attempt to add with overflow");

        let high = U128::from_integer(hi);

        Self { high, low }
    }
}
