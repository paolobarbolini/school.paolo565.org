use crate::error::Result;
use reqwest::blocking::{Client, ClientBuilder};
use std::sync::RwLock;
use std::time::Duration;
use ttl_cache::TtlCache;

static APP_USER_AGENT: &str = concat!(
    env!("CARGO_PKG_NAME"),
    "/",
    env!("CARGO_PKG_VERSION"),
    " (",
    env!("CARGO_PKG_REPOSITORY"),
    ")"
);

lazy_static::lazy_static! {
    static ref HTTP_CLIENT: Client = ClientBuilder::new().user_agent(APP_USER_AGENT)
        .build()
        .unwrap();

     static ref CACHE: RwLock<TtlCache<String, Result<Vec<u8>>>> = RwLock::new(TtlCache::new(50));
}

pub fn reqwest_text(url: String, expires_at: Duration) -> Result<String> {
    let data = reqwest_data(url, expires_at)?;
    Ok(String::from_utf8(data).unwrap())
}

pub fn reqwest_data(url: String, expires_at: Duration) -> Result<Vec<u8>> {
    let cache = CACHE.read().unwrap();

    match cache.get(&url) {
        Some(entry) => entry.clone(),
        None => {
            drop(cache);

            let (resp, expires_at) = match reqwest(&url) {
                Ok(resp) => (Ok(resp), expires_at),
                Err(err) => (Err(err), Duration::from_secs(5 * 60)),
            };

            let mut cache = CACHE.write().unwrap();
            cache.insert(url, resp.clone(), expires_at);
            resp
        }
    }
}

fn reqwest(url: &str) -> Result<Vec<u8>> {
    let mut resp = HTTP_CLIENT.get(url).send()?.error_for_status()?;
    let mut buf: Vec<u8> = vec![];
    resp.copy_to(&mut buf)?;

    Ok(buf)
}
