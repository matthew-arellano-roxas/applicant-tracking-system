// The original JSON is stored untouched; this is only for the LLM prompt.
type Json = unknown;

const BLOCK_TYPES = new Set([
  'paragraph',
  'heading',
  'listItem',
  'list_item',
  'bulletList',
  'orderedList',
]);

const isObject = (v: Json): v is Record<string, Json> => typeof v === 'object' && v !== null;

const childrenOf = (node: Record<string, Json>): Json[] => {
  const kids = node.content ?? node.children;
  return Array.isArray(kids) ? kids : [];
};

const nodeText = (node: Json): string => {
  if (typeof node === 'string') return node;
  if (!isObject(node)) return '';
  if (typeof node.text === 'string') return node.text;
  const inner = childrenOf(node).map(nodeText).join('');
  return BLOCK_TYPES.has(String(node.type)) ? `${inner}\n` : inner;
};

const rootNode = (doc: Json): Json => (isObject(doc) && 'root' in doc ? doc.root : doc);

export const richTextToPlain = (doc: Json): string =>
  nodeText(rootNode(doc))
    .replace(/\n{3,}/g, '\n\n')
    .trim();
