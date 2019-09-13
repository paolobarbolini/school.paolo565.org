use crate::error::Result;
use unhtml::scraper::{Html, Selector};
use unhtml::FromHtml;
use url::Url;

pub fn load_hour(url: String) -> Result<Hour> {
    let text = reqwest::get(&url)?.text()?;

    let mut urls = Hour::from_html(&text)?;
    urls.classes = url_to_abs(urls.classes, &url);
    urls.teachers = url_to_abs(urls.teachers, &url);
    urls.classrooms = url_to_abs(urls.classrooms, &url);
    Ok(urls)
}

fn url_to_abs(items: Vec<HourItem>, base: &str) -> Vec<HourItem> {
    let mut new_items = Vec::new();
    for u in &items {
        let url = u.abs_url(base);
        new_items.push(HourItem {
            title: u.title.clone(),
            url,
        });
    }
    new_items
}

#[derive(FromHtml, Clone, Serialize, Debug)]
#[html(selector = "center:nth-of-type(2) table")]
pub struct Hour {
    #[html(selector = "td:nth-of-type(1) a")]
    pub classes: Vec<HourItem>,

    #[html(selector = "td:nth-of-type(2) a")]
    pub teachers: Vec<HourItem>,

    #[html(selector = "td:nth-of-type(3) a")]
    pub classrooms: Vec<HourItem>,
}

#[derive(FromHtml, Clone, Serialize, Debug)]
pub struct HourItem {
    #[html(attr = "inner")]
    pub title: String,

    #[html(attr = "href")]
    pub url: String,
}

impl HourItem {
    fn parsed_url(&self, base: &str) -> url::Url {
        let parsed_url = Url::parse(base).unwrap();
        parsed_url.join(&self.url).unwrap()
    }

    pub fn abs_url(&self, base: &str) -> String {
        self.parsed_url(base).into_string()
    }

    pub fn html(&self, base: &str) -> Result<String> {
        let url = self.abs_url(base);
        let text = reqwest::get(&url)?.text()?;
        let fragment = Html::parse_document(&text);

        let selector = Selector::parse("center:nth-of-type(2)").unwrap();
        let mut table = fragment.select(&selector);
        let table = table.next().unwrap();

        // TODO: prettify table
        // TODO: update HREFs

        Ok(table.inner_html())
    }
}
