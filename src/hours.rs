use std::time::Duration;

use unhtml::FromHtml;
use url::Url;

use crate::article::load_article;
use crate::cache::reqwest_text;
use crate::error::{Error, Result};
use crate::hour::{load_hour, Hour};

pub async fn full_load_hour() -> Result<(String, Hour)> {
    let article = load_hours_article().await?;
    let article = load_article(article).await?;
    let hours = article.hours_url().ok_or(Error::UrlNotFound)?;
    let hour = load_hour(hours.clone()).await?;
    Ok((hours, hour))
}

pub async fn load_hours_article() -> Result<String> {
    let url = "http://www.istitutogobetti.it";
    let text = reqwest_text(url.into(), Duration::from_secs(60 * 20)).await?;

    let parsed = Hours::from_html(&text)?;
    parsed.find_hours().ok_or(Error::UrlNotFound)
}

#[derive(FromHtml, Debug)]
#[html(selector = "#jsn-pleft")]
pub struct Hours {
    #[html(selector = "a")]
    articles: Vec<HoursItem>,
}

impl Hours {
    pub fn find_hours(&self) -> Option<String> {
        for article in &self.articles {
            let title = article.title.to_lowercase();
            if title.contains("orario") && title.contains("lezioni") {
                return Some(article.abs_url());
            }
        }

        None
    }
}

#[derive(FromHtml, Debug)]
pub struct HoursItem {
    #[html(attr = "inner")]
    title: String,

    #[html(attr = "href")]
    url: String,
}

impl HoursItem {
    fn parsed_url(&self) -> Url {
        let parsed_url = Url::parse("http://www.istitutogobetti.it").unwrap();
        parsed_url.join(&self.url).unwrap()
    }

    pub fn abs_url(&self) -> String {
        self.parsed_url().into_string()
    }
}
