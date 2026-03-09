"""
tree.py
=======
Generates a markdown file (folder-structure.md) representing the folder tree of the
parent directory of a given project folder.

Usage:
    python tree.py                          # uses current directory as project path
    python tree.py <path/to/project>        # uses the specified folder as project path

Output:
    folder-structure.md is written into the docs/ folder found inside the parent directory.
    If docs/ does not exist, it will be created automatically. The tree itself
    covers the parent folder, giving a full picture of where the project sits
    relative to its siblings. The generated folder-structure.md file itself is also
    included in the tree, under the docs/ folder.

Example:
    If your project is at C:/Projects/my-app, running:
        python tree.py C:/Projects/my-app/scripts
    will scan C:/Projects/my-app and write the result to:
        C:/Projects/my-app/docs/folder-structure.md
"""

import os
import argparse


# Folders that should never appear in the generated tree.
# Add any additional folders you want to ignore here.
EXCLUDED = {
    ".git", "node_modules", "__pycache__", ".next", ".venv", "venv",
    "env", ".env", "dist", "build", ".cache", ".mypy_cache", ".pytest_cache",
}


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
    Generate folder-structure.md inside the docs/ folder of the parent directory,
    containing the tree of that parent folder.

    The docs/ folder is created automatically if it does not already exist.
    The output file itself is injected into the tree so it appears in its correct
    position even though it does not exist yet when the scan runs.

    Args:
        project_path: Path to the current project folder.
    """
    project_path = os.path.abspath(project_path)

    # Walk up one level — we want to show where this project sits
    # relative to its siblings, not just its own internals
    parent_path = os.path.dirname(project_path)
    parent_name = os.path.basename(parent_path)

    # Write folder-structure.md into the docs folder found in the parent directory
    docs_path = os.path.join(parent_path, "docs")
    os.makedirs(docs_path, exist_ok=True)  # create docs/ if it doesn't exist yet
    output_filename = "folder-structure.md"
    output_file = os.path.join(docs_path, output_filename)

    # Inject folder-structure.md into the tree so it appears under docs/ even
    # though it doesn't exist on disk yet when the scan runs
    extra_files = {docs_path: [output_filename]}

    # Build the markdown content: title, parent folder name, then a fenced code block with the tree
    lines = ["# Folder Structure", "", "```", parent_name + "/"]
    lines.extend(build_tree(parent_path, extra_files=extra_files))
    lines.append("```")

    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate a markdown folder structure of the parent folder."
    )
    parser.add_argument(
        "path",
        nargs="?",
        default=".",
        help="Path to the project folder (default: current directory)",
    )
    args = parser.parse_args()

    generate(args.path)