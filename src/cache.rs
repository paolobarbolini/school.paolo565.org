use crate::error::{Error, Result};
use cached::TimedCache;
use reqwest::{
    blocking::{Client, ClientBuilder, Response},
    header::{HeaderMap, HeaderValue, USER_AGENT},
};

lazy_static::lazy_static! {
    static ref HTTP_CLIENT: Client = ClientBuilder::new()
        .default_headers({
            let mut headers = HeaderMap::new();
            headers.insert(
                USER_AGENT,
                HeaderValue::from_static(concat!(
                    "school.paolo565.org/2.0",
                    " (https://github.com/paolobarbolini/school.paolo565.org)"
                )),
            );
            headers
        })
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
    let resp = HTTP_CLIENT.get(&url).send()?;
    if !resp.status().is_success() {
        return Err(Error::UnexpectedStatusCode {
            status: resp.status(),
        });
    }

    Ok(resp)
}
