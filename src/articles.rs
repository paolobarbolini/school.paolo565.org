use crate::cache::reqwest_text;
use crate::error::Result;
use serde::ser::{Serialize, SerializeStruct, Serializer};
use std::collections::HashMap;
use unhtml::FromHtml;
use url::Url;

pub fn load_articles() -> Result<Vec<ArticleItem>> {
    let url = "http://www.istitutogobetti.it/?option=com_content&view=category&id=20&Itemid=111&limit=250";
    let text = reqwest_text(url.to_owned()).unwrap();

    let parsed = ArticleItems::from_html(&text)?;
    Ok(parsed.articles)
}

#[derive(FromHtml, Serialize, Debug)]
#[html(selector = "#jsn-mainbody .jsn-infotable")]
pub struct ArticleItems {
    #[html(selector = ".sectiontableentry1 a, .sectiontableentry2 a")]
    articles: Vec<ArticleItem>,
}

#[derive(FromHtml, Debug)]
pub struct ArticleItem {
    #[html(attr = "inner")]
    title: String,

    #[html(attr = "href")]
    url: String,
}

impl ArticleItem {
    fn parsed_url(&self) -> url::Url {
        let parsed_url = Url::parse("http://www.istitutogobetti.it").unwrap();
        parsed_url.join(&self.url).unwrap()
    }

    pub fn id(&self) -> i64 {
        let parsed_url = self.parsed_url();
        let hash_query: HashMap<String, String> = parsed_url.query_pairs().into_owned().collect();
        let id = hash_query.get("id").unwrap();
        let id = &id[..id.find(':').unwrap()];
        id.parse().unwrap()
    }

    pub fn abs_url(&self) -> String {
        self.parsed_url().into_string()
    }
}

impl Serialize for ArticleItem {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut s = serializer.serialize_struct("ArticleItem", 3)?;
        s.serialize_field("id", &self.id())?;
        s.serialize_field("title", &self.title)?;
        s.serialize_field("url", &self.abs_url())?;
        s.end()
    }
}
