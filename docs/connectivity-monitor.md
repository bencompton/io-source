# Connectivity Monitor

When creating applications that need to handle spotty connectivity or work offline, it is useful to have a way to check the connectivity and also monitor when the device connectivity changes. For this purpose, io-source provides `IConnectivityMonitor`, along with the `ConnectivityMonitor` and `MockConnectivityMontior` implementations.

## General usage

```javascript
  // Try to fetch user session, and if it fails because of connectivity, fetch from storage instead

  try {
    return await serviceProxy.readViaService('/user-session/');
  } catch (error) {
    if (await connectivityMonitor.getConnectionStatus() === 'disconnected') {
      return storageProxy.getItem('/user-session/');
    } else {
      throw error;
    }    
  }
```

```javascript
  // Monitor connectivity and warn the user when offline

  connectivityMonitor.listen((connectivityStatus) => {
    if (connectivityStatus === 'disconnected') {
      window.alert('Warning: your device is currently offline, so any changes will not be saved!');
    }
  });
```

## ConnectivityMontior

The `ConnectivityMonitor` implementation leverages `window.navigator.online`, and will also call an API operation you provide to verify connectivity whenever the connectivity status changes or `getConnectionStatus` is called.

```javascript
const connectivityMonitor = new ConnectivityMonitor(serviceProxy, '/connectivity-test/');
```

## MockConnectivityMonitor

The `MockConnectivityMonitor` implementation is useful for testing and when running your app with mock data and mock services. It does not actually check connectivity, and instead relies on the connectivity status to be set manually via its `setConnectionStatus` method.

```javascript
const connectivityMonitor = new ConnectivityMonitor(serviceProxy);

connectivityMonitor.setConnectionStatus('connected');
connectivityMonitor.setConnectionStatus('disconnected');
```