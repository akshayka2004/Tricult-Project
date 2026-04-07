import os

files_to_update = {
    'ChangePasswordModal.jsx': [('#ffff00', '#00E5FF'), ('#ffcc00', '#B026FF')],
    'BillModal.jsx': [('#ffff00', '#00E5FF'), ('#ffcc00', '#B026FF')]
}

base_path = r"d:\Projects\Tricult-Project\src"

for root, _, files in os.walk(base_path):
    for file in files:
        if file in files_to_update:
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            for old, new in files_to_update[file]:
                content = content.replace(old, new)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {file}")
