use std::collections::HashMap;
use std::time::Duration;

use unhtml::FromHtml;
use url::Url;

use crate::cache::reqwest_text;
use crate::error::Result;

pub async fn load_articles() -> Result<Vec<ArticleItem>> {
    let url = "http://www.istitutogobetti.it/?option=com_content&view=category&id=20&Itemid=111&limit=250";
    let text = reqwest_text(url.into(), Duration::from_secs(15 * 60)).await?;

    let parsed = ArticleItems::from_html(&text)?;
    Ok(parsed.relevant_articles())
}

#[derive(FromHtml, Debug)]
#[html(selector = "#jsn-mainbody .jsn-infotable")]
pub struct ArticleItems {
    #[html(selector = ".sectiontableentry1 a, .sectiontableentry2 a")]
    articles: Vec<ArticleItem>,
}

impl ArticleItems {
    fn relevant_articles(&self) -> Vec<ArticleItem> {
        for (i, article) in self.articles.iter().enumerate() {
            if article.title.starts_with("Circ. 1 ") {
                let mut articles = self.articles.clone();
                articles.truncate(i + 1);
                return articles;
            }
        }

        self.articles.clone()
    }
}

#[derive(FromHtml, Clone, Debug)]
pub struct ArticleItem {
    #[html(attr = "inner")]
    pub title: String,

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
}
