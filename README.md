# I/O Source

Run and integration test your app with the same set of mock data, then switch to real data with no coding changes.

## Overview

I/O Source is designed to enable Front-End First Development in single-page apps. With I/O Source, you write your front-end code first against mock services that return mock data. Once your front-end is perfected and your workflows, along with the data contract with your web API are well-understood, you can then implement your real web API and effortlessly switch your app between calling your mock API and your real web API. In addition, I/O Source also supports the same flow with browser storage, including both local storage and [LocalForage](https://github.com/localForage/localForage).

In addition, the same mock data and mock services can be leveraged in integration tests. Since your mock services and mock storage are defined with pure JavaScript against in-memory objects, there's no I/O, so your integration tests can test your app much like a real user would with blazing fast performance.

[This tutorial](https://github.com/bencompton/frontend-first-development-tutorial) on leveraging I/O Source with React and Redux might be an interesting read. It's admittedly opinionated and biased towards this author's other OSS libraries, though the general concepts it covers are widely applicable.

 ## How It Works

Let's quickly see it in action with a web API. First, let's define a function to fetch something:

```javascript
import { IServiceProxy } from 'io-source';

const fetchBankBalance = (serviceProxy: IServiceProxy) => {
  return serviceProxy.readViaService('/my-bank-balance/');
};
```

Notice above that `IServiceProxy` was used, which is an interface. To have this call a real web API over HTTP, you define a singleton `HttpServiceProxy` implementation of `IServiceProxy` that will get passed around your app:

```javascript
import { HttpServiceProxy } from 'io-source'

const serviceProxy = new HttpServiceProxy();
```

To call a mock service, you instead define a singleton `MockServiceProxy` implementation of `IServiceProxy` to get passed around your app, and also define mock service implementations:

```javascript
const serviceProxy = new MockServiceProxy();

serviceProxy.addReadOperation('/my-bank-balance/', () => 10000000000000000);
```

Finally, you create a dependency injection pipeline to pass your service proxy singleton around your app. The exact setup of your dependency injection pipeline will depend on what libraries you're using and how your app is designed. Here is an example illustrating a very simple dependency injection pipeline with React and Redux Thunk.

First, we define an action:

```javascript
// actions.ts

const fetchBankBalance = () => {
  return async (dispatch, getState, serviceProxy) => {
    const bankBalance = await fetchBankBalance(serviceProxy);

    dispatch({ type: 'BANK_BALANCE_FETCH_SUCCESSFUL', bankBalance });
  };
};
```

Next, let's create a way to run the app with a configurable service proxy passed through the Redux store:

```javascript
// run-app.ts

import { createStore } from 'redux';
import { render } from 'react-dom';

export const runApp = (serviceProxy: IServiceProxy) => {
  const store createStore(
    reducer,
    applyMiddleware(thunk.withExtraArgument(serviceProxy))
  );

  store.listen(() => {
    render(<App />, document.getElementById('#root'));
  });
};
```

Lastly, we can define different files for the build entry points for our app: one that runs with mock services, and one that runs with a real web API. You would then point your build tool of choice (e.g., Webpack, Parcel, FuseBox, etc.) to one of those two entry points.

Here is an entry point that would build the app to call a real web API:

```javascript
// app.js

import { HttpServiceProxy } from 'io-source'
import { runApp } from './run-app';

const serviceProxy = new HttpServiceProxy();

runApp(serviceProxy);

```

Here is an entry point that would build the app to call a mock web API:

```javascript
// app-with-mocks.ts

import { HttpServiceProxy } from 'io-source'
import { runApp } from './run-app';

const serviceProxy = new MockServiceProxy();

serviceProxy.addReadOperation('/my-bank-balance/', () => 10000000000000000);

runApp(serviceProxy);
```

## Installation

```
npm install io-source --save
```

## Additional Documentation

* [Calling Services](./docs/calling-services.md)
* [Defining Mock Services](./docs/defining-mock-services.md)
* [Storage](./docs/storage.md)
* [Connectivity Monitor](./docs/connectivity-monitor.md)
