# UI System

## Reference

The visual system is derived from `docs/reference-ui.jpg`: a low-contrast, condensed desktop application with two contextual rails, layered warm-white surfaces, hairline borders, restrained orange accent, and almost no decorative shadow.

## Typography

- body: `0.8125rem` (13px);
- metadata and compact labels: `0.75rem` (12px);
- normal titles: `0.8125rem`–`0.875rem` (13–14px);
- page and metric maximum: `1rem` (16px);
- weights: predominantly 500–650;
- heading letter spacing: approximately `-0.025em`;
- no application text below 12px or above 16px.

## Surfaces

| Token | Value | Use |
|---|---|---|
| canvas | `#a0a09f` | outside application frame |
| app | `#f9f9f8` | primary application background |
| nav | `#f7f7f6` | primary rail |
| surface | `#fdfdfc` | panels and controls |
| muted surface | `#f1f0ee` | selection and subtle grouping |
| line | `#e7e6e3` | normal hairline |
| ink | `#20201f` | primary text |
| secondary | `#656562` | normal supporting text |
| muted | `#9b9b96` | metadata |
| accent | `#f98123` | primary action and product mark |

## Layout

Desktop:

```text
14.5rem primary rail | 15.25rem context rail | flexible content
```

Mobile and tablet collapse both rails. A modal navigation trigger replaces the primary rail, and pages expose context-specific controls such as an epoch selector.

## Components

Base UI provides behavior for buttons, dialogs, fields, tabs, switches, and tooltips. Product styling remains in the local `components/ui` layer. TanStack libraries provide form state, query state, tables, debouncing, and virtualized history rather than custom substitutes.

## Interaction principles

- 7–9px-equivalent radii expressed in rem for controls;
- 18px-equivalent panel radius;
- 32px normal controls and 28px compact controls;
- borders and tonal layers before shadows;
- hover states change surface tone, not scale dramatically;
- focus uses a subtle accent ring;
- animations remain 150–300ms and respect reduced motion;
- tabular numerals for balances, APY, basis points, and epochs.

## Responsive requirements

- minimum supported viewport: 20rem;
- no horizontal page overflow;
- data tables scroll within their panel;
- controls remain at least 1.75rem high in compact desktop UI;
- critical wallet, verification, and transaction actions remain keyboard accessible;
- semantic headings and accessible labels are retained across breakpoints.
