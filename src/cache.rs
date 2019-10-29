use cached::TimedCache;

cached! {
    STRING_CACHE: TimedCache<String, Option<String>> = TimedCache::with_lifespan_and_capacity(60 * 20, 200);
    fn reqwest_text(url: String) -> Option<String> = {
        let text = reqwest::get(&url).unwrap().text().unwrap();
        Some(text)
    }
}

cached! {
    DATA_CACHE: TimedCache<String, Option<Vec<u8>>> = TimedCache::with_lifespan_and_capacity(60 * 60 * 24, 25);
    fn reqwest_data(url: String) -> Option<Vec<u8>> = {
        let mut resp = reqwest::get(&url).unwrap();
        let mut buf: Vec<u8> = vec![];
        resp.copy_to(&mut buf).unwrap();

        Some(buf)
    }
}
