"""
tree_watcher.py
===============
Watches the parent directory of a given project folder and regenerates
folder-structure.md every hour, overwriting the previous version.

The tree generation logic is identical to tree.py. The watcher runs
indefinitely until stopped manually (Ctrl+C or process kill).

Usage:
    python tree_watcher.py                      # watches parent of current directory
    python tree_watcher.py <path/to/project>    # watches parent of the given folder

Output:
    folder-structure.md is written (and overwritten on each tick) into the docs/ folder
    found inside the parent directory. If docs/ does not exist it is created
    automatically.

Example:
    If your project is at C:/Projects/my-app, running:
        python tree_watcher.py C:/Projects/my-app/scripts
    will watch C:/Projects/my-app and keep C:/Projects/my-app/docs/folder-structure.md up to date,
    refreshing it once every hour.
"""

import os
import time
import logging
import argparse
from datetime import datetime


# ── Logging ────────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)


# ── Constants ──────────────────────────────────────────────────────────────────

# How often to regenerate the file (in seconds)
INTERVAL_SECONDS = 60 * 60  # 1 hour

# Folders that should never appear in the generated tree.
# Add any additional folders you want to ignore here.
EXCLUDED = {
    ".git", "node_modules", "__pycache__", ".next", ".venv", "venv",
    "env", ".env", "dist", "build", ".cache", ".mypy_cache", ".pytest_cache",
}


# ── Helpers ────────────────────────────────────────────────────────────────────

def should_exclude(name: str) -> bool:
    """Return True if the entry should be skipped in the tree."""
    if name in EXCLUDED:
        return True
    # Catch dynamically named egg-info folders (e.g. mypackage.egg-info)
    if name.endswith(".egg-info"):
        return True
    return False


def build_tree(path: str, prefix: str = "", extra_files: dict[str, list[str]] | None = None) -> list[str]:
    """
    Recursively build the tree lines for a given directory.

    Directories are listed before files at each level, both sorted
    alphabetically. Each level of nesting is indented using box-drawing
    characters to produce a readable tree structure.

    Args:
        path:        Absolute path of the directory to scan.
        prefix:      The leading characters accumulated from parent levels,
                     used to draw the connecting lines correctly.
        extra_files: A mapping of absolute directory paths to a list of
                     filenames that should be injected into the tree for
                     that directory, even if they don't exist on disk yet.

    Returns:
        A list of strings, one per file/folder entry.
    """
    lines = []
    extra_files = extra_files or {}

    try:
        # Sort: directories first, then files, both alphabetically
        entries = sorted(os.scandir(path), key=lambda e: (e.is_file(), e.name.lower()))
    except PermissionError:
        # Skip folders we don't have read access to
        return lines

    # Filter out excluded folders/files before rendering
    entries = [e for e in entries if not should_exclude(e.name)]

    # Collect the real entry names so we can merge injected files cleanly
    real_names = [e.name for e in entries]

    # Build the final display list: real entries + injected filenames for this dir,
    # sorted so injected files land in the correct alphabetical position
    injected = extra_files.get(os.path.abspath(path), [])
    all_names = sorted(
        real_names + [n for n in injected if n not in real_names],
        key=lambda n: (True, n.lower()) if n in injected or os.path.isfile(os.path.join(path, n)) else (False, n.lower())
    )

    # Re-map names back to entries (injected names won't have a DirEntry)
    entry_map = {e.name: e for e in entries}

    for i, name in enumerate(all_names):
        is_last = i == len(all_names) - 1

        # Use └── for the last item, ├── for everything else
        connector = "└── " if is_last else "├── "
        lines.append(f"{prefix}{connector}{name}")

        # Only recurse if this is a real directory entry
        entry = entry_map.get(name)
        if entry and entry.is_dir(follow_symlinks=False):
            # If this is the last entry, the next level needs blank padding
            # so the vertical line from a parent above doesn't bleed through.
            # Otherwise, continue the vertical line down with │
            extension = "    " if is_last else "│   "
            lines.extend(build_tree(entry.path, prefix + extension, extra_files))

    return lines


def generate(project_path: str) -> None:
    """
    Scan the parent directory and overwrite folder-structure.md in its docs/ folder.

    A 'last updated' timestamp is included at the top of the file so it is
    always clear when the tree was last refreshed.

    Args:
        project_path: Absolute path to the current project folder.
    """
    project_path = os.path.abspath(project_path)
    parent_path = os.path.dirname(project_path)
    parent_name = os.path.basename(parent_path)

    # Ensure the docs folder exists in the parent directory
    docs_path = os.path.join(parent_path, "docs")
    os.makedirs(docs_path, exist_ok=True)

    output_filename = "folder-structure.md"
    output_file = os.path.join(docs_path, output_filename)

    # Inject folder-structure.md into the tree so it appears under docs/ even
    # though it may not exist on disk yet when the scan runs
    extra_files = {docs_path: [output_filename]}

    # Add a "last updated" timestamp so readers know how fresh the tree is
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    lines = [
        "# Folder Structure",
        "",
        "```",
        parent_name + "/",
    ]
    lines.extend(build_tree(parent_path, extra_files=extra_files))
    lines.append("```")

    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    log.info(f"folder-structure.md updated -> {output_file}")


# ── Watcher loop ───────────────────────────────────────────────────────────────

def watch(project_path: str) -> None:
    """
    Run generate() immediately, then repeat every INTERVAL_SECONDS.
    Runs indefinitely until the process is stopped (Ctrl+C or kill).

    Args:
        project_path: Absolute path to the current project folder.
    """
    parent_path = os.path.dirname(project_path)

    log.info(f"Watching: {parent_path}")
    log.info(f"Interval: every {INTERVAL_SECONDS // 60} minute(s)")
    log.info("Press Ctrl+C to stop.")

    while True:
        try:
            generate(project_path)
        except Exception:
            # Log the error but keep the watcher alive so a temporary
            # issue (e.g. locked file, network drive hiccup) doesn't kill it
            log.exception("Failed to generate folder-structure.md — will retry next interval")

        # Sleep in small increments so Ctrl+C is handled promptly
        # rather than blocking for the full hour at once
        for _ in range(INTERVAL_SECONDS):
            time.sleep(1)


# ── Entry point ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Watch the parent folder and regenerate folder-structure.md every hour."
    )
    parser.add_argument(
        "path",
        nargs="?",
        default=".",
        help="Path to the project folder (default: current directory)",
    )
    args = parser.parse_args()

    try:
        watch(args.path)
    except KeyboardInterrupt:
        log.info("Watcher stopped.")