# school.paolo565.org [![MIT License][licensebadge]](LICENSE) [![pipeline status][badge]][actions]
_A progressive web app which improves the interaction with my school's school hours page_

Try it here: [school.paolo565.org][website].

## Building
school.paolo565.org requires Rust 1.39 or later to build. The latest release can be installed via [rustup][rustup]

Once the Rust build environment is setup, the source code can be fetched using git:

    $ git clone -b v2 https://github.com/paolobarbolini/school.paolo565.org.git

and then built using Cargo

    $ cargo build --release

The executable will be available at `target/release/school_paolo565_org`

## Third party dependencies
[PDF.js][pdfjs] by Mozilla Labs, Apache 2.0 license

[Font Awesome 5][fa] svg icons by Dave Gandy

App icon made by [Freepik][freepik] from
[Flaticon][flaticon] licensed by [CC 3.0 BY][cc]

[licensebadge]: https://img.shields.io/badge/license-Apache%202-blue
[website]: https://school.paolo565.org
[pdfjs]: https://github.com/mozilla/pdf.js
[fa]: https://fontawesome.com/license/free
[freepik]: https://www.freepik.com
[flaticon]: https://www.flaticon.com
[cc]: http://creativecommons.org/licenses/by/3.0/
[actions]: https://github.com/paolobarbolini/school.paolo565.org/actions?query=workflow%3ACI
[badge]: https://github.com/paolobarbolini/school.paolo565.org/workflows/CI/badge.svg
[rustup]: https://rustup.rs
