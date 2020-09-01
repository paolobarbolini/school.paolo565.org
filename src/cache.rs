use std::time::Duration;

use bytes::Bytes;
use reqwest::{Client, ClientBuilder};
use tokio::sync::RwLock;
use ttl_cache::TtlCache;

use crate::error::Result;

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

     static ref CACHE: RwLock<TtlCache<String, Result<Bytes>>> = RwLock::new(TtlCache::new(50));
}

pub async fn reqwest_text(url: String, expires_at: Duration) -> Result<String> {
    let data = reqwest_data(url, expires_at).await?;
    Ok(String::from_utf8(data.to_vec()).unwrap())
}

pub async fn reqwest_data(url: String, expires_at: Duration) -> Result<Bytes> {
    let cache = CACHE.read().await;

    match cache.get(&url) {
        Some(entry) => entry.clone(),
        None => {
            drop(cache);

            let (resp, expires_at) = match reqwest(&url).await {
                Ok(resp) => (Ok(resp), expires_at),
                Err(err) => (Err(err), Duration::from_secs(5 * 60)),
            };

            let mut cache = CACHE.write().await;
            cache.insert(url, resp.clone(), expires_at);
            resp
        }
    }
}

async fn reqwest(url: &str) -> Result<Bytes> {
    let resp = HTTP_CLIENT.get(url).send().await?.error_for_status()?;
    let bytes = resp.bytes().await?;
    Ok(bytes)
}
