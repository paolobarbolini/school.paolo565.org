// school.paolo565.org
// Copyright (C) 2018-2020 Paolo Barbolini
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
