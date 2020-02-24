use std::error::Error as StdError;
use std::fmt;

use warp::reject::Reject;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Clone, Debug)]
pub enum Error {
    Reqwest {
        description: String,
        not_found: bool,
    },
    Unhtml {
        description: String,
    },
    UrlNotFound,
}

impl Error {
    pub fn not_found(&self) -> bool {
        match &self {
            Error::Reqwest { not_found, .. } => *not_found,
            Error::Unhtml { .. } => false,
            Error::UrlNotFound => true,
        }
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Error::Reqwest { description, .. } => write!(f, "{}", description),
            Error::Unhtml { description } => write!(f, "{}", description),
            Error::UrlNotFound => write!(f, "url not found"),
        }
    }
}

impl StdError for Error {}

impl Reject for Error {}

impl From<reqwest::Error> for Error {
    fn from(err: reqwest::Error) -> Error {
        Error::Reqwest {
            description: err.to_string(),
            not_found: err.status() == Some(reqwest::StatusCode::NOT_FOUND),
        }
    }
}

impl From<unhtml::Error> for Error {
    fn from(err: unhtml::Error) -> Error {
        Error::Unhtml {
            description: err.to_string(),
        }
    }
}
