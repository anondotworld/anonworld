trait Iterator<T> {
    fn each<Env>(self, f: fn[Env](T, u32) -> ());
}
