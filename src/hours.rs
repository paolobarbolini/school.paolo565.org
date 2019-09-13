use crate::article::load_article;
use crate::error::Result;
use crate::hour::{load_hour, Hour};
use unhtml::FromHtml;
use url::Url;

pub fn full_load_hour() -> Result<Option<(String, Hour)>> {
    let article = match load_hours_article()? {
        Some(article) => article,
        None => return Ok(None),
    };

    let article = load_article(article)?;
    let hours = match article.hours_url() {
        Some(hours) => hours,
        None => return Ok(None),
    };

    let hour = load_hour(hours.clone())?;
    Ok(Some((hours, hour)))
}

pub fn load_hours_article() -> Result<Option<String>> {
    let url = "http://www.istitutogobetti.it";
    let text = reqwest::get(url)?.text()?;

    let parsed = Hours::from_html(&text)?;
    Ok(parsed.find_hours())
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
    fn parsed_url(&self) -> url::Url {
        let parsed_url = Url::parse("http://www.istitutogobetti.it").unwrap();
        parsed_url.join(&self.url).unwrap()
    }

    pub fn abs_url(&self) -> String {
        self.parsed_url().into_string()
    }
}
