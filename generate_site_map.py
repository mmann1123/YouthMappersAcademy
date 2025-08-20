# %%
import os
from datetime import datetime

site_url = "https://mmann1123.github.io/YouthMappersAcademy/"  # <-- Update this to your actual site URL
html_dir = "../"
sitemap_path = os.path.join(html_dir, "sitemap.xml")

urls = []
for root, dirs, files in os.walk(html_dir):
    for file in files:
        if file.endswith(".html"):
            rel_path = os.path.relpath(os.path.join(root, file), html_dir)
            url = site_url + rel_path.replace(os.sep, "/")
            urls.append(url)

with open(sitemap_path, "w") as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
    f.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
    for url in urls:
        f.write("  <url>\n")
        f.write(f"    <loc>{url}</loc>\n")
        f.write(f"    <lastmod>{datetime.today().date()}</lastmod>\n")
        f.write("    <changefreq>monthly</changefreq>\n")
        f.write("    <priority>0.5</priority>\n")
        f.write("  </url>\n")
    f.write("</urlset>\n")
# %%
