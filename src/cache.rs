use crate::error::{Error, Result};
use cached::TimedCache;
use reqwest::Response;

cached! {
    STRING_CACHE: TimedCache<String, Result<String>> = TimedCache::with_lifespan_and_capacity(60 * 20, 200);
    fn reqwest_text(url: String) -> Result<String> = {
        let mut resp = request(url)?;
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
    let resp = reqwest::get(&url)?;
    if !resp.status().is_success() {
        return Err(Error::UnexpectedStatusCode {
            status: resp.status(),
        });
    }

    Ok(resp)
}
