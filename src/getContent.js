export function getContent(content) {
    if (Array.isArray(content)) return content;
    if (content && typeof content === 'object') return [content];
    return [];
}
