export default function truncate(text: string, maxLength: number, ellipsis = '…'): string {
  return text.length > maxLength
    ? text.slice(0, maxLength) + ellipsis
    : text;
}
