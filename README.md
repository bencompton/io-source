# I/O Source

Run and integration test your app with the same mock data, then switch to real data at any time.

I/O Source is designed to primarily to work with single-page apps that have Flux-like architectures (e.g., Redux, MobX, or VueX). With I/O Source, you create mock services that emulate your app’s real services and also mock out any access to local storage (LocalForage is also supported). You can then instantly switch between using mock services and mock data and calling real services and persisting data in the browser.

### Installation

```
npm install io-source --save
```

### Why bother?

The reason why this is useful is because front-end engineers can run and develop the app without having to set up their development environment with all of the back-end components (web APIs, databases, message queues, etc.). Also, it is often more efficient to get the front-end working first to determine what data the UI needs from service calls before implementing the full stack. Finally, when used with Flux-like architectures (Redux, MobX, VueX, etc.), it is possible to write integration tests that share the same mock services and mock data used when running the app, mimic the running app and how users actually use the app, are quicker to write than unit tests, and most importantly, run nearly as fast as unit tests (because all I/O is mocked out).

### How does it work?

Different parts of your app’s data are encapsulated in “source” classes. These “source” classes have data proxies injected into their constructors for handling service calls and accessing browser storage. You can either inject real proxies or fake proxies, depending on whether you want to call real services and actually persist data in the browser, or want to run the app or integration tests against mock data and services.

### Examples

...WIP
