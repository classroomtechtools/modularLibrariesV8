# FormatLogger.gs

Make templated strings and log output with apps scripting a cinch.

## FormatLogger.gs Quickstart

Copy and paste the code, initialize so that it is live. This augments the String.prototype and Object.prototype, and adds `__log__` to the global scope.

```js
Import.FormatLogger.init();
const greeting = 'Hello';
const noun = 'World';
__log__`${greeting}, ${noun}.`
```

outputs:

```
Hello, World.
```

Use `__log__` to quickly output to console.log. If you want to include type info and better formating:

```js
const example = [
{
  greeting: 'Hello',
  noun: 'World'
},{
  greeting: '你好',
  noun: '世界'
}
];
FormatLogger.init();
__log__`${example.__pprint__}`;
```

ouptuts

```
<[
    {
        "greeting": "Hello",
        "noun": "World"
    },
    {
        "greeting": "你好",
        "noun": "世界"
    }
]> (Array)
```

If you remove FormatLogger.init() from the code, __log__ will raise error, allowing the developer to ensure all such unneeded "print" statements are removed from production code.

There are additional features, outlined below:


```js
FormatLogger.init();
var obj = {verb: 'Hello', noun: 'World'};
var arr = ['hello', 'world'];
var helloWorld = "{verb}, {noun}".format(obj);
obj.__print__;
obj.__pprint__;  // pretty print with whitespace
arr.__pprint__;
```

The output (minus log info):

```
<{"verb":"Hello","noun":"World"}> (Object)
<{
    "verb": "Hello",
    "noun": "World"
}> (Object)
<[
    "hello",
    "world"
]> (Array)
```

A more versatile method is also available, `__log__` that allows you to combine objects, and even reference properties:

```js
"{0.print}\n{1.print}".__log__(obj);
"{0.typeof_} of length {0.length}".__log__(arr);
```

Output:

```
<{"verb":"Hello","noun":"World"}> (Object)
<["hello","world"]> (Array)
Array of length 2
```

Under the hood all this is implemented with `String.prototype.format`, which works like so:

```js
"{hello}, {world}".__format__({hello:'hello', world:'world'});
```


## Motivation

There is a certain premium on being able to log output and reason about one's own code. Stackdriver logging is a massive improvement for the stack in so many ways, but for this individual sitting behind the keyboard there is nothing like having fast ways to do two things:

1. Templated strings
2. Output templated strings and objects to an instant log

It is intended that this library may well be removed from the final product, or even well before that; this is why all the methods have double underlines: It makes them easy to find for removal.

