# 🚀 React Event-Driven Architecture Demo

A production-ready demonstration of **Event-Driven Architecture (EDA)** in React with TypeScript, showcasing secure parent-child iframe communication using the **Pub-Sub pattern**.

## 📋 Overview

This project demonstrates a robust event-driven system where a parent application communicates with a child application running in an iframe. The architecture uses an internal event bus for loose coupling and `postMessage` API for secure cross-origin communication.

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Main App (Parent)               │
│  ┌──────────────────────────────────┐   │
│  │      Event Bus (Singleton)       │   │
│  │  - subscribe() / publish()       │   │
│  │  - Type-safe event handling      │   │
│  └──────────────┬───────────────────┘   │
│                 │                        │
│  ┌──────────────▼───────────────────┐   │
│  │    IframeWrapper Component       │   │
│  │  - postMessage sender            │   │
│  │  - Message receiver              │   │
│  │  - Origin verification           │   │
│  └──────────────┬───────────────────┘   │
└─────────────────┼───────────────────────┘
                  │ postMessage API
                  │ (window.postMessage)
┌─────────────────▼───────────────────────┐
│         Child App (Iframe)              │
│  ┌──────────────────────────────────┐   │
│  │    Message Listener              │   │
│  │  - Dual-mode operation           │   │
│  │  - Context detection             │   │
│  │  - Event forwarding              │   │
│  └──────────────────────────────────┘   │
│                                          │
│  Standalone Mode: Internal EventBus     │
│  Iframe Mode: postMessage communication │
└──────────────────────────────────────────┘
```

## ✨ Key Features

### 🎯 Event-Driven Architecture
- **Decoupled Components**: No direct dependencies between parent and child
- **Type-Safe Events**: Discriminated unions for compile-time safety
- **Pub-Sub Pattern**: Clean subscription and publishing model
- **Automatic Cleanup**: Subscription lifecycle management with React hooks

### 🔒 Security
- **Origin Verification**: Configurable allowed origins for postMessage
- **Iframe Sandboxing**: Controlled iframe permissions
- **Type Validation**: Runtime message validation
- **Error Boundaries**: Graceful error handling

### 🎨 Production Features
- **Dual-Mode Operation**: Works in iframe and standalone
- **Context Detection**: Automatic environment detection
- **Theme Synchronization**: Parent-child theme updates
- **Real-time Logging**: Event monitoring and debugging
- **Responsive Design**: Mobile-first CSS architecture

## 📁 Project Structure

```
.
├── main-app/                    # Parent application
│   ├── src/
│   │   ├── event-bus/          # EventBus implementation
│   │   │   └── eventBus.ts     # Pub-Sub singleton
│   │   ├── iframe/             # Iframe communication
│   │   │   └── IframeWrapper.tsx
│   │   ├── components/         # UI components
│   │   │   ├── ControlPanel/
│   │   │   └── EventLog/
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useEventBus.ts
│   │   │   └── useTheme.ts
│   │   ├── utils/              # Utilities
│   │   │   └── Logger.ts
│   │   └── App.tsx             # Main app component
│   └── package.json
│
├── child-app/                   # Child application (iframe)
│   ├── src/
│   │   ├── event-bus/          # EventBus (standalone mode)
│   │   │   └── eventBus.ts
│   │   ├── listeners/          # Message listeners
│   │   │   └── messageListener.ts
│   │   ├── components/         # UI components
│   │   │   ├── ChildControls/
│   │   │   └── ReceivedMessages/
│   │   ├── utils/              # Utilities
│   │   │   ├── contextDetector.ts
│   │   │   └── Logger.ts
│   │   └── App.tsx             # Child app component
│   └── package.json
│
└── types/                       # Shared TypeScript types
    └── events.ts               # Event type definitions
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/react-event-driven-architecture-demo.git
   cd react-event-driven-architecture-demo
   ```

2. **Install dependencies for main app**
   ```bash
   cd main-app
   npm install
   ```

3. **Install dependencies for child app**
   ```bash
   cd ../child-app
   npm install
   ```

### Running the Demo

1. **Start the child app** (runs on port 5174)
   ```bash
   cd child-app
   npm run dev
   ```

2. **Start the main app** (runs on port 5173)
   ```bash
   cd main-app
   npm run dev
   ```

3. **Open your browser**
   - Navigate to `http://localhost:5173`
   - The child app will be loaded in an iframe
   - Start interacting with the controls!

## 🎮 How It Works

### 1. Event Flow (Parent → Child)

```typescript
// Parent: Publish event to EventBus
eventBus.publish(EVENT_TYPES.THEME_UPDATE, { theme: 'dark' });

// IframeWrapper: Listen to EventBus and forward via postMessage
const unsubscribe = eventBus.subscribe(
  EVENT_TYPES.THEME_UPDATE,
  (data) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: EVENT_TYPES.THEME_UPDATE, payload: data },
      allowedOrigin
    );
  }
);

// Child: Receive via messageListener
messageListener.on(EVENT_TYPES.THEME_UPDATE, (data) => {
  setTheme(data.theme); // Update UI
});
```

### 2. Event Flow (Child → Parent)

```typescript
// Child: Send message to parent
messageListener.sendToParent(EVENT_TYPES.BUTTON_CLICKED, {
  message: 'Hello from Child!',
  timestamp: new Date().toISOString()
});

// Parent: Receive and publish to EventBus
window.addEventListener('message', (event) => {
  const message = event.data;
  eventBus.publish(`CHILD_${message.type}`, message.payload);
});

// Parent: Components subscribe to child events
useEventBus(`CHILD_${EVENT_TYPES.BUTTON_CLICKED}`, (data) => {
  addMessage(`Child clicked: ${data.message}`);
});
```

### 3. Type Safety

```typescript
// Discriminated union ensures compile-time safety
export type EventPayload =
  | { type: 'THEME_UPDATE'; payload: { theme: Theme } }
  | { type: 'COUNTER_UPDATE'; payload: { count: number } }
  | { type: 'BUTTON_CLICKED'; payload: { message: string } };

// TypeScript infers exact payload type based on event type
eventBus.subscribe(EVENT_TYPES.THEME_UPDATE, (data) => {
  data.theme // ✅ TypeScript knows this is 'light' | 'dark'
});
```

## 🔧 Key Components

### EventBus ([`main-app/src/event-bus/eventBus.ts`](main-app/src/event-bus/eventBus.ts))
- Singleton pub-sub implementation
- Type-safe subscriptions
- Error handling and logging
- Automatic cleanup

### IframeWrapper ([`main-app/src/iframe/IframeWrapper.tsx`](main-app/src/iframe/IframeWrapper.tsx))
- Secure postMessage communication
- Origin verification
- Bidirectional event forwarding
- Load state management

### MessageListener ([`child-app/src/listeners/messageListener.ts`](child-app/src/listeners/messageListener.ts))
- Dual-mode operation (iframe/standalone)
- Message validation
- Event handler registration
- Context-aware communication

### ContextDetector ([`child-app/src/utils/contextDetector.ts`](child-app/src/utils/contextDetector.ts))
- Automatic iframe detection
- Parent communication validation
- Origin extraction
- Debug information

## 📊 Event Types

| Event Type | Direction | Payload | Description |
|-----------|-----------|---------|-------------|
| `INIT` | Parent → Child | `{ message: string }` | Initial handshake |
| `THEME_UPDATE` | Parent → Child | `{ theme: Theme }` | Theme changes |
| `USER_ACTION_UPDATE` | Parent → Child | `{ action: string, count: number }` | Parent counter updates |
| `BUTTON_CLICKED` | Child → Parent | `{ message: string, timestamp: string }` | Child button clicks |
| `COUNTER_UPDATE` | Child → Parent | `{ count: number }` | Child counter updates |

## 🎨 Features Demonstrated

### ✅ Architecture Patterns
- Event-Driven Architecture (EDA)
- Publish-Subscribe (Pub-Sub)
- Singleton pattern (EventBus)
- Observer pattern (subscriptions)
- Strategy pattern (dual-mode operation)

### ✅ React Best Practices
- Custom hooks (`useEventBus`, `useTheme`)
- Ref forwarding for DOM access
- Proper cleanup with `useEffect`
- Memoization with `useCallback`
- Component composition

### ✅ TypeScript Features
- Discriminated unions
- Type guards
- Generics
- Const assertions
- Interface composition

### ✅ Security Considerations
- Origin verification
- Message validation
- Iframe sandboxing
- Error boundaries
- XSS prevention

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **CSS Modules** - Scoped styling
- **ESLint** - Code quality
- **postMessage API** - Cross-origin communication

## 📝 Use Cases

This architecture pattern is ideal for:

1. **Micro-frontends**: Independent teams, different tech stacks
2. **Widget embedding**: Third-party integrations
3. **Multi-tenant dashboards**: Isolated tenant UIs
4. **Plugin systems**: Extensible applications
5. **Secure data visualization**: Sandboxed analytics
6. **Cross-origin collaboration**: Different domain communication

## 🔍 Development Tips

### Debugging
- Open browser console for detailed logs
- Check the Event Log panel in the UI
- Use Logger class for structured logging

### Testing Standalone Mode
- Open child app directly at `http://localhost:5174`
- Events will be published to internal EventBus
- Demo mode activates automatically

### Production Deployment
1. Update `allowedOrigin` in [`IframeWrapper`](main-app/src/iframe/IframeWrapper.tsx)
2. Configure CSP headers
3. Build both apps: `npm run build`
4. Deploy to separate origins if needed

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

This demo showcases production-ready patterns for:
- Enterprise micro-frontend architectures
- Secure cross-origin communication
- Type-safe event systems
- Scalable React applications

## 📚 Learn More

- [postMessage API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
- [TypeScript Discriminated Unions](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#discriminating-unions)
- [React Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

**Built by [Bhargav](https://github.com/bhargav-simform)**

*Demonstrating production-grade event-driven architecture in React*