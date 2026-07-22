import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

import_statement = """import {
  DEPT_COLORS,
  LOGO_FULL_WHITE,
  LOGO_LOCKUP_INK,
  steps,
  faqs,
  footerLinks,
} from "@/components/landing/constants";
import { Instagram, Facebook, Twitter } from "@/components/landing/icons";
"""

content = re.sub(r'const DEPT_COLORS = \[.*?\];', import_statement, content, flags=re.DOTALL)

content = re.sub(r'function Instagram.*?</svg>\s*\}\s*', '', content, flags=re.DOTALL)
content = re.sub(r'function Facebook.*?</svg>\s*\}\s*', '', content, flags=re.DOTALL)
content = re.sub(r'function Twitter.*?</svg>\s*\}\s*', '', content, flags=re.DOTALL)

content = re.sub(r'const LOGO_LOCKUP_INK = \".*?\";\s*', '', content, flags=re.DOTALL)
content = re.sub(r'const LOGO_FULL_WHITE = \".*?\";\s*', '', content, flags=re.DOTALL)
content = re.sub(r'const steps = \[.*?\];\s*', '', content, flags=re.DOTALL)
content = re.sub(r'const faqs = \[.*?\];\s*', '', content, flags=re.DOTALL)
content = re.sub(r'const footerLinks: Record<string, \{ label: string; href: string \}\[\]> = \{.*?\};\s*', '', content, flags=re.DOTALL)
content = re.sub(r'/\* ── Inline SVG social icons ────── \*/\s*', '', content, flags=re.DOTALL)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
