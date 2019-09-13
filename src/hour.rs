use crate::error::Result;
use unhtml::FromHtml;
use url::Url;

pub fn load_hour(url: String) -> Result<Hour> {
    let text = reqwest::get(&url)?.text()?;

    let mut urls = Hour::from_html(&text)?;
    for u in &urls.classes {
        // u.url = u.abs_url(&url);
    }
    for u in &urls.teachers {
        // u.url = u.abs_url(&url);
    }
    for u in &urls.classrooms {
        // u.url = u.abs_url(&url);
    }
    Ok(urls)
}

#[derive(FromHtml, Clone, Serialize, Debug)]
#[html(selector = "center:nth-of-type(2) table")]
pub struct Hour {
    #[html(selector = "td:nth-of-type(1) a")]
    classes: Vec<HourItem>,

    #[html(selector = "td:nth-of-type(2) a")]
    teachers: Vec<HourItem>,

    #[html(selector = "td:nth-of-type(3) a")]
    classrooms: Vec<HourItem>,
}

#[derive(FromHtml, Clone, Serialize, Debug)]
pub struct HourItem {
    #[html(attr = "inner")]
    title: String,

    #[html(attr = "href")]
    url: String,
}

impl HourItem {
    fn parsed_url(&self, base: &str) -> url::Url {
        let parsed_url = Url::parse(base).unwrap();
        parsed_url.join(&self.url).unwrap()
    }

    pub fn abs_url(&self, base: &str) -> String {
        self.parsed_url(base).into_string()
    }
}
