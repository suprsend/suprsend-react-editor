# SuprSend React Template Editor

A React SDK for creating and managing multi-channel notification templates. Provides a complete UI for editing templates across 7 notification channels with a visual email designer, merge tag support, display conditions, live preview, and theming.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Supported Channels](#supported-channels)
- [Components](#components)
  - [SuprSendTemplateProvider](#suprsendtemplateprovider)
  - [TemplateEditor](#templateeditor)
  - [CommitButton](#commitbutton)
  - [TestButton](#testbutton)
- [Theming](#theming)
- [Authentication](#authentication)
- [TypeScript Types](#typescript-types)

---

## Installation

```bash
npm install @suprsend/react-editor
# or
yarn add @suprsend/react-editor
```

---

## Quick Start

```tsx
import {
  SuprSendTemplateProvider,
  TemplateEditor,
  CommitButton,
  TestButton,
} from '@suprsend/react-editor';
import '@suprsend/react-editor/styles.css';

function App() {
  return (
    <SuprSendTemplateProvider
      workspaceUid="your-workspace-uid"
      templateSlug="order-confirmation"
      variantId="default"
      channels={['email', 'inbox', 'androidpush', 'webpush']}
      tenantId={null}
      locale="en"
      theme="light"
    >
      <TemplateEditor onCommit={() => console.log('Committed!')} />
    </SuprSendTemplateProvider>
  );
}
```

> **Important:** You must import the stylesheet (`@suprsend/react-editor/styles.css`) for the components to render correctly.

---

## Supported Channels

| Channel          | ID            | Features                                                                        |
| ---------------- | ------------- | ------------------------------------------------------------------------------- |
| **Email**        | `email`       | Visual designer, raw HTML, plain text, metadata, merge tags, display conditions |
| **Slack**        | `slack`       | Block Kit (JSON) or plain text                                                  |
| **MS Teams**     | `ms_teams`    | Adaptive Cards (JSON) or plain text                                             |
| **Android Push** | `androidpush` | Title, body, buttons, image, custom payload, silent/sticky options              |
| **iOS Push**     | `iospush`     | Title, body, image, action URL                                                  |
| **Web Push**     | `webpush`     | Title, body, buttons, image, action URL                                         |
| **In-app Inbox** | `inbox`       | Rich content, avatar, buttons, tags, expiry, importance levels                  |
| **SMS**          | `sms`         | Coming soon                                                                     |
| **WhatsApp**     | `whatsapp`    | Coming soon                                                                     |

---

## Components

### SuprSendTemplateProvider

The root context provider. Wrap your editor UI with this component.

```tsx
<SuprSendTemplateProvider
  workspaceUid="ws_123"
  templateSlug="welcome-email"
  variantId="default"
  channels={['email', 'inbox', 'webpush']}
  tenantId={null}
  locale="en"
  theme="dark"
  themeOverrides={{ primary: '#6366f1', radius: '8px' }}
  accessToken="your-access-token"
  refreshAccessToken={async (oldToken) => {
    const newToken = await fetchNewToken(oldToken);
    return newToken;
  }}
>
  {children}
</SuprSendTemplateProvider>
```

#### Props

| Prop                   | Type                                    | Required | Default   | Description                                                  |
| ---------------------- | --------------------------------------- | -------- | --------- | ------------------------------------------------------------ |
| `workspaceUid`         | `string`                                | Yes      | —         | Your SuprSend workspace identifier                           |
| `templateSlug`         | `string`                                | Yes      | —         | The template slug                                            |
| `variantId`            | `string`                                | Yes      | —         | The variant identifier                                       |
| `channels`             | `ChannelId[]`                           | Yes      | —         | Array of channels to enable in the editor                    |
| `tenantId`             | `string \| null`                        | Yes      | —         | Tenant ID for multi-tenant workspaces (pass `null` if N/A)   |
| `locale`               | `string`                                | Yes      | —         | Language/locale code (e.g. `"en"`)                           |
| `conditions`           | `unknown`                               | No       | —         | Variant conditions configuration                             |
| `accessToken`          | `string`                                | Yes      | —         | Authentication token                                         |
| `refreshAccessToken`   | `(oldToken: string) => Promise<string>` | No       | —         | Callback to refresh an expired token                         |
| `mode`                 | `'live' \| 'draft'`                     | No       | `'draft'` | Start in draft (editable) or live (read-only) mode           |
| `theme`                | `'light' \| 'dark' \| 'system'`         | No       | `'light'` | UI theme                                                     |
| `themeOverrides`       | `ThemeOverrides`                        | No       | —         | Custom color and styling overrides (see [Theming](#theming)) |
| `recipientDistinctId`  | `string`                                | No       | —         | Recipient ID for populating mock/preview data                |
| `actorDistinctId`      | `string`                                | No       | —         | Actor ID for populating mock/preview data                    |
| `notificationCategory` | `string`                                | No       | —         | Notification category for triggering test                    |

---

### TemplateEditor

The main editor component. Renders channel tabs, channel editor forms, and preview panes.

```tsx
<TemplateEditor
  hideActionButtons={false}
  onCommit={() => console.log('Committed!')}
/>
```

#### Props

| Prop                | Type         | Required | Default | Description                                                                                                                                             |
| ------------------- | ------------ | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hideActionButtons` | `boolean`    | No       | `false` | Hide the default action buttons (Test, Commit, Edit, Exit)                                                                                              |
| `onCommit`          | `() => void` | No       | —       | Callback invoked after a successful commit . If you hide action buttons you dont need to pass it as you can directly pass it to commit button component |

> **Tip:** When `hideActionButtons` is `true`, you can use the standalone `TestButton` and `CommitButton` components to place them anywhere in your layout.

---

### CommitButton

A button that opens the commit modal. Validates all variants, lets the user select which to publish, and requires a commit message.

```tsx
<CommitButton onCommit={() => console.log('Published!')} />
```

#### Props

| Prop       | Type         | Required | Description                   |
| ---------- | ------------ | -------- | ----------------------------- |
| `onCommit` | `() => void` | Yes      | Callback invoked after commit |

---

### TestButton

A button that opens the test modal. Allows sending a test notification to a real recipient with mock data.

```tsx
<TestButton onTestSent={() => console.log('Test sent!')} />
```

#### Props

| Prop         | Type         | Required | Description                         |
| ------------ | ------------ | -------- | ----------------------------------- |
| `onTestSent` | `() => void` | No       | Callback invoked after test is sent |

---

## Theming

The editor supports `light`, `dark`, and `system` (auto-detect) themes. Customize the look and feel using `themeOverrides`.

```tsx
<SuprSendTemplateProvider
  theme="light"
  themeOverrides={{
    primary: '#6366f1',
    primaryForeground: '#ffffff',
    background: '#fafafa',
    foreground: '#111827',
    border: '#e5e7eb',
    radius: '8px',
  }}
  // ...other props
>
```

### Available Overrides

| Property                | Description                              |
| ----------------------- | ---------------------------------------- |
| `background`            | Main background color                    |
| `foreground`            | Main text color                          |
| `card`                  | Card/panel background                    |
| `cardForeground`        | Card text color                          |
| `popover`               | Popover/dropdown background              |
| `popoverForeground`     | Popover text color                       |
| `primary`               | Primary brand color                      |
| `primaryForeground`     | Text on primary backgrounds              |
| `secondary`             | Secondary color                          |
| `secondaryForeground`   | Text on secondary backgrounds            |
| `muted`                 | Muted/subtle backgrounds                 |
| `mutedForeground`       | Muted text color                         |
| `accent`                | Accent highlight color                   |
| `accentForeground`      | Text on accent backgrounds               |
| `destructive`           | Error/danger color                       |
| `destructiveForeground` | Text on destructive backgrounds          |
| `border`                | Border color                             |
| `input`                 | Input field border color                 |
| `ring`                  | Focus ring color                         |
| `radius`                | Border radius (e.g. `"8px"`, `"0.5rem"`) |

All CSS classes are scoped with a `suprsend-` prefix to prevent conflicts with your application's styles.

---

## Authentication

Provide an `accessToken` and optionally a `refreshAccessToken` callback to handle token expiration.

```tsx
<SuprSendTemplateProvider
  workspaceUid="ws_123"
  accessToken={token}
  refreshAccessToken={async (oldToken) => {
    const response = await fetch('/api/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ token: oldToken }),
    });
    const { newToken } = await response.json();
    return newToken;
  }}
  // ...other props
/>
```

When a `401` response is received, the SDK automatically calls `refreshAccessToken`, queues pending requests, and retries them with the new token.

### Generating access token

TBD

---

## License

Proprietary. All rights reserved.
