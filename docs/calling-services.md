# Calling services

Your code that makes your service calls should normally depend on `IServiceProxy` and have the concrete implementations injected at runtime. `IServiceProxy` exposes the basic HTTP CRUD operations:

| IServiceProxy Method | HTTP Verb |
| -------------------- | --------- |
| createViaService     | POST      |
| readViaService       | GET       |
| updateViaService     | PUT       |
| deleteViaService     | DELETE    |

## createViaService

```javascript
await serviceProxy.createViaService('/products/product/', { price: 500, name: 'Bicycle' });

// Payload is optional
await serviceProxy.createViaService('/foo-bar/');
```

## readViaService

```javascript
const bankBalance = await serviceProxy.readViaService('/my-bank-balance/');

// Can use generics in TypeScript to specify the expected response type
const bankBalance = await serviceProxy.readViaService<number>('/my-bank-balance/');
```

## updateViaService

```javascript
await serviceProxy.updateViaService('/my-bank-balance/', 10000000000000000);

// Payload is optional
await serviceProxy.updateViaService('/foo-bar/');
```
## deleteViaService

```javascript
await serviceProxy.deleteViaService('/speeding-tickets/55443/');

// Payload is optional
await serviceProxy.updateViaService('/foo-bar/', { foo: 'bar' });
```

## HttpServiceProxy

The `HttpServiceProxy` implentation makes real HTTP calls to your API. It is instantiated with a base URL, which is appended to all URIs specified in service calls (i.e., `readViaService`, `updateViaService`, `deleteViaService`, and `createViaService`).

```javascript
import { HttpServiceProxy } from 'io-source';

const serviceProxy = new HttpServiceProxy('./my-api/');
```

By default, the base URL is `/api/`, so if this is the path to your API, no constructor arguments are required.

```javascript
import { HttpServiceProxy } from 'io-source';

const serviceProxy = new HttpServiceProxy();
```

### Custom Serialization

In addition, it is also possible to specify a custom serializer (any object implementing `stringify` and `parse`). io-source provides a `CircularSerializer`, which leverages Douglass Crockford's [Circular JSON](https://github.com/douglascrockford/JSON-js/blob/master/cycle.js) implementation, and can be used to deserialize objects that have circular references:

```javascript
import { HttpServiceProxy, CircularSerializer } from 'io-source';

const serviceProxyWithCircularSerializer = new HttpServiceProxy('./api/', new CircularSerializer());
```

### Global Request Headers

`HttpServiceProxy` has a `addGlobalRequestHeader` method that ensures every request contains a specified HTTP header, which is useful for cross-cutting concerns like authentication:

```javascript
const serviceProxy = new HttpServiceProxy();

serviceProxy.addGlobalResponseHeader('authorization', `basic ${httpBasicCredentials}`);
```

## MockServiceProxy

The `MockServiceProxy` implementation calls mock services that you define. For info about definining mock services, see the [Defining Mock Services](./defining-mock-services.md) section.

```javascript
import { MockServiceProxy } from 'io-source';

const serviceProxy = new MockServiceProxy();
```

### Adding Random Delays

`MockServiceProxy` supports adding random delays to simulate the latency that would normally occur when calling a real API. When enabled, a random delay between between 0 and 1.5 seconds will be added to every mock service call. This is useful for testing that your application is providing appropriate feedback to your users while loading (e.g., a loading spinner, loading skeleton, etc.). If this option is not enabled, mock service calls are otherwise instantaneous (assuming your mock service implementation isn't slow), which is appropriate for automated tests.

```javascript
const serviceProxy = new MockServiceProxy({ addRandomDelays: true });
```

## Listening to responses events

All implementations of `IServiceProxy` allow to listening to service call responses. This is useful for tasks like global error handling, logging, etc.:

```javascript
serviceProxy.responseEvent.listen((response) => {
  if (response.status === 500) {
    window.alert(`An error occurred while calling a service: ${response.responseBody}`);
  } else if (response.status === 403) {
    window.alert('Access denied');
  }
});
```