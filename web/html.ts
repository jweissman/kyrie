export class Html {
  static escape(value: unknown): string {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  static attrs(values: Record<string, string | number | boolean | undefined>): string {
    return Object.entries(values).filter(([, v]) => v !== undefined && v !== false)
      .map(([k, v]) => v === true ? k : `${k}="${Html.escape(v)}"`).join(' ');
  }
  static button(label: string, action: string, data: Record<string, string | number | boolean | undefined> = {},
    extra = ''): string {
    const attributes = Html.attrs({ 'data-action': action, ...Object.fromEntries(Object.entries(data)
      .map(([k, v]) => [k === 'disabled' || k === 'class' || k === 'title' ? k : `data-${k}`, v])) });
    return `<button type="button" ${attributes}>${extra}${Html.escape(label)}</button>`;
  }
  static list(items: string[], empty = 'None'): string {
    return items.length ? `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>` : `<p class="muted">${Html.escape(empty)}</p>`;
  }
  static table(headers: string[], rows: string[][]): string {
    return `<div class="scroll"><table><thead><tr>${headers.map(h => `<th>${Html.escape(h)}</th>`).join('')}</tr></thead>`
      + `<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  static pre(value: unknown): string {
    return `<pre>${Html.escape(typeof value === 'string' ? value : JSON.stringify(value, null, 2))}</pre>`;
  }
}
