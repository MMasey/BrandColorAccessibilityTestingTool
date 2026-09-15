/**
 * Custom element registration guard
 *
 * Use instead of Lit's `@customElement`, which throws when a tag is already
 * defined. On a host page that loads the widget twice, or already defines a
 * clashing tag, that exception would stop the whole widget from rendering.
 */
export function defineElement(tagName: string) {
  return (elementClass: CustomElementConstructor): void => {
    if (customElements.get(tagName)) {
      console.warn(`<${tagName}> is already defined on this page; keeping the existing definition.`);
      return;
    }
    customElements.define(tagName, elementClass);
  };
}
