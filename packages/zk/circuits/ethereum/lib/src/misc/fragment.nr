use crate::misc::{arrays::{memcpy_up_to_length, resize}, iterator::Iterator};
use dep::std::mem::zeroed;

struct Fragment<let MAX_DATA_LEN: u32, T> {
    offset: u32,
    length: u32,
    data: [T; MAX_DATA_LEN]
}

impl<let MAX_DATA_LEN: u32, T> Fragment<MAX_DATA_LEN, T> {
    pub fn empty() -> Fragment<MAX_DATA_LEN, T> {
        Fragment { offset: 0, length: 0, data: std::mem::zeroed() }
    }

    pub fn new(offset: u32, length: u32, data: [T; MAX_DATA_LEN]) -> Fragment<MAX_DATA_LEN, T> {
        assert(offset + length <= data.len(), "Fragment length exceeds data length");

        Fragment { offset, length, data }
    }

    pub fn new_with_length(length: u32, data: [T; MAX_DATA_LEN]) -> Fragment<MAX_DATA_LEN, T> {
        assert(length <= data.len(), "Fragment length exceeds data length");

        Fragment { offset: 0, length, data }
    }

    pub fn from_array(data: [T; MAX_DATA_LEN]) -> Fragment<MAX_DATA_LEN, T> {
        Fragment { offset: 0, length: data.len(), data }
    }

    pub fn from_array_resize<let DATA_LEN: u32>(data: [T; DATA_LEN]) -> Fragment<MAX_DATA_LEN, T> {
        Fragment { offset: 0, length: data.len(), data: resize(data) }
    }

    pub fn to_array<let NEW_MAX_LEN: u32>(self) -> [T; NEW_MAX_LEN] {
        self.focus().data
    }

    pub fn to_bounded_vec<let N: u32>(self) -> BoundedVec<T, N> {
        assert(self.length <= N, "Fragment length exceeds BoundedVec max length");
        let bounded_vec: &mut BoundedVec<T, N> = &mut BoundedVec::new();
        self.each(|x, _| bounded_vec.push(x));

        *bounded_vec
    }

    pub fn from_vec(vec: BoundedVec<T, MAX_DATA_LEN>) -> Fragment<MAX_DATA_LEN, T> {
        Fragment::new_with_length(vec.len, vec.storage)
    }

    pub fn focus<let NEW_MAX_LEN: u32>(self) -> Fragment<NEW_MAX_LEN, T> {
        assert(NEW_MAX_LEN >= self.length, "New max length is smaller than fragment length");

        let mut new_data: [T; NEW_MAX_LEN] = std::mem::zeroed();
        memcpy_up_to_length(&mut new_data, self.data, self.offset, self.length);

        Fragment { offset: 0, length: self.length, data: new_data }
    }

    pub fn subfragment(self, offset: u32, length: u32) -> Fragment<MAX_DATA_LEN, T> {
        assert(offset + length <= self.length, "Subfragment overflows fragment");

        Fragment { offset: self.offset + offset, length, data: self.data }
    }

    pub fn is_empty(self) -> bool {
        self.length == 0
    }

    pub fn at(self, index: u32) -> T {
        // Previously, the assert message was f"Index out of bounds, tried to access index {index} but the length is {length}".
        // However, this contributed to a compiler panic with message: Resolving an assert message should happen only once as the VM should have failed.
        // An issue was posted about this to Noir: https://github.com/noir-lang/noir/issues/5036
        // As of nargo 0.29.0 replacing the f-string with normal string prevents compiler panic e.g. on header_int_test.
        assert(index < self.length, "Index out of bounds");

        self.data[self.offset + index]
    }

    pub fn set(&mut self, index: u32, value: T) {
        let length = self.length;
        assert(
            index < self.length, f"Index out of bounds, tried to set at index {index} but the length is {length}"
        );

        self.data[self.offset + index] = value;
    }

    pub fn pop_front(&mut self) -> T {
        assert(!self.is_empty(), "Cannot pop from an empty fragment");
        self.offset += 1;
        self.length -= 1;
        self.data[self.offset - 1]
    }

    pub fn pop_front_array<let LEN: u32>(&mut self) -> [T; LEN] {
        assert(self.length >= LEN, "Cannot pop array: fragment is too short");
        let mut res: [T; LEN] = std::mem::zeroed();
        res.map(|_| self.pop_front())
    }

    pub fn pop_back(&mut self) -> T {
        assert(!self.is_empty(), "Cannot pop from an empty fragment");
        self.length -= 1;
        self.data[self.offset + self.length]
    }

    pub fn push_back(&mut self, value: T) {
        assert(self.offset + self.length + 1 <= MAX_DATA_LEN, "Cannot push: fragment is full");
        self.data[self.offset + self.length] = value;
        self.length += 1;
    }

    pub fn extend_back<let LEN: u32>(&mut self, other: [T; LEN]) {
        for i in 0..LEN {
            self.push_back(other[i]);
        }
    }

    pub fn eq<let OTHER_MAX_DATA_LEN: u32>(self, other: Fragment<OTHER_MAX_DATA_LEN, T>) -> bool where T: Eq {
        let res = &mut true;
        if (self.length != other.length) {
            *res = false;
        }
        self.each(
            |el, i| {
            if i < other.length {
                *res &= el == other.at(i);
            }
        }
        );

        *res
    }
}

impl<let MAX_DATA_LEN: u32, T> Eq for Fragment<MAX_DATA_LEN, T> where T: Eq {
    fn eq(self, other: Fragment<MAX_DATA_LEN, T>) -> bool {
        let res = &mut true;
        if self.length != other.length {
            *res = false;
        } else {
            self.each(|el, i| {
                *res &= el == other.at(i);
            });
        };

        *res
    }
}

impl<let MAX_DATA_LEN: u32, T> Iterator<T> for Fragment<MAX_DATA_LEN, T> {
    fn each<Env>(self, f: fn[Env](T, u32) -> ()) {
        for i in 0..MAX_DATA_LEN {
            if i < self.length {
                f(self.at(i), i);
            }
        }
    }
}
