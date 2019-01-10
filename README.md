# Serverless Marketplace API ☁️
> API usage guide available [here](docs/API.md)

The goal of this submission is to create the barebones of an online marketplace. The marketplace is accessed via a REST API which allows users to get available products, create a cart, add or remove items from the cart and finally 'complete' the cart, which finalizes the sale and updates inventory counts of the marketplace. 

## System Architecture
The system was designed using a serverless architecture. This allowed the system to be split up into multiple separate logical components which run independently of each other. As the system is serverless, it is also stateless and thus in order to add persistance functionality a NoSQL database was used. The entire system is setup and managed using the [Serverless Framework](https://serverless.com) and is hosted on Amazon Web Services (AWS). The individual functions run as AWS Lambda functions, while AWS DynamoDB is used as the NoSQL database. This system architecture was chosen as it allows for great flexibility and scalability.

### Endpoints
The following endpoints are available in order to use the API system.
- Products
  - `POST` - `/products/update` - Private (Admin Only)
  - `POST`, `GET` - `/products/query` - Public
- Cart
  - `POST` - `/cart/create` - Public
  - `PUT`, `DELETE` - `/cart/update` - Private (User Only)
  - `POST` - `/cart/info` - Private (User Only)
  - `POST` - `/cart/complete` - Private (User Only)

The usage of these endpoints and the system in general is described in more detail [here](docs/API.md).

## Marketplace Inventory
The marketplace inventory consists of a NoSQL table with entries such as the following
```json
{
    "title":"Blue Sweater",
    "price": 50,
    "inventory_count": 10
}
```
The main key of the table is the `title` field with key type of `HASH`. Item titles can be queried quite flexibly using the API as the system will search for items with titles that contain the search query. Items that are not currently available (i.e. `inventory_count` < 0) can also be filtered. 
The marketplace inventory can also be updated (to add or remove items, modify inventory counts or prices) using the API, only a user with the administrator secret can perform this action.

## Shopping Cart
### Creating a Cart
A user that would like to purchase items from the system would have to first create a cart. In order to create a cart, the user invokes the cart creation API with a username of their choice (which must also be unique to the system). The system will then generate and provide them with a security token which serves as the user's secret. When invoking sensitive APIs (such as ones that update a user's cart, show info regarding a user's cart or complete the cart), the user will have to supply the system with their username in addition to their secret which is then verified by the system. 

A user's shopping cart is stored into a NoSQL table with the following format:
```json
{
    "username": "waldo",
    "cart": [
        [
            "blue sweater",
            {
                "quantity": 1
            }
        ]
    ]
}
```
When the system displays info to user about their cart, it is done with the following format
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
Which provides the user with the total and individual up-to-date costs of their items. This is done as prices for items may sometimes change while they are in a user's cart before being completed. Multiple units of the same items are combined together in the cart which simplifies some operations and also allows for greater readability from the user's perspective.

### Modifying a Cart

Users can make modifications to their cart using the update cart endpoint and the `PUT` and `DELETE` actions to add and remove items, respectively. Each request allows for a single item to be modified. The API can be later improved to allow for a varying quantity of a single item to modified in the cart or even list of multiple different modifications to be performed on the cart in a single request. However that is outside of the scope of this submission.

### Completing a Cart

Once a user's cart is completed, the marketplace inventory is updated. The following message is returned to the user in order to show the successful completion of the cart.
```json
{
    "message": "Successfully completed cart. 📦"
}
```
As the system is essentially a backend API which should be used by a multitude of front-end services such as web or mobile applications, extraneous/detailed information provided in response messages is kept to a minimum. While the preference is given to streamlined, straight to the point messages which will allow a separate application making use of the API the ability to provide the user with a better experience. However this is outside of the scope of the submission and therefore some detailed informational messages are still kept in order to improve the API's user experience.

In case a user requests more items than are currently available the cart cannot be completed and the system advises the user as to which item is currently blocking them from completing the cart.

## System Security

Due to the limited scope of the submission some form of security is added for illustrative purposes (and to not allow unrestrained public access to an API endpoint exposing lambda function calls on my AWS account ☹️). 

Namely all API access is restricted to requests with the correct `x-api-key` header. In reality such an endpoint would be public without the need for the `x-api-key` header on all endpoints. Additionally some endpoints are considered public while others are considered private. For example, endpoints which allow a user to get product information or create a cart are considered public and do not require any additional authentication for access. 

When a user creates a cart, they first provide their username over HTTPS to the system. A secret is then provided to the user. This secret comes in the form of an HMAC with SHA-256 (HS256) signed JSON Web Token (JWT). The username of the user is embedded into the JWT payload and the JWT is signed with a secret and returned to the user. This allows for an additional point of authentication for the user (only a user with the correct JWT token and username in the request can access the specified cart). 

The user then uses this secret in the Authorization header of their requests to more sensitive endpoints which modify, complete or show info about their cart.

### Future Improvements

In reality, in such a system the single point of failure for the JWT tokens would be the secret, should this secret be obtained by a potential attacker, new JWT's can be forged by the attacker allowing them to access any user's cart, additionally the generated tokens do not have an expiry, allowing an attacker to use them endlessly. 

A much better system would require users to specify a password for their account, which is then salted and securely hashed and stored into the database. A login endpoint can be provided which provides the user with an encrypted JWT token upon successful login. This encrypted JWT token would have the user's username and their abilities as it's payload and would also have a set token lifetime, once the JWT is expired the user would have to re-login in order to obtain a new secret to access the API. The user would provide the encrypted JWT to the system via the Authorization header of their requests, where the system would then decrypt the JWT and validate it.

*Additionally due to the limited scope of this submission, the system's secrets were stored as a `secrets.json` file on the version control, however this is **BAD** practice. In reality secrets should be stored in a secure secrets store, in this case (as the application is a serverless one hosted on AWS), this would ideally be AWS SSM Parameter Store or AWS Secrets Manager, however this was not done as it would unnecessarily increase the complexity and scope of the submission.*

## Testing
The [Newman framework](https://github.com/postmanlabs/newman) was chosen for running automated tests on the system. These tests were generated using [Postman](https://www.getpostman.com). This was done mainly due to the limited scope of the project and the ease of implementation of the Postman tests. This also allows interviewers to easily test the application using the Postman tests.

### Future Improvements

In reality, tests would be done using the Mocha/Chai testing frameworks and run both on an emulated "offline" version of the system and directly on the serverless system. These tests would ideally be performed by a CI/CD system on every deployment. The choice of a NodeJS testing framework such as Mocha over the Postman implementation is that, although it would take longer to set the tests up (as compared to Postman), system tests would be much more flexible. Whereas Postman tests would need to be edited through the Postman GUI and re-exported, a testing framework would use NodeJS code which can be much more easily modified and stored in version control.