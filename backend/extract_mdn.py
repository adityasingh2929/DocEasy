import os
import json
import re

def clean_markdown(text):
    # Remove frontmatter (the --- block at the start of the file)
    text = re.sub(r'^---\n.*?\n---\n', '', text, flags=re.DOTALL)
    
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Replace markdown links [text](url) with just the text
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    
    # Remove heading hashes (e.g., "## Heading" -> "Heading")
    text = re.sub(r'^#+\s+', '', text, flags=re.MULTILINE)
    
    # Remove code block formatting but keep the code itself
    text = re.sub(r'```[a-z]*\n', '', text)
    text = text.replace('```', '')
    
    # Remove bold, italic, and inline code formatting
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    text = re.sub(r'`([^`]+)`', r'\1', text)
    
    # Clean up excessive newlines
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return text.strip()

def map_topic(filepath):
    """
    Extracts and maps the filename to a topic name.
    Example: data_structures/index.md -> data-types
    """
    filename = os.path.basename(filepath)
    if filename == 'index.md':
        name_without_ext = os.path.basename(os.path.dirname(filepath))
    else:
        name_without_ext = filename.replace('.md', '')
    
    # Define custom mappings here
    topic_map = {
        "data_structures": "data-types",
        "grammar_and_types": "data-types",
        "functions": "functions",
        "closures": "closures"
    }
    
    if name_without_ext in topic_map:
        return topic_map[name_without_ext]
        
    # Topic normalization rules:
    # - convert to lowercase
    # - replace underscores with hyphens
    return name_without_ext.lower().replace("_", "-")

def main():
    # Base directory for the MDN JavaScript content
    base_dir = os.path.join("mdn", "content", "files", "en-us", "web", "javascript")
    output_file = os.path.join("data", "mdn_clean.json")
    
    if not os.path.exists(base_dir):
        print(f"Error: Directory '{base_dir}' not found. Please ensure you are running this from the backend folder.")
        return

    results = []
    
    # Walk through all directories and files
    for root, _, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.md'):
                filepath = os.path.join(root, file)
                
                # In MDN, almost all files are named index.md inside a topic folder
                if file == 'index.md':
                    raw_name = os.path.basename(root)
                else:
                    raw_name = file.replace('.md', '')
                    
                # IGNORE generic pages
                if raw_name in ['javascript', 'guide', 'reference', 'overview', 'introduction', 'about']:
                    continue
                
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    cleaned_text = clean_markdown(content)
                    topic = map_topic(filepath)
                    
                    # Only add if there is actual content
                    if cleaned_text:
                        results.append({
                            "topic": topic,
                            "text": cleaned_text
                        })
                except Exception as e:
                    print(f"Failed to process {filepath}: {e}")
                
    # Ensure the output directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    # Save the extracted data to a JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
        
    print(f"Successfully processed {len(results)} files.")
    print(f"Cleaned data saved to: {output_file}")

if __name__ == "__main__":
    main()
