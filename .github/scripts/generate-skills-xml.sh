#!/usr/bin/env bash
# Generate <available_skills> XML for agent prompts
# Usage: ./generate-skills-xml.sh [skills_dir]
#
# Based on Agent Skills specification: https://agentskills.io/specification

set -euo pipefail

SKILLS_DIR="${1:-$(dirname "$0")/../skills}"

echo "<available_skills>"

for skill_dir in "$SKILLS_DIR"/*/; do
  skill_file="$skill_dir/SKILL.md"
  
  if [[ -f "$skill_file" ]]; then
    # Extract frontmatter between --- markers
    frontmatter=$(awk '/^---$/{p=!p;next}p' "$skill_file" | head -20)
    
    # Extract name (single line)
    name=$(echo "$frontmatter" | grep '^name:' | head -1 | sed 's/^name: *//')
    
    # Extract description - handle potential multiline by taking first line only
    description=$(echo "$frontmatter" | grep '^description:' | head -1 | sed 's/^description: *//')
    
    if [[ -n "$name" && -n "$description" ]]; then
      # Escape XML special characters
      description="${description//&/&amp;}"
      description="${description//</&lt;}"
      description="${description//>/&gt;}"
      
      # Get absolute path
      abs_path=$(realpath "$skill_file")
      
      echo "  <skill>"
      echo "    <name>$name</name>"
      echo "    <description>$description</description>"
      echo "    <location>$abs_path</location>"
      echo "  </skill>"
    fi
  fi
done

echo "</available_skills>"
