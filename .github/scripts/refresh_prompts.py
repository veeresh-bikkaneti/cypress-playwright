import os
import datetime
import re

PROMPTS_DIR = ".github/prompts"
TARGET_FILE = "migrate-cypress-to-playwright.prompt.md"

def refresh_prompt(file_path):
    print(f"Checking {file_path}...")
    
    if not os.path.exists(file_path):
        print(f"ERROR: File {file_path} not found!")
        return False

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Validation: Ensure critical sections exist
    required_sections = [
        "Migration Instructions",
        "Phase 1",
        "Phase 2",
        "Phase 3",
        "Final Checklist"
    ]
    
    for section in required_sections:
        if section not in content:
            print(f"WARNING: Missing section '{section}' in {file_path}")

    # timestamp update
    today = datetime.date.today().isoformat()
    metadata_tag = f"<!-- run_metadata: last_checked={today} -->"
    
    # regex to find existing metadata tag
    pattern = r"<!-- run_metadata: last_checked=\d{4}-\d{2}-\d{2} -->"
    
    if re.search(pattern, content):
        new_content = re.sub(pattern, metadata_tag, content)
        print("Updated existing timestamp.")
    else:
        new_content = content.strip() + "\n\n" + metadata_tag + "\n"
        print("Appended new timestamp.")

    if new_content != content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"SUCCESS: Updated {file_path}")
        return True
    else:
        print(f"No changes needed for {file_path}")
        return False

if __name__ == "__main__":
    target_path = os.path.join(PROMPTS_DIR, TARGET_FILE)
    # If running from root, path might need adjustment
    if not os.path.exists(PROMPTS_DIR):
        # Try finding it relative to script location if run directly
        script_dir = os.path.dirname(os.path.abspath(__file__))
        root_dir = os.path.dirname(os.path.dirname(script_dir))
        target_path = os.path.join(root_dir, PROMPTS_DIR, TARGET_FILE)

    refresh_prompt(target_path)
