# instabul-v2

Back-end service for the HyperNova project (re-write)

## Endpoints

```
User Login
POST /api/user/login
{
	"username": "example@example.com",
	"password": "password123!@#"
}

User Registration
POST /api/user/register
{
	"username": "exampleuser13",
	"name": "Example User",
	"email": "example@example.com",
	"password": "password123!@#"
}

Fetch data for the logged in user | Needs Auth
GET /api/user/data

Fetch data for a user specified by id
GET /api/user/data/:id

Update user data for logged in user | Needs Auth
PATCH /api/user/data
{
	"name": "Example Name"
}

Fetch all posts | Needs Auth
GET /api/posts/all?page=<int>&limit=<int>

Fetch posts that match the user's tags | Needs Auth
GET /api/posts/matching?page=<int>&limit=<int>

Create post | Needs Auth
POST /api/posts/create
{
	"title": "Example Title",
	"description": "Listing description",
	"price": 100.00,
	"tags": "tag1,tag2,tag3"
}

Update post by id
PATCH /api/posts/update/:id
{
    "title": "Changed Title"
}

Delete post by id
DELETE /api/posts/delete/:id
```
