# VerboseErrors

Custom errors in the Google AppsScript online editor, made a cinch.

## Tutorial

When you throw an error in the online editor, you get some pretty limited information:

```
// Code.gs:
function error_() {
    throw new Error("Woops");
}
function entrypoint() {
    error_();
}

// Error output:
Error: "Woops" (line 2, file "Code")
```

That's it? Where did the error come from? No stacktrace? Shouldn't it say something like:

```
Error: "Woops" at error_ (Code 2:3) at entrypoint (Code 5:3) (line 2, file "Code")
```

That's more like it. See below for installation instructions. 

But wait there's more. If you check the logs, it's also output there. But wait there's more. What if you want to see variable values at the time of the error, to help you reason about your code?

```
// js:
function error_() {
    const code = 404;
    throw new Error("Woops", {code});
}
function entrypoint() {
    error_();
}

```

Check the logs:

```
Woops    at error_ (Code:3:11)   at entrypoint_here (Code:6:5)
code=404
```

Very cool that you can throw errors and pass it state information at the time of the error.

## Installation

Copy and paste the code into your project. Decide if you want to use it as a drop in replacement. 

```js
const dropInReplacement = true;
```

If it's true, that means that you have to do this when throwing errors (notice the `new` keyword):

```js
throw new Error();
```

If false, then you have to do a bit more typing for it to work as expected:

```js
class CustomError extends VerboseError {}

throw new CustomError(msg)
```

Check out the settings info on line 6:

```js
    constructor(message, {verbose=true, logger=Logger, ...kwargs}={}) {
```

If you have no idea what `constructor` is, nevermind, look at the rest of it. If `verbose` is `true`, it'll output your error info and any state object you pass it `{code}` above (which is actually shorthand for `{code: 404}`. You can change it to `false` there if you don't want that. You can change `logger` to `console` if for some reason you want to use `console.log` instead of `Logger.log`.

If the above is gibberish, nevermind it's not really all that important, just start using it. When you're done debugging, delete the project file.

Start using it. Whenever you throw Errors you will not automatically get the described behaviour in the tutorial. 

## Creating custom errors

If you want to make a custom class such as `CustomError`, no problem, do it like this:

```js
class CustomClass extends Error {}
```

and use it just like any other error:

```js
throw new CustomClass("A custom error!");
```

and voila you have made a custom error but with all the features already baked in (such is the power of classes).

## Notes & miscellaneous

In Rhino, you could throw errors without the `new` keyword:

```js
// Rhino:
throw Error("This is an error thrown without the new keyword");
throw new Error("This is an error thrown without the new keyword");
```

They were equivalent, and it looks like this is true with V8 too. But because VerboseLogger uses classes to implement, you **must** use the `new` keyword. So it's better that you just get used to doing it "the right way," so if you see the following error:

```js
throw Error();  // "Class constructor VerboseError cannot be invoked without 'new'"
```

That's why. Just add the `new` keyword as expected:

```js
throw new Error();  // aaaaah
```
