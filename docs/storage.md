# Storage

I/O Source provides wrappers around local storage as well as [LocalForage](https://github.com/localForage/localForage). Your app will mostly use the `IKeyValueStorageProxy` interface, and you can then dependency inject either a `LocalStorageProxy`, a `LocalForageProxy`, or a `MockKeyValueStorageProxy` (stores data in memory only).

## Basic Usage

All implentations of `IKeyValueStorageProxy` support the following:

```javascript
  // Set an item in storage, automatically serializing to a JSON string before storing
  storageProxy.setItem<T>('products', [{ price: 500, name: 'Bicycle' }]);

  // Get an item from storage, automatically deserializing from stored JSON
  const products = await storageProxy.getItem<IProduct[]>('products');

  // Get an item from storage without deserializing from JSON
  const productJson = storageProxy.getString('products');

  // Set an item in storage directly with a JSON string
  storageProxy.setString('products', '[{ "price": 500, "name": "Bicycle" }]');

  // Get an array of keys in storage
  const keys = storageProxy.getKeys();

  // Remove an item from storage
  storageProxy.removeItem('products');
```

## LocalStorageProxy

```javascript
import { LocalStorageProxy } from 'io-source';

const storageProxy = new LocalStorageProxy();
```

## LocalForageProxy

```javascript
import { LocalForageProxy } from 'io-source';

const storageProxy = new LocalForageProxy();
```

## MockStorageProxy

```javascript
import { MockStorageProxy } from 'io-source';

const storageProxy = new MockStorageProxy();
```

## Custom Serialization

`LocalForageProxy` and `LocalStorageProxy` both support custom serializers (any object implementing `stringify` and `parse`). io-source provides a `CircularSerializer`, which leverages Douglass Crockford's [Circular JSON](https://github.com/douglascrockford/JSON-js/blob/master/cycle.js) implementation, and can be used to deserialize objects that have circular references:

```javascript
import { localStorageProxy, localForageProxy, CircularSerializer } from 'io-source'

const localStorageProxyWithCircularSerializer = new LocalStorageProxy(new CircularSerializer());
const localForageProxyWithCircularSerializer = new LocalForageProxy(new CircularSerializer());
```