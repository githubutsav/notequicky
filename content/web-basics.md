# HTML, CSS, and DOM Essentials

HTML gives content meaning, CSS controls presentation, and the DOM is the browser’s JavaScript representation of the page. Build semantic HTML first, then layout/style it with CSS, then add JavaScript behavior only where needed.

```text
HTML -> structure and accessibility
CSS  -> layout, visual design, responsive behavior
DOM  -> JavaScript reads and changes the rendered document
```

## 1. Semantic HTML and Accessibility

Use elements for their meaning, not merely their default appearance.

```html
<header>
  <nav aria-label="Main navigation">
    <a href="/">Home</a>
    <a href="/todos">Todos</a>
  </nav>
</header>

<main>
  <article>
    <h1>Today’s todos</h1>
    <p>Plan the most important work first.</p>
  </article>
</main>

<footer>© 2026</footer>
```

Important elements:

```text
head, title, meta viewport    Document metadata and responsive layout.
header, nav, main, footer     Landmark regions.
section, article, aside        Meaningful content grouping.
h1-h6                         Heading hierarchy; normally one clear h1.
button                        An action in the current page/app.
a href                        Navigation to a URL.
form, label, input, textarea  User input with accessible names.
ul/ol/li                      Related lists.
img alt                       Image alternative text; alt="" only for decoration.
```

Use a real `<button>` for actions, not a clickable `<div>`. Use a real link for navigation, not a button. Native elements provide keyboard support, focus behavior, and screen-reader semantics by default.

```html
<form id="todo-form">
  <label for="title">Todo title</label>
  <input id="title" name="title" required maxlength="200" />
  <button type="submit">Add todo</button>
</form>
```

Every input needs an associated label. Use ARIA only when native HTML cannot express the needed meaning; incorrect ARIA is worse than simple semantic HTML.

## 2. HTML Page Basics

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Todo App</title>
    <link rel="stylesheet" href="/styles.css" />
    <script type="module" src="/app.js"></script>
  </head>
  <body>
    <main id="app"></main>
  </body>
</html>
```

`type="module"` defers execution until HTML parsing is complete and enables `import`/`export`. Give the page a meaningful title, set its language, and load scripts without blocking initial parsing.

## 3. CSS Cascade, Selectors, and Box Model

CSS chooses rules through the cascade: origin, importance, specificity, then source order. Keep selectors simple and avoid `!important` except for deliberate overrides.

```css
/* Good: predictable class selector */
.todo-card {
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
}

.todo-card--done {
  opacity: 0.65;
}
```

The box model is `content -> padding -> border -> margin`. Make sizing predictable:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

Use classes for reusable styling, IDs mainly for unique document hooks, and data attributes for JavaScript behavior.

```html
<button class="button button--danger" data-todo-id="42">Delete</button>
```

## 4. Layout and Responsive Design

Use Flexbox for one-dimensional alignment and Grid for two-dimensional layouts.

```css
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.todo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1rem;
}
```

Start with a layout that works on narrow screens, then add a media query only when the content needs it.

```css
.page {
  width: min(100% - 2rem, 70rem);
  margin-inline: auto;
}

@media (min-width: 48rem) {
  .sidebar-layout {
    display: grid;
    grid-template-columns: 16rem 1fr;
    gap: 2rem;
  }
}
```

Prefer relative units: `rem` for type/spacing, `%`/`fr` for layout, and `min()`/`max()`/`clamp()` for flexible constraints. Test with keyboard navigation, zoom, narrow widths, and reduced motion.

## 5. CSS Variables and States

Custom properties make a small design system consistent.

```css
:root {
  --color-primary: #2563eb;
  --color-danger: #b91c1c;
  --space: 0.75rem;
}

.button {
  padding: var(--space) 1rem;
  background: var(--color-primary);
  color: white;
}

.button:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 2px;
}
```

Style interaction states: `:hover`, `:focus-visible`, `:disabled`, `:checked`, and `:invalid`. Never remove focus outlines without replacing them with a clearly visible alternative.

## 6. DOM Selection, Events, and Rendering

Use `querySelector` for one element and `querySelectorAll` for many. Check for missing elements before using them.

```js
const form = document.querySelector("#todo-form");
const list = document.querySelector("#todo-list");

if (!form || !list) {
  throw new Error("Todo page markup is incomplete");
}
```

Use `FormData` for forms and `textContent` for untrusted text. Avoid injecting user/API text with `innerHTML` because it can create XSS vulnerabilities.

```js
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = new FormData(form).get("title")?.toString().trim();
  if (!title) return;

  const item = document.createElement("li");
  item.textContent = title;
  list.append(item);
  form.reset();
});
```

Use event delegation when many similar elements can be added later:

```js
list.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-todo-id]");
  if (!button) return;

  deleteTodo(button.dataset.todoId);
});
```

Keep state in JavaScript and render from that state instead of treating the DOM as the only source of truth. For complex interfaces, create small render functions; later, a frontend framework can formalize this pattern.

## 7. Browser Safety and Debugging

```text
Use textContent for untrusted text.
Validate input on the server as well as the client.
Never put secrets in frontend JavaScript.
Use browser DevTools: Elements, Console, Network, Sources, and Accessibility views.
Use the Network tab to inspect request URL, status, headers, payload, timing, and response.
```

## Practice

```text
1. Build a semantic profile page with header, nav, main, article, and footer.
2. Recreate a card layout using Grid and make it work at 320px width.
3. Build an accessible todo form with labels, required validation, focus styles, and keyboard submission.
4. Add todo creation/deletion with DOM APIs and event delegation.
5. Use DevTools to diagnose one CSS layout issue and one failed network request.
```

## Resources

- [MDN HTML guide](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content): semantic HTML and page structure.
- [MDN CSS guide](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics): selectors, cascade, layout, and responsive styles.
- [MDN DOM introduction](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction): DOM concepts and APIs.
- [JavaScript Learning Notes](javascript.md): events, fetch, async code, storage, and browser security.
