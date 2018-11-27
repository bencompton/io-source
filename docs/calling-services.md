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