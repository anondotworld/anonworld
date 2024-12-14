use crate::misc::iterator::Iterator;

pub fn bounded_vec_from_array<T, let N: u32, let M: u32>(array: [T; N]) -> BoundedVec<T, M> {
    assert(N <= M, "Array size exceeds bounded vector size");
    let mut vec = BoundedVec::new();
    vec.extend_from_array(array);

    vec
}

pub fn bounded_vec_map<U, T, let N: u32, Env>(
    bounded_vec: BoundedVec<T, N> ,
    f: fn[Env](T) -> U
) -> BoundedVec<U, N> {
    let result: &mut BoundedVec<U, N> = &mut BoundedVec::new();
    bounded_vec.each(|x, _| result.push(f(x)));

    *result
}

impl<T, let N: u32> Iterator<T> for BoundedVec<T, N> {
    fn each<Env>(self, f: fn[Env](T, u32) -> ()) {
        for i in 0..N {
            if i < self.len {
                f(self.get(i), i);
            }
        }
    }
}
