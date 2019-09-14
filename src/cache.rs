use cached::Cached;
use cached::TimedCache;
use std::sync::Mutex;

lazy_static! {
    static ref STRING_CACHE: Mutex<TimedCache<String, Option<String>>> =
        Mutex::new(TimedCache::with_lifespan_and_capacity(60 * 20, 200));
    static ref DATA_CACHE: Mutex<TimedCache<String, Option<Vec<u8>>>> =
        Mutex::new(TimedCache::with_lifespan_and_capacity(60 * 60 * 24, 25));
}

pub fn reqwest_text(url: String) -> Option<String> {
    {
        let mut cache = STRING_CACHE.lock().unwrap();
        let cached = cache.cache_get(&url);
        if let Some(cached) = cached {
            return cached.to_owned();
        }
    }

    let text = reqwest::get(&url).unwrap().text().unwrap();
    {
        let mut cache = STRING_CACHE.lock().unwrap();
        cache.cache_set(url, Some(text.clone()));
    }

    Some(text)
}

pub fn reqwest_data(url: String) -> Option<Vec<u8>> {
    {
        let mut cache = DATA_CACHE.lock().unwrap();
        let cached = cache.cache_get(&url);
        if let Some(cached) = cached {
            return cached.to_owned();
        }
    }

    let mut resp = reqwest::get(&url).unwrap();
    let mut buf: Vec<u8> = vec![];
    resp.copy_to(&mut buf).unwrap();
    {
        let mut cache = DATA_CACHE.lock().unwrap();
        cache.cache_set(url, Some(buf.clone()));
    }

    Some(buf)
}
