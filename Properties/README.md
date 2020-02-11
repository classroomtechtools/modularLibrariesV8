# Properties

Makes using `PropertyServices` in Google Apps Scripting a cinch. Can handle objects and includes serialization and deseralization techniques for dates. 

Unit tests have all the gory details.

## Motivation

The `PropertyServices` is one of easiest and best ways to maintain persistent state, such as application state or user preferences. Why not make it even easier?

## Quickstart

Copy the code into you project, use it:

```js
// initialize available stores, with sensible default values
const lib = Properties.scriptStore();  // or
const lib = Properties.userStore();  // or
const lib = Properites.documentStore();

// set keys to values of any kind, including nested objects with dates!
lib.set('key', 564);
lib.set('obj', {nested: [1, 2, new Date(), 400.2, {hi='hi'}]});

// retrieve values with get
const value = lib.get('obj')
value.nested[4].hi;  // 'hi'

// retrieve keys with getKeys
const keys = lib.getKeys();  // array

// bulk update
lib.setProperties({
    key: 0,
    obj: {}
});

// remove keys
lib.remove('key');  // just the one
lib.removeAll();  // all of them

// get everything
// (possibly very slow: goes through each key and stores onto new object)
const props = lib.getAll();  // returns key value object
```

## Features

It works by serializing all objects. If you want to turn if off, because you just want the plain strings stored and don't want the performance penalty of converting them, initialize like this:

```js
const lib = Properties.scriptStore({jsons: false});
lib.set('key', 'just a string, thanks');
```

It also ensures that dates are stored and retrieved correctly, implemented by a `replacer` and `reviver` function passed to `JSON.stringify` and `JSON.parse`, respectively. This feature can also exact a not insignicant performance, so if the dev knows there will be dates, can turn it off.

```js
const lib = Properties.scriptStore({jsons: true, dates: false});
```

But initing the library like this is nonsensical and will throw an error:

```js
const lib = Properties.scriptStore({jsons: false, dates: true});
```

## Serializer

Internally it uses a simple utility to ensure that dates are stored and retrieved properly, including timestamp info. It's also exposed via `utils` property:

```js
const date = new Date();
const string = Properties.utils.serializer(date);
const result = Properties.utils.deserializer(date);
date.getTime() == result.getTime();  // true
```

If you using the serializer for convenience, but don't want the performance penalty of maintaining correct dates (because you know there aren't any dates), the second parameter can be set to false.

```js
Properties.utils.serializer({obj:'some value'}, false);
```

## Unit Tests

To run them yourself, copy the code in this repo `UnitTests/UnitTesting.js` and add to project. Also add `Properties/PropertiesUnitTests.js` and then run `test_Properties` function. Logger output:

```
initializaion via static methods
	✔ initialize via three modes: script, user, and document stores
	✔ initing with date: false stores dates as ISO strings
	✔ initing with jsons: false but dates: true throws error
	✔ utils.serialize and utils.deseralize persists dates correctly with defaults

getting and setting values
	✔ get and set persists jsons by default
	✔ get and set persists strings with jsons = false
	✔ trying to persist non-strings with jsons = false throws error
	✔ .setProperties with an nested object with nested arrays, primitives, objects, and dates, and persists

```