import { useEffect, useRef, type ReactNode } from 'react';
import { Bold, Heading2, Italic, List, ListOrdered } from 'lucide-react';

export type RichTextDocument = {
  type: 'doc';
  content: Array<Record<string, unknown>>;
};

const emptyDocument: RichTextDocument = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }],
};

function readInline(node: Node): Record<string, unknown>[] {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ? [{ type: 'text', text: node.textContent }] : [];
  }
  if (!(node instanceof HTMLElement)) return [];
  const marks: Array<{ type: string }> = [];
  if (node.tagName === 'STRONG' || node.tagName === 'B') marks.push({ type: 'bold' });
  if (node.tagName === 'EM' || node.tagName === 'I') marks.push({ type: 'italic' });
  const children = Array.from(node.childNodes).flatMap(readInline);
  return children.map((child) => ({ ...child, ...(marks.length ? { marks: [...((child.marks as Array<{ type: string }>) ?? []), ...marks] } : {}) }));
}

function toJson(root: HTMLElement): RichTextDocument {
  const content: Array<Record<string, unknown>> = [];
  for (const child of Array.from(root.children)) {
    if (child.tagName === 'UL' || child.tagName === 'OL') {
      content.push({
        type: child.tagName === 'UL' ? 'bulletList' : 'orderedList',
        content: Array.from(child.children).map((item) => ({ type: 'listItem', content: [{ type: 'paragraph', content: Array.from(item.childNodes).flatMap(readInline) }] })),
      });
      continue;
    }
    const type = child.tagName === 'H2' ? 'heading' : 'paragraph';
    content.push({ type, ...(type === 'heading' ? { attrs: { level: 2 } } : {}), content: Array.from(child.childNodes).flatMap(readInline) });
  }
  return { type: 'doc', content: content.length ? content : emptyDocument.content };
}

function toHtml(value: RichTextDocument): string {
  return value.content.map((node) => {
    const type = node.type;
    if (type === 'bulletList' || type === 'orderedList') {
      const tag = type === 'bulletList' ? 'ul' : 'ol';
      const items = (node.content as Array<Record<string, unknown>> ?? []).map((item) => `<li>${toHtml({ type: 'doc', content: item.content as Array<Record<string, unknown>> ?? [] })}</li>`).join('');
      return `<${tag}>${items}</${tag}>`;
    }
    const tag = type === 'heading' ? 'h2' : 'p';
    const inline = (node.content as Array<Record<string, unknown>> ?? []).map((child) => {
      let text = String(child.text ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
      for (const mark of (child.marks as Array<{ type: string }> ?? [])) text = mark.type === 'bold' ? `<strong>${text}</strong>` : mark.type === 'italic' ? `<em>${text}</em>` : text;
      return text;
    }).join('');
    return `<${tag}>${inline}</${tag}>`;
  }).join('');
}

export function RichTextJsonEditor({ onChange, initialValue = emptyDocument }: { onChange: (document: RichTextDocument) => void; initialValue?: RichTextDocument }) {
  const editorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = toHtml(initialValue);
  }, [initialValue]);

  function command(name: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(name, false, value);
    if (editorRef.current) onChange(toJson(editorRef.current));
  }

  return <div className="overflow-hidden rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring/30">
    <div className="flex flex-wrap gap-1 border-b border-border p-1" aria-label="Text formatting">
      <ToolbarButton label="Bold" onClick={() => command('bold')}><Bold className="size-4" /></ToolbarButton>
      <ToolbarButton label="Italic" onClick={() => command('italic')}><Italic className="size-4" /></ToolbarButton>
      <ToolbarButton label="Heading" onClick={() => command('formatBlock', 'H2')}><Heading2 className="size-4" /></ToolbarButton>
      <ToolbarButton label="Bulleted list" onClick={() => command('insertUnorderedList')}><List className="size-4" /></ToolbarButton>
      <ToolbarButton label="Numbered list" onClick={() => command('insertOrderedList')}><ListOrdered className="size-4" /></ToolbarButton>
    </div>
    <div ref={editorRef} contentEditable role="textbox" aria-label="Position requirements" aria-multiline="true" data-placeholder="Describe required qualifications, skills, and experience…" onInput={(event) => onChange(toJson(event.currentTarget))} className="rich-text-editor min-h-36 px-3 py-2 text-sm outline-none" />
  </div>;
}

function ToolbarButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return <button type="button" aria-label={label} title={label} onMouseDown={(event) => event.preventDefault()} onClick={onClick} className="rounded p-2 text-muted-foreground hover:bg-accent hover:text-foreground">{children}</button>;
}
