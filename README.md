# Cat REST API

## Description

REST API to perform CRUD operations on a DB of Cat Images

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## Swagger Docs

To see Swagger docs open this [URL](https://localhost:3000/api)

## CRUD Operation Documentation
#### *ADD NEW IMAGE(POST)*
&nbsp; &nbsp; &nbsp; &nbsp; The Add New Image operation is on the default route of '/cats' and takes a *jpeg* file as input, returning an ***Cat*** object with the *Id* and *path* properties.

&nbsp; &nbsp; &nbsp; &nbsp; We shall use this *Id* for all operations needing it for the request.

#### *DOWNLOAD ALL IMAGES(GET)*
&nbsp; &nbsp; &nbsp; &nbsp; The Download All Images operation is on the route '/downloadAll', returning a zip file containing all the images currently in the DB that downloads to the users system on API response.

#### *LIST ALL CATS(GET)*
&nbsp; &nbsp; &nbsp; &nbsp; The List ALl Cats opeation is on the route '/listAll', returning a *JSON* array containing all the ***Cat*** objects in the DB (as defined in the **POST** Operation).

#### *GET IMAGE BY ID(GET)*
&nbsp; &nbsp; &nbsp; &nbsp; The Get Image By Id operation is on the route '/cats/{id}' and takes an *Id* path param as input, returning the file corresponding to the *Id* from the DB to be downloaded on the users system.

#### *REPLACE IMAGE(PUT)*
&nbsp; &nbsp; &nbsp; &nbsp; The Replace Image operation is on the route '/cats/{id}' and takes a *jpeg* file and an *Id* as input, replacing the image with the given *Id* by the new image provided as the input file.

&nbsp; &nbsp; &nbsp; &nbsp; The ***Cat*** object of the new image is returned as the response. Note: The *Id* remains the same, only the path changes as per [RFC-6902](https://datatracker.ietf.org/doc/html/rfc6902#section-4.3)

#### *DELTE IMAGE(DELTE)*
&nbsp; &nbsp; &nbsp; &nbsp; The Delete Image operation is on the route of '/cats/{id}' and takes an *Id* path param, deleting the image from the DB and returning a ```204 - NO CONTENT``` status code.
