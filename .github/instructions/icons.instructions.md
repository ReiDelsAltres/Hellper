---
description: "Use when: creating or modifying components that display icons, adding icon elements to templates (.hmle), working with material symbols or icon fonts"
applyTo: "src/components/**"
---

# Icon Usage

Always use the `<re-icon>` component to display icons. Never use raw `<span class="material-symbols-outlined">` or similar HTML elements for icons.

## Usage

```html
<re-icon icon="icon_name" size="medium" color="primary"></re-icon>
```

## Attributes

| Attribute | Type | Default | Values |
|-----------|------|---------|--------|
| `icon` | string | `null` | Any Material Symbols icon name |
| `size` | string | `"medium"` | `extra-small`, `small`, `medium`, `large`, `extra-large` |
| `color` | string | `"inherit"` | `primary`, `secondary`, `tertiary`, `additional`, `info`, `warning`, `success`, `error`, `empty`, `inherit` |
| `variant` | string | `"filled"` | `filled`, `outlined`, `rounded`, `sharp`, `block` |
| `weight` | number | `400` | `100`–`700` |
| `animation` | string | `"none"` | `none`, `spin`, `pulse`, `bounce`, `shake` |
| `contrast` | boolean | `false` | Uses contrast text color when true |

## TypeScript API

```typescript
import ReIcon from "./ReIcon.html.js";

// Setting icon programmatically
iconRef.Icon.setObject('wifi');
iconRef.Color.setObject('success');
iconRef.Animation.setObject('pulse');
```

## Examples

```html
<!-- Static icon in template -->
<re-icon icon="wifi" size="large" color="success"></re-icon>

<!-- Small section icon -->
<re-icon icon="cloud_download" size="small"></re-icon>

<!-- Icon with animation -->
<re-icon icon="sync" size="medium" color="info" animation="spin"></re-icon>
```
