# Defining Mock Services

The `MockServiceProxy` class is a concrete implementation of `IServiceProxy` that supports defining mock services, and exposes a method for each HTTP CRUD operation:

| MockServiceProxy Method | HTTP Verb |
| --------------------    | --------- |
| addCreateOperation      | POST      |
| addReadOperation        | GET       |
| addUpdateOperation      | PUT       |
| addDeleteOperation      | DELETE    |

For mock services, you define a URI, and optionally, a function to handle requests:

```javascript
serviceProxy.addReadOperation('/my-bank-balance/', () => 10000000000000000);

serviceProxy.addCreateOperation('/products/product/', (uriParameters, requestBody) => {
  mockProducts.push({ id: mockProducts.length, requestBody.price, requestBody.name });
});

serviceProxy.addUpdateOperation('/high-score/', (uriParameters, requestBody) => {
  highScore = requestBody;
});

serviceProxy.addDeleteOperation('/foo-bar/');
```

## URI Parameters

Mock service operations support simple URI parameters:

```javascript
serviceProxy.addUpdateOperation('/products/product/{productId}/price/', (urlParameters, requestBody) => {
  mockProducts[urlParameters.productId].price = requestBody;
});
```

## Regex URI

For more complex URI matching, using a regex is possible:

```javascript
serviceProxy.addUpdateOperation(/\/products\/product\/(\d+)\/price\//, (regexMatches, requestBody) => {
  mockProducts[regexMatches[1]].price = requestBody;
});
```

## Global Parameters

Many times, it is necessary to modify the behavior on demand of a mock service operation, such as when writing tests. The service proxy allows passing in parameters that service operations can access:

```javascript
serviceProxy.setParameter('bank-balance', 20);

serviceProxy.addReadOperation('/my-bank-balance/', (uriParameters, requestBody, globalParams) => {
  return globalParams['bank-balance'];
});

const bankBalance = await serviceProxy.readViaService('/my-bank-balance/'); // 20

serviceProxy.setParameter('make-product-create-fail', true);

serviceProxy.addCreateOperation('/products/product/', (uriParameters, requestBody, globalParams) => {
  if (globalParams['make-product-create-fail'] === true) {
    throw new Error('Product create failed!');
  } else {
    mockProducts.push({ id: mockProducts.length, requestBody.price, requestBody.name });
  }  
});

await serviceProxy.createViaService('/my-bank-balance/', { price: 500, name: 'Bicycle' }); // Product create failed!

```
## HTTP Status Codes

HTTP status codes [get logged](#logged-calls) when a mock service is called. By default, mock service HTTP status codes are determined as follows:

* When the service operation's function returns something, the status code will be `200`
* If a service operation has only a URI and no function defined, the status code will be `204`
* If an attempt is made to call a service operation that doesn't exist, the resulting status code will be `404`
* If an error is thrown within the service operation's function, the status code will be `500`

It is also possible to define custom HTTP response codes within the service operation function:

```javascript
serviceProxy.addReadOperation('/my-bank-balance/', () => {
  if (isLoggedIn) {
    return 10000000000000;
  } else {
    return {
      status: 401,
      responseBody: 'Please login'
    };
  }
});
```
## HTTP Headers

Mock services can also return HTTP headers, which [get logged](#logged-calls) when the mock service is called:

```javascript
serviceProxy.addReadOperation('/foo/', () => {
  return {
    status: 200,
    responseBody: 'Bar',
    headers: { foo: 'baz', bar: 'saz' }
  };
});
```

## Logged Calls

The mock service proxy logs every call, which is often useful for test assertions:

```javascript
const bankBalance = await serviceProxy.readViaService('/my-bank-balance/');

expect(serviceProxy.loggedCalls[0].response.status).toBe(200);
expect(serviceProxy.loggedCalls[0].response.responseBody).toBe(10000000000000000);

await serviceProxy.createViaService('/products/product/', { price: 500, name: 'Bicycle' });

expect(serviceProxy.loggedCalls[1].requestBody.price).toBe(500);
expect(serviceProxy.loggedCalls[1].requestBody.name).toBe('Bicycle');

const bar = await serviceProxy.readViaService('/foo/');

expect(serviceProxy.loggedCalls[2].headers.foo).toBe('baz');
expect(serviceProxy.loggedCalls[2].headers.bar).toBe('saz');
```
