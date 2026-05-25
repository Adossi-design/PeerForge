#!/usr/bin/env bash
# commit-helper.sh
#
# Lightweight assistant for committing changes file-by-file (or in small
# logical groups) with consistent, conventional-commit-style messages.
#
# Usage:
#   ./scripts/commit-helper.sh                # interactive walkthrough
#   ./scripts/commit-helper.sh --list         # list modified files only
#   ./scripts/commit-helper.sh -m "msg" PATH  # one-shot commit of PATH(s)
#
# Notes:
#   - Commit messages should be imperative and under ~72 chars.
#   - Conventional prefixes used in this repo: feat / fix / refactor / chore / docs.
#   - Scopes used: (api), (web).  Omit for repo-wide changes.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

usage() {
    cat <<EOF
Usage:
  $0                       Walk through changed files interactively.
  $0 --list                Print files changed since HEAD.
  $0 -m <message> <paths>  Commit the given paths with the given message.
EOF
}

list_changes() {
    git status --short
}

prompt_message() {
    local default="$1"
    local msg
    read -e -r -p "Commit message [$default]: " msg
    echo "${msg:-$default}"
}

interactive() {
    local files
    mapfile -t files < <(git status --porcelain | awk '{print $2}')
    if [[ ${#files[@]} -eq 0 ]]; then
        echo "Nothing to commit."
        exit 0
    fi
    for f in "${files[@]}"; do
        echo
        echo "--- $f ---"
        git --no-pager diff -- "$f" | head -20
        local default
        default=$(suggest_message "$f")
        local msg
        msg=$(prompt_message "$default")
        git add -- "$f"
        git commit -m "$msg"
    done
}

suggest_message() {
    local path="$1"
    case "$path" in
        apps/api/src/*)
            echo "refactor(api): update $(basename "$path" .ts)"
            ;;
        apps/web/components/*)
            echo "feat(web): update $(basename "$path" .tsx) component"
            ;;
        apps/web/app/*)
            echo "feat(web): update $(basename "$path" .tsx) page"
            ;;
        apps/web/lib/*)
            echo "refactor(web): update $(basename "$path" .ts)"
            ;;
        *.md)
            echo "docs: update $(basename "$path")"
            ;;
        *)
            echo "chore: update $path"
            ;;
    esac
}

main() {
    case "${1:-}" in
        --list|-l) list_changes ;;
        -m)
            shift
            local msg="$1"; shift
            git add -- "$@"
            git commit -m "$msg"
            ;;
        -h|--help) usage ;;
        "") interactive ;;
        *) usage; exit 1 ;;
    esac
}

main "$@"
