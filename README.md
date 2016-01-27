# aria-hidden-focus-manager
aria-hidden may prevent screen readers from reading the content and navigating through normal screen reader controls, but it does not handle tabbing to a tabbable element in an aria-hidden region. This can cause users to lose their place in the page as the screen reader may not read the content of the element that has focus. This script will redirect focus based on whether the current focused element is in an aria-hidden region and the previous focused element to determine the direction in the DOM to traverse to find the next valid focusable element.

Currently, this does not handle positive tabindex elements. If you see any other issues, please let me know.
