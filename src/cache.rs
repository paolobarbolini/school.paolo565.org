use crate::error::Result;
use cached::TimedCache;
use reqwest::blocking::{Client, ClientBuilder, Response};

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
}

cached! {
    STRING_CACHE: TimedCache<String, Result<String>> = TimedCache::with_lifespan_and_capacity(60 * 20, 200);
    fn reqwest_text(url: String) -> Result<String> = {
        let resp = request(url)?;
        let text = resp.text()?;
        Ok(text)
    }
}

cached! {
    DATA_CACHE: TimedCache<String, Result<Vec<u8>>> = TimedCache::with_lifespan_and_capacity(60 * 60 * 24, 25);
    fn reqwest_data(url: String) -> Result<Vec<u8>> = {
        let mut resp = request(url)?;
        let mut buf: Vec<u8> = vec![];
        resp.copy_to(&mut buf)?;

        Ok(buf)
    }
}

fn request(url: String) -> Result<Response> {
    let resp = HTTP_CLIENT.get(&url).send()?.error_for_status()?;
    Ok(resp)
}
