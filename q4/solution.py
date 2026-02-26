import re
import html

def parse_markdown(markdown):
    lines = markdown.split('\n')
    i = 0
    output = []

    def parse_inlines(text):
        # Escape HTML first
        text = html.escape(text, quote=False)

        # Code spans
        text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)

        # Bold (**text**)
        text = re.sub(r'\*\*([^\*]+)\*\*', r'<strong>\1</strong>', text)

        # Italic (*text*)
        text = re.sub(r'\*([^\*]+)\*', r'<em>\1</em>', text)

        # Links [text](url)
        text = re.sub(
            r'\[([^\]]+)\]\(([^)]+)\)',
            r'<a href="\2">\1</a>',
            text
        )

        return text

    while i < len(lines):
        line = lines[i]

        # Skip empty lines
        if line.strip() == '':
            i += 1
            continue

        # Headings (#, ##, ###, etc.)
        heading_match = re.match(r'^(#{1,6})\s+(.*)', line)
        if heading_match:
            level = len(heading_match.group(1))
            content = parse_inlines(heading_match.group(2).strip())
            output.append(f'<h{level}>{content}</h{level}>')
            i += 1
            continue

        # Blockquote
        if line.startswith('> '):
            content = []
            while i < len(lines) and lines[i].startswith('> '):
                content.append(lines[i][2:])
                i += 1
            inner = parse_markdown('\n'.join(content)).rstrip('\n')
            output.append(f'<blockquote>\n{inner}\n</blockquote>')
            continue

        # Fenced code block ```
        if line.startswith('```'):
            i += 1
            code_lines = []
            while i < len(lines) and not lines[i].startswith('```'):
                code_lines.append(lines[i])
                i += 1
            i += 1  # Skip closing ```
            code = html.escape('\n'.join(code_lines))
            output.append(f'<pre><code>{code}\n</code></pre>')
            continue

        # Unordered list (- or *)
        if re.match(r'^[-*]\s+', line):
            items = []
            while i < len(lines) and re.match(r'^[-*]\s+', lines[i]):
                item = re.sub(r'^[-*]\s+', '', lines[i])
                items.append(f'<li>{parse_inlines(item)}</li>')
                i += 1
            output.append('<ul>\n' + '\n'.join(items) + '\n</ul>')
            continue

        # Ordered list (1. 2. etc.)
        if re.match(r'^\d+\.\s+', line):
            items = []
            while i < len(lines) and re.match(r'^\d+\.\s+', lines[i]):
                item = re.sub(r'^\d+\.\s+', '', lines[i])
                items.append(f'<li>{parse_inlines(item)}</li>')
                i += 1
            output.append('<ol>\n' + '\n'.join(items) + '\n</ol>')
            continue

        # Paragraph
        paragraph_lines = []
        while i < len(lines) and lines[i].strip() != '':
            paragraph_lines.append(lines[i])
            i += 1
        paragraph = parse_inlines(' '.join(paragraph_lines).strip())
        output.append(f'<p>{paragraph}</p>')

    # IMPORTANT: CommonMark spec expects trailing newline
    return '\n'.join(output) + '\n'
