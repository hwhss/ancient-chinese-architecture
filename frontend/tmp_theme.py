import os
import re

CSS_VARS_MAP = {
    r'#c41e3a': 'var(--primary)',
    r'#8b0000': 'var(--primary-dark)',
    r'#d6455a': 'var(--primary-light)',
    
    r'#8b4513': 'var(--secondary)',
    r'#8B4513': 'var(--secondary)',
    r'#6b3410': 'var(--secondary-dark)',
    r'#a67c52': 'var(--secondary-light)',
    
    r'#3c2a1d': 'var(--text-primary)',
    r'#6b5643': 'var(--text-secondary)',
    r'#8b7355': 'var(--text-tertiary)',
    r'#a89078': 'var(--text-muted)',
    
    r'#f8f4e8': 'var(--bg-primary)',
    r'#f8f4e9': 'var(--bg-primary)', # typo handling
    r'#f0e9d8': 'var(--bg-secondary)',
    r'#e8dcc8': 'var(--bg-tertiary)',
    
    r'#b85450': 'var(--error)',
    r'#5b8c5a': 'var(--success)',
    r'#e8b860': 'var(--warning)',
}

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    for hex_color, css_var in CSS_VARS_MAP.items():
        # Replace case-insensitive match for the hex color, ensuring it's not part of a longer hex
        pattern = re.compile(hex_color + r'(?![0-9a-fA-F])', re.IGNORECASE)
        content = pattern.sub(css_var, content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    base_dir = r"d:\GitWarehouse\web\ancient-chinese-architecture\frontend"
    count = 0
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.vue'):
                filepath = os.path.join(root, file)
                if replace_in_file(filepath):
                    count += 1
                    print(f"Updated {os.path.relpath(filepath, base_dir)}")
    print(f"Total files updated: {count}")

if __name__ == '__main__':
    main()
