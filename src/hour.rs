use crate::cache::reqwest_text;
use crate::error::Result;
use unhtml::scraper::{Html, Selector};
use unhtml::FromHtml;
use url::Url;

pub fn load_hour(url: String) -> Result<Hour> {
    let text = reqwest_text(url.to_owned()).unwrap();

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
        let text = reqwest_text(url.to_owned()).unwrap();
        let fragment = Html::parse_document(&text);

        let table_selector = Selector::parse("center:nth-of-type(2)").unwrap();
        let mut table = fragment.select(&table_selector);
        let table = table.next().unwrap();

        // TODO: prettify table

        let mut replacer = Vec::new();
        let a_selector = Selector::parse("a").unwrap();
        for a in table.select(&a_selector) {
            let href = a.value().attr("href");
            if let Some(original_href) = href {
                if !original_href.starts_with("../") || !original_href.ends_with(".html") {
                    continue;
                }

                let href = &original_href[3..original_href.len() - ".html".len()];
                let i = href.find('/').unwrap();
                let href = format!("/{}{}", &href[..i].to_lowercase(), &href[i..]);
                replacer.push((original_href, href));
            }
        }

        // TODO: is there a better way of updating the href?
        let mut html = table.inner_html();
        for replace in replacer {
            html = html.replace(&replace.0, &replace.1);
        }
        Ok(html)
    }
}
