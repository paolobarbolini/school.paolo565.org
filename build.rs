use std::env;
use std::fs;
use std::path::Path;
use std::process::Command;

fn main() {
    let out_dir = env::var("CARGO_MANIFEST_DIR").unwrap();
    let in_path = Path::new(&out_dir).join("frontend/service-worker.js");
    let out_path = Path::new(&out_dir).join("frontend/service-worker.build.js");
    let hash_path = Path::new(&out_dir).join("views/partials/commithash.hbs");

    let out = Command::new("git")
        .args(&["rev-parse", "HEAD"])
        .current_dir(out_dir)
        .output()
        .expect("failed to get last git commit hash");
    let hash = String::from_utf8(out.stdout).unwrap();
    let hash = &hash[..8];

    let content = fs::read_to_string(in_path).expect("unable to open service-worker.js");
    let content = content.replace("{{last_commit_hash}}", &hash);

    fs::write(out_path, content).expect("unable to write to service-worker.build.js");
    fs::write(hash_path, hash).expect("unable to write to views/partials/commithash.hbs");
}
