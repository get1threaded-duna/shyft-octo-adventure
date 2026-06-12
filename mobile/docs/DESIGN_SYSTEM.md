# JUGGERNAUT Design System
## Portfolio Command Center — Mobile (Expo / React Native)

Adapted from Coinbase Wallet iOS visual language. All token values are defined in
`src/theme/tokens.ts` as the single source of truth.

---

## 1. Color Palette

| Token | Value | Usage |
|---|---|---|
| `background` | `#000000` | Root background, screen fill |
| `surface1` | `#111111` | Cards, list containers, tab bar |
| `surface2` | `#1c1c1e` | Elevated inputs, icon wrap buttons, pressed row states |
| `surface3` | `#2c2c2e` | Borders, dividers, dashed outlines |
| `primary` | `#0052FF` | CTA buttons, active tab indicator, links |
| `primaryMuted` | `rgba(0,82,255,0.15)` | Primary button tinted backgrounds |
| `textPrimary` | `#FFFFFF` | Headlines, prices, body on dark |
| `textSecondary` | `#8A8A8A` | Subtitles, tickers, captions |
| `textTertiary` | `#3D3D3D` | Placeholder, settings chevrons, disabled text |
| `positive` | `#05B169` | Gains, positive percentage labels |
| `positiveMuted` | `rgba(5,177,105,0.15)` | Gain pill backgrounds |
| `negative` | `#F42E2E` | Losses, negative percentage labels |
| `negativeMuted` | `rgba(244,46,46,0.15)` | Loss pill backgrounds |
| `warning` | `#F0B429` | Concentration alert text |
| `warningMuted` | `rgba(240,180,41,0.15)` | Concentration alert card background |
| `divider` | `#2c2c2e` | `StyleSheet.hairlineWidth` horizontal rules |
| `overlay` | `rgba(0,0,0,0.7)` | Bottom sheet scrims, modal overlays |
| `tabBarBg` | `#111111` | Tab bar background |
| `tabBarBorder` | `#2c2c2e` | Tab bar top border |

Dark mode is the only supported theme. `userInterfaceStyle: "dark"` is set in `app.json`.

---

## 2. Typography Scale

All styles are pre-built objects in `src/theme/tokens.ts → typography` and spread
directly into `StyleSheet` definitions. Font family falls back to the system sans-serif
(SF Pro on iOS, Roboto on Android) — no custom font loading required.

| Token | Size | Weight | Letter-spacing | Color |
|---|---|---|---|---|
| `heroBalance` | 44sp | 700 | –1.5 | textPrimary |
| `screenTitle` | 20sp | 700 | 0 | textPrimary |
| `sectionHeader` | 16sp | 600 | 0 | textPrimary |
| `assetName` | 16sp | 600 | 0 | textPrimary |
| `assetTicker` | 14sp | 400 | 0 | textSecondary |
| `price` | 16sp | 600 | 0 | textPrimary |
| `priceChange` | 14sp | 500 | 0 | (set per sign) |
| `body` | 14sp | 400 | 0 | textPrimary |
| `caption` | 12sp | 400 | 0 | textSecondary |
| `tabLabel` | 10sp | 500 | 0 | (set per focus) |

---

## 3. Spacing System

Base unit: **4pt**. All values are multiples of 4.

| Token | Value | Common use |
|---|---|---|
| `xs` | 4 | Tight gaps, label margins |
| `sm` | 8 | Inner gaps, pill padding |
| `md` | 12 | Item gap between icon + text |
| `base` | 16 | Alias for `screen` / `card` |
| `screen` | 16 | Horizontal screen padding |
| `card` | 16 | Card internal padding |
| `lg` | 20 | Section top padding |
| `xl` | 24 | Section gap between major blocks |
| `sectionGap` | 24 | Alias for `xl` |
| `xxl` | 32 | Hero padding, upload box padding |
| `assetRowHeight` | 72 | Fixed height for every asset list row |

---

## 4. Radius Scale

| Token | Value | Usage |
|---|---|---|
| `sm` | 8 | Range selector buttons |
| `card` | 12 | Cards, list containers, alert cards |
| `button` | 12 | Primary / secondary buttons, icon wraps |
| `pill` | 100 | All pill badges, concentration bar end-caps |
| `bottomSheet` | 20 | Top corners of bottom sheets |
| `input` | 12 | Text inputs |
| `avatar` | 100 | Circular logo avatars, profile images |

---

## 5. Shadow System

Applied on iOS via `shadow*` props; on Android via `elevation`.

| Token | Usage |
|---|---|
| `shadows.card` | `shadowOffset {0,2}`, opacity 0.3, radius 8, elevation 4 |
| `shadows.bottomSheet` | `shadowOffset {0,–4}`, opacity 0.5, radius 16, elevation 16 |

---

## 6. Component Inventory

### BalanceHeader
**File:** `src/components/BalanceHeader.tsx`

Displays total portfolio value as a hero number, all-time gain/loss as a coloured pill
+ absolute amount, and today's change as a caption line. Maps directly to the Coinbase
Wallet top-of-screen balance block.

Props: `totalValue`, `totalGainLoss`, `totalGainLossPct`, `dayChange`, `dayChangePct`

### AssetRow
**File:** `src/components/AssetRow.tsx`

72pt fixed-height pressable row. Left: circular logo avatar (initials placeholder, tinted
with `logoColor`). Centre: asset name + ticker. Right: dollar value + gain/loss pill.
Pressed state uses `surface2` fill. Fires haptic on tap.

Props: `position: Position`, `portfolioPct: number`, `onPress: (position) => void`

### ActionButtons
**File:** `src/components/ActionButtons.tsx`

Horizontal row of 1–4 equal-width icon+label buttons (52×52 `surface2` rounded square
icon wrap). Mirrors the Coinbase Wallet "Send / Receive / Buy / Sell" row.
In Juggernaut: Add / Refresh / Analysis / Export.

Props: `actions: ActionButton[]`

### Card
**File:** `src/components/Card.tsx`

Thin wrapper adding `surface1` background, `radii.card` border radius, and optional
`spacing.card` padding. Handles `marginHorizontal: screen` automatically.

Props: `children`, `style?: ViewStyle`, `padding?: boolean`

### SectionHeader
**File:** `src/components/SectionHeader.tsx`

Label + optional right-side action link (rendered in `primary` colour). Used above every
list section.

Props: `title: string`, `action?: { label, onPress }`

### ConcentrationBar
**File:** `src/components/ConcentrationBar.tsx`

Segmented horizontal bar (8pt height, pill end-caps) visualising portfolio allocation by
position. Followed by an inline legend of dots + ticker + percentage. Uses a fixed
5-colour palette cycling through primary, purple, positive, warning, negative.

Props: `segments: { ticker, pct, color }[]`

### Button
**File:** `src/components/Button.tsx`

Variants: `primary` (blue fill), `secondary` (surface2 fill), `pill` (surface2 + pill
radius, shorter height), `ghost` (transparent, primary text). Supports `loading`
(ActivityIndicator replaces label) and `disabled` (0.4 opacity). Fires haptic on press.

Props: `label`, `onPress`, `variant?`, `loading?`, `disabled?`, `style?`

---

## 7. Navigation Architecture

```
app/
  _layout.tsx              ← GestureHandlerRootView + Stack root
  (tabs)/
    _layout.tsx            ← Tabs navigator (5 tabs)
    index.tsx              ← Portfolio Home (default)
    markets.tsx            ← Markets / Watchlist placeholder
    add.tsx                ← Add Positions flow
    journal.tsx            ← Trade Journal placeholder
    settings.tsx           ← Settings
  position/
    [ticker].tsx           ← Position Detail (dynamic route)
```

### Tab Bar
- Height: 83pt (accounts for iPhone home indicator area)
- `paddingBottom: 24` for content above indicator
- `tabBarShowLabel: false` — labels are rendered inside custom `TabIcon` component
- Center tab (Add) uses a floating 52×52 primary-blue circle with glow shadow
- Active icon: `opacity: 1`, label colour `primary`
- Inactive icon: `opacity: 0.5`, label colour `textSecondary`

### Stack Navigator
- All screens: `headerShown: false` (each screen manages its own `SafeAreaView`)
- `position/[ticker]`: header shown, transparent black background, white tint,
  no back title, empty `headerTitle` (asset name shown in hero section below)
- `contentStyle: { backgroundColor: '#000' }` prevents white flash on transition

---

## 8. Screen Descriptions

### Portfolio Home (`(tabs)/index.tsx`)
Coinbase Wallet assets screen clone:
1. `BalanceHeader` — hero total value
2. `ActionButtons` — Add / Refresh / Analysis / Export
3. Concentration alert card (conditional, shown when top position ≥ 50%)
4. `SectionHeader` "Allocation" + `ConcentrationBar`
5. `SectionHeader` "Positions" + list card of `AssetRow` with hairline dividers
6. Pull-to-refresh (1.2s simulated delay)

### Position Detail (`position/[ticker].tsx`)
1. Centred hero: circular logo, asset name, current price, gain/loss pill
2. Chart placeholder card with time-range segmented control (1D / 1W / 1M / 3M / 1Y / All)
3. Stats 2-column grid (Shares, Avg Cost, Total Value, Gain/Loss, Sector, Portfolio %)
4. "Analysis Brief" primary button (loading state with ActivityIndicator)
5. Disclaimer caption

### Add Screen (`(tabs)/add.tsx`)
Upload screenshot (dashed upload box, 📸 icon) or "Enter Manually" secondary button.
Supports Cash App, Robinhood, Fidelity workflows (UI scaffold only in v0.1).

### Settings (`(tabs)/settings.tsx`)
Two grouped list sections: PORTFOLIO (Currency, Data source, Refresh interval)
and ABOUT (Version, Disclaimer). Each row is a `Pressable` with label + value + chevron.

---

## 9. UX Patterns

### Haptics
- `ImpactFeedbackStyle.Light` — asset row taps
- `ImpactFeedbackStyle.Medium` — action buttons, primary CTA buttons

### Pressed States
- `Pressable` rows: `surface2` background fill on press
- Buttons: `opacity: 0.75` on press via `style` callback
- Action icon wraps: `opacity: 0.7`

### Colour Coding
Gain/loss is consistently green (`positive`) for gains and red (`negative`) for losses
across all components. Pills use the muted background variant of the same hue.

### Dividers
Asset list rows separated by `StyleSheet.hairlineWidth` lines inset to align with text
start (skips logo avatar): `marginLeft: screen + 44 + md = 72`.

### Pull to Refresh
Portfolio Home supports pull-to-refresh (`RefreshControl`) with a 1.2s simulated delay.
Tint colour matches `textSecondary` to stay subtle on dark background.

### Loading States
The "Analysis Brief" button enters a loading state (ActivityIndicator) on press,
modelling the async AI analysis flow planned for v0.5.

---

## 10. File Structure

```
mobile/
  app.json
  babel.config.js
  package.json
  tsconfig.json
  app/
    _layout.tsx
    (tabs)/
      _layout.tsx
      index.tsx
      markets.tsx
      add.tsx
      journal.tsx
      settings.tsx
    position/
      [ticker].tsx
  src/
    components/
      ActionButtons.tsx
      AssetRow.tsx
      BalanceHeader.tsx
      Button.tsx
      Card.tsx
      ConcentrationBar.tsx
      SectionHeader.tsx
    data/
      mock.ts
    theme/
      tokens.ts
  assets/
    icon.png          ← required by app.json (placeholder)
  docs/
    DESIGN_SYSTEM.md  ← this file
```

---

## 11. Dependencies

| Package | Version | Purpose |
|---|---|---|
| `expo` | ~51.0.0 | Core Expo SDK |
| `expo-router` | ~3.5.0 | File-based navigation |
| `expo-haptics` | ~13.0.1 | Tactile feedback |
| `expo-image-picker` | ~15.0.7 | Screenshot upload (v0.5) |
| `react-native-reanimated` | ~3.10.1 | Smooth animations |
| `react-native-gesture-handler` | ~2.16.1 | Gesture support + GestureHandlerRootView |
| `react-native-safe-area-context` | 4.10.5 | Safe area insets |
| `react-native-screens` | 3.31.1 | Native screen optimisation |
| `react-native-svg` | 15.2.0 | SVG charts (v0.5) |
| `@gorhom/bottom-sheet` | ^4.6.4 | Bottom sheet modals (v0.5) |

---

*JUGGERNAUT v0.1 — Educational analysis, not investment advice. You make the decisions.*
