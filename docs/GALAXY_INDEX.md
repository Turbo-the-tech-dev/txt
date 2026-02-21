# The Galaxy - Master Index

> Turbo-the-tech-dev's command center. Motorola + Termux + Ubuntu proot.
> Created: 2026-02-20

---

## Directory Structure & Notes

### `__CLONE_WARS__/`
**Status:** Archive of cloned GitHub repos. Already backed up on GitHub.
**Action:** Safe to remove locally — these are all forks/clones that live on your GitHub.
**Contains:** ailab, AiLab, gemini-cli, awesome-*, ELECTRICIAN-*, ANDROID, portfolio-website, etc.

### `DEATHSTAR/`
**Status:** Has its own git repo. Appears to be a major project — directory structure tools, init scripts (v1-v3), assets.
**Action:** Already has a GitHub repo (public). Verify it's pushed and up to date.
**Repo:** https://github.com/Turbo-the-tech-dev/DEATHSTAR

### `__Turbo-the-tech-dev__/`
**Status:** Personal workspace. Contains numbered subdirs (`__0010_` through `__0019_+`). Has sub-repos (ELECTRICIAN-backup, Electrician-PROMPT-GENIE).
**Action:** Review contents — likely your core personal projects. Back up carefully.

### `__EWOKS__/`
**Status:** Numbered modules (`__EWOK-100__` through `__EWOK-109_+`). Looks like a structured learning/project system.
**Action:** Back up — this is original content.

### `__GOOD_HUSTLE_BAD_HUSTLE__/`
**Status:** HTML sheets (Sheet1-9) + resources. Looks like a spreadsheet export or web project about side hustles/business.
**Action:** Back up — original content.

### `IMPERIAL_INTELLIGENCE_FORGE/`
**Status:** Contains AUTOMATED_ENFORCEMENT (has its own git repo).
**Action:** Check if this is a duplicate of the clone in __CLONE_WARS__. If so, safe to remove.

### `electrician-interview-simulator/`
**Status:** Full TypeScript/Vite web app (src, public, vite config, tsconfig). Interview prep tool for electricians.
**Action:** Back up — this is a real project. Consider giving it its own repo.
**Repo candidate:** Could map to https://github.com/Turbo-the-tech-dev/Electrician-interview

### `ELECTRICIAN-BLACKHAT-PYTHON/`
**Status:** Contains a `repos/` subfolder.
**Action:** Check contents — may overlap with https://github.com/Turbo-the-tech-dev/Blackhat-python

### `__AI__/`
**Status:** Appears empty.
**Action:** Remove if empty.

### `__files__/`
**Status:** Catch-all file storage — bin, csv, db, dotfiles, downloads, logs, markdown files.
**Action:** Review for anything important. Likely a dump folder — back up selectively.

### `__nano__/`
**Status:** Text files, looks like saved nano editor sessions. JSON viral templates, hooks configs.
**Action:** Back up if these are prompt templates you want to keep.

### `__REPORTS__/`
**Status:** Contains galaxy_command_center.log.
**Action:** Back up the log if useful, otherwise skip.

### `__TEST__/`
**Status:** Minimal test directory.
**Action:** Review and likely remove.

### `SANDBOX_V2/`
**Status:** Dev sandbox with dev/, docs/, txt/ subdirs.
**Action:** Review contents — sandbox stuff may be experimental/throwaway.

### `yoda-master-scripts/`
**Status:** Has its own git repo. Contains bin/, docs/, examples/, and yoda_master.sh. Looks like a script toolkit.
**Action:** Push to GitHub if not already there. This is a keeper.

### `md/`
**Status:** Contains README.md and a copy of galaxy_facebook_fun.sh.
**Action:** Minor — merge into main structure or remove.

### `track/`
**Status:** Just a README.md.
**Action:** Check if this relates to track.sh at root level.

### `TREE_OUTPUT_20260214_212844/`
**Status:** Directory tree snapshots in multiple formats (txt, json, html, md). Generated 2026-02-14.
**Action:** Good reference but regeneratable. Low priority backup.

### `1/` and `2/`
**Status:** `1/` has files sorted by extension (gz, html, json, sh, txt, zip). `2/` has a structured archive (Jedi Archives, Rebel Alliance, Death Star Plans, Holocron Media, Tatooine Personal) + template files.
**Action:** `2/` looks like a curated archive system — back this up. `1/` may be a dump — review.

### `~/`
**Status:** Stray tilde directory with just git-backup-push.sh inside.
**Action:** Move the script out and delete this dir.

---

## Top-Level Scripts

| Script | Purpose |
|--------|---------|
| `galaxy_command_center.sh` | Main Galaxy management script |
| `galaxy_backup_git.sh` | Git backup automation |
| `git-backup-push.sh` | Push backups to GitHub |
| `git_backup_audit.sh` | Audit git backup status |
| `move_git_repos.sh` | Move/organize git repos |
| `analyze_duplicates.sh` | Find duplicate files |
| `sabre2.sh` | Unknown — review |
| `yoda_master.sh` | Yoda script toolkit launcher |
| `track.sh` | Tracking script |
| `123.sh` | Unknown — review |

## Top-Level Files

| File | Purpose |
|------|---------|
| `GITHUB_REPOS.md` | GitHub repos documentation |
| `GIT_BACKUP_AUDIT_REPORT.md` | Backup audit results |
| `GIT_BACKUP_SUMMARY.md` | Backup summary |
| `GIT_BACKUP_TUTORIAL.txt` | Backup how-to guide |
| `github_repos_list.txt` | List of repos |
| `duplicate_analysis_report.txt` | Duplicate file analysis |
| `yoda_master.txt` | Yoda config/notes |
| `package.json` | Node.js project config |
| `LICENSE` | License file |
| `qwen-code-export-*.md` | Qwen AI session export |
| `QWEN_COPY_TO_SANDBOX` | Qwen working file |
| `QWEN_FORCE` | Qwen working file |
| `__QWEN_Init__01__v1__` | Qwen init config |

---

## Recommended Cleanup Priority

1. **Remove `__CLONE_WARS__/`** — all repos exist on GitHub already
2. **Remove `node_modules/`** — reinstallable via npm
3. **Remove `storage/`** — symlink to phone storage, not for git
4. **Remove `~/`** — stray dir, save the script first
5. **Remove `__AI__/`** — if confirmed empty
6. **Review `1/`** — likely a file dump, archive or remove
7. **Back up `2/`, `__EWOKS__/`, `__Turbo-the-tech-dev__/`, `DEATHSTAR/`** — original content
8. **Back up scripts** — your automation tools are valuable
