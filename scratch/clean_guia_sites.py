import re

# Paths
guia_path = r"c:\Users\Millynho\Downloads\AREA DE MEMBROS DO STL\app\bonus\guia-sites\index.html"
parent_path = r"c:\Users\Millynho\Downloads\AREA DE MEMBROS DO STL\app\bonus\index.html"

print("Reading parent HTML to get helper scripts...")
with open(parent_path, 'r', encoding='utf-8') as f:
    parent_content = f.read()

# Find helper scripts in parent HTML
# The helper scripts are at the end of the file
parent_scripts = re.findall(r'<script.*?>.*?</script>', parent_content, re.DOTALL | re.IGNORECASE)
helper_scripts = []
for s in parent_scripts:
    if '_next' not in s and 'self.__next' not in s:
        helper_scripts.append(s)

print(f"Found {len(helper_scripts)} helper scripts in parent HTML.")

print("Reading guia-sites HTML...")
with open(guia_path, 'r', encoding='utf-8') as f:
    guia_content = f.read()

# 1. Remove Next.js script preloads
clean_content = re.sub(r'<link rel="preload" as="script"[^>]*>', '', guia_content, flags=re.IGNORECASE)
clean_content = re.sub(r'<link rel="modulepreload"[^>]*>', '', clean_content, flags=re.IGNORECASE)

# 2. Remove Next.js stylesheet precedence and keep link if needed
# Actually let's just keep the stylesheet link as is because it works.

# 3. Remove all script tags that have _next, or next_f, or polyfills, or webpack
# We will match <script ...> ... </script> and check if they are Next.js scripts.
# We will do this carefully.
all_scripts = re.findall(r'<script.*?>.*?</script>', clean_content, re.DOTALL | re.IGNORECASE)
next_scripts_count = 0
for s in all_scripts:
    if '_next' in s or 'self.__next' in s or 'polyfills' in s:
        # replace s with empty string in clean_content
        clean_content = clean_content.replace(s, '')
        next_scripts_count += 1

print(f"Removed {next_scripts_count} Next.js/hydration script tags.")

# 4. Also check for any remaining script tags (just in case)
# e.g., <script id="__NEXT_DATA__" ...> or similar next scripts
clean_content = re.sub(r'<script[^>]*>self\.__next_f\.push.*?</script>', '', clean_content, flags=re.DOTALL | re.IGNORECASE)

# 5. Insert helper scripts before </body>
helper_scripts_combined = "\n".join(helper_scripts)
if '</body>' in clean_content:
    clean_content = clean_content.replace('</body>', f'{helper_scripts_combined}\n</body>')
    print("Injected helper scripts before </body>.")
else:
    clean_content += f'\n{helper_scripts_combined}'
    print("Injected helper scripts at the end of the file.")

# Save cleaned HTML
with open(guia_path, 'w', encoding='utf-8') as f:
    f.write(clean_content)

print("guia-sites index.html successfully cleaned and updated!")
