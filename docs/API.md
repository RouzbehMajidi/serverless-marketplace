# API Usage Guide
> *Heads up!* 
> All API requests **will** require the pre-provided `x-api-key` header

## Products
### Querying Inventory
In order to query the marketplace inventory, the endpoint `/products/query` can be used. This endpoint supports two actions, namely `GET` and `POST`. 
- The `GET` action allows for the user to obtain a list of all items available in the marketplace inventory.
- The `POST` action with a query body such as the following example below
  ```js
  {
      "query": "<query-search-string>", //required
      "onlyShowAvailableItems": false, //optional, defaults to false, 
  }
  ```
The query system will search for items that contain the search phrase.

### Updating Inventory
Additionally an admin user can make modifications to the marketplace inventory. This is done using the `/products/update` endpoint. This endpoint supports the `POST` action. 
> *Heads up!* 
> In order to perform such an action, the admin user would have to use the following adminSecret `Zjg4ZjJlMzItYTEyMi00NGMxLWI4NjYtYmE3OGRlY2Q1MTdk` as an Authorization Header when sending the request

The following body can be posted to the endpoint in order to add/update an item.
```js
{
    "title": "<item-title>", //required
    "price": price, //required
    "inventory_count": inventory_count, //required
}
```

## Shopping Cart
### Creating a new cart
In order to purchase items a user is required to create a shopping cart first. In order to do this a `POST` request should be sent to the `/cart/create` endpoint. The following is an example of a registration request body.
```js
{
    "username": "waldo" //required
}
```
Keep in mind your username will have to be unique. Once your cart has been successfully created the marketplace will respond with the following confirmation of your username and a secret to be used for future authentication purposes.
```json
{
    "username": "waldo", 
    "secret": "<secret>"
}
```
Store this secret somewhere safe, as a new cart will have to be created if it is lost.

### Getting cart info
A user can obtain detailed information about their cart by using the `/cart/info` endpoint. This endpoint supports the `POST` action. 

> *Heads up!* 
> In order to perform the following actions the user's `secret` will have to be provided in the `Authorization` header of the request.

The following is an example of a request from a user to get information about their cart.
```js
{
    "username": "waldo" //required
}
```
If successful the following response will be received from the endpoint
```json
{
    "username": "waldo",
    "totalCost": 50,
    "cart": [
        [
            "blue sweater",
            {
                "quantity": 1,
                "price": 50
            }
        ]
    ]
}
```

### Updating the cart (adding/removing items)
To add items to your cart, the `/cart/update` endpoint should be used. This endpoint supports `PUT` and `DELETE` actions. For the operation to be successful the `item` field should be a string that is identical to the name of a product existing in the marketplace inventory or the cart. 
> *Heads up!* 
> In order to perform the following actions the user's `secret` will have to be provided in the `Authorization` header of the request.


#### Adding Items
In order to add items to the cart the `PUT` action can be used. The following is an example of a request to put items in the cart.
```js
  {
      "username":"waldo", //required
      "item":"<full-item-name>" //required
  }
```
If successful, one unit of the requested item will be added to the shopping cart. The following is a sample response from the system upon successfully adding an item to the cart.
  ```json
  {
      "message": "Successfully added 'red sweater' to cart.",
      "username": "waldo",
      "totalCost": 50,
      "cart": [
          [
              "red sweater",
              {
                  "quantity": 1,
                  "price": 50
              }
          ]
      ]
  }
  ```

#### Removing Items
In order to remove items from the cart the `DELETE` action can be used. The following is an example of a request to remove items from the cart.
```js
{
    "username":"waldo", //required
    "item":"<full-item-name>" //required
}
```
If successful, one unit of the requested item will be removed from the shopping cart. The following is a sample response from the system upon successfully removing an item from the cart.
```json
{
    "message": "Successfully removed 'red sweater' from cart.",
    "username": "waldo",
    "totalCost": 0,
    "cart": []
}
```

### Completing the cart
To finalize the purchase and complete the cart, the `/cart/complete` endpoint can be used. This endpoint supports the `POST` action.

> *Heads up!* 
> In order to perform the following actions the user's `secret` will have to be provided in the `Authorization` header of the request.

The following is an example of a request body used to complete a users cart.
```js
{
    "username":"waldo" //required
}
```
If the cart is completed successfully the following response will provided by the system
```json
{
    "message": "Successfully completed cart. 📦"
}
```