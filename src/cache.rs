// school.paolo565.org
// Copyright (C) 2018-2020 Paolo Barbolini
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

use std::time::{Duration, SystemTime};

use bytes::Bytes;
use lru_time_cache::LruCache;
use reqwest::{Client, ClientBuilder};
use tokio::sync::Mutex;

use crate::error::Result;

const APP_USER_AGENT: &str = concat!(
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

    static ref CACHE: Mutex<LruCache<String, CachedItem<Result<Bytes>>>> = Mutex::new(LruCache::with_capacity(100));
}

#[derive(Debug, Clone)]
struct CachedItem<T> {
    item: T,
    expires_at: SystemTime,
}

impl<T> CachedItem<T> {
    pub fn new(item: T, expires_at: Duration) -> Self {
        let expires_at = SystemTime::now() + expires_at;
        Self { item, expires_at }
    }

    pub fn unexpired_item(&self) -> Option<&T> {
        if self.expires_at > SystemTime::now() {
            Some(&self.item)
        } else {
            None
        }
    }
}

pub async fn reqwest_text(url: String, expires_at: Duration) -> Result<String> {
    let data = reqwest_data(url, expires_at).await?;
    Ok(String::from_utf8_lossy(&data).into())
}

pub async fn reqwest_data(url: String, expires_at: Duration) -> Result<Bytes> {
    {
        let mut cache = CACHE.lock().await;
        if let Some(entry) = cache.get(&url).and_then(CachedItem::unexpired_item) {
            return entry.clone();
        }
    }

    let (resp, expires_at) = match reqwest(&url).await {
        Ok(resp) => (Ok(resp), expires_at),
        Err(err) => (Err(err), Duration::from_secs(5 * 60)),
    };

    let value = CachedItem::new(resp.clone(), expires_at);
    {
        let mut cache = CACHE.lock().await;
        cache.insert(url, value);
    }
    resp
}

async fn reqwest(url: &str) -> Result<Bytes> {
    let resp = HTTP_CLIENT.get(url).send().await?.error_for_status()?;
    let bytes = resp.bytes().await?;
    Ok(bytes)
}
