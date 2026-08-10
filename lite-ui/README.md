# Lite UI

A lightweight React UI utility package that provides a collection of useful hooks and components for building modern web applications.

## Features

- Collection of React hooks for common UI patterns
- Lightweight and performant
- TypeScript support
- Compatible with React 19+

## Installation

Add the package to your `package.json`:

```json
{
  "dependencies": {
    "@core/lite-ui": "^1.0.0"
  }
}
```

Add the package reference to your `tsconfig.json`:

```json
{
  "references": [
    {"path": "../../packages/lite-ui"}
  ]
}
```

## Available Hooks

### useFetch

A hook for making HTTP requests with loading and error states.

```typescript
import { useFetch } from '@core/lite-ui';

function UserProfile({ userId }) {
  const { data, loading, error } = useFetch(`/api/users/${userId}`);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  );
}
```

### useForm

A hook for managing form state and validation.

```typescript
import { useForm } from '@core/lite-ui';

function LoginForm() {
  const { values, errors, handleChange, handleSubmit } = useForm({
    initialValues: { email: '', password: '' },
    validate: (values) => {
      const errors = {};
      if (!values.email) errors.email = 'Email is required';
      if (!values.password) errors.password = 'Password is required';
      return errors;
    },
    onSubmit: (values) => {
      // Handle form submission
      console.log(values);
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={values.email}
        onChange={handleChange}
      />
      {errors.email && <span>{errors.email}</span>}
      
      <input
        type="password"
        name="password"
        value={values.password}
        onChange={handleChange}
      />
      {errors.password && <span>{errors.password}</span>}
      
      <button type="submit">Login</button>
    </form>
  );
}
```

### useFullscreen

A hook for managing fullscreen mode.

```typescript
import { useFullscreen } from '@core/lite-ui';

function VideoPlayer() {
  const { isFullscreen, toggleFullscreen, ref } = useFullscreen();

  return (
    <div ref={ref}>
      <video src="video.mp4" />
      <button onClick={toggleFullscreen}>
        {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      </button>
    </div>
  );
}
```

### useInfiniteScroll

A hook for implementing infinite scrolling.

```typescript
import { useInfiniteScroll } from '@core/lite-ui';

function ProductList() {
  const { items, loading, loadMore } = useInfiniteScroll({
    fetchItems: async (page) => {
      const response = await fetch(`/api/products?page=${page}`);
      return response.json();
    }
  });

  return (
    <div>
      {items.map(item => (
        <ProductCard key={item.id} product={item} />
      ))}
      {loading && <LoadingSpinner />}
    </div>
  );
}
```

### useTimer

A hook for managing timers and countdowns.

```typescript
import { useTimer } from '@core/lite-ui';

function Countdown({ duration }) {
  const { time, start, pause, reset } = useTimer({
    initialTime: duration,
    onComplete: () => console.log('Timer completed')
  });

  return (
    <div>
      <div>{time}</div>
      <button onClick={start}>Start</button>
      <button onClick={pause}>Pause</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

### useAutoFetch

A hook for automatically fetching data at intervals.

```typescript
import { useAutoFetch } from '@core/lite-ui';

function LiveData() {
  const { data, loading } = useAutoFetch({
    url: '/api/live-data',
    interval: 5000 // Fetch every 5 seconds
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Live Data</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

### useClipboard

A hook for managing clipboard operations.

```typescript
import { useClipboard } from '@core/lite-ui';

function CopyButton({ text }) {
  const { copy, copied } = useClipboard();

  return (
    <button onClick={() => copy(text)}>
      {copied ? 'Copied!' : 'Copy to Clipboard'}
    </button>
  );
}
```

## Development

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run start:dev
```

### Testing

```bash
npm test
npm run test:dev  # for watch mode
```

### Linting

```bash
npm run eslint
```

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the ISC License. 