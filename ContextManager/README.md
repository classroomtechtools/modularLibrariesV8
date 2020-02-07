# ContextManager

Have some piece of code execute when entering a code block, execute the code block, and have another piece of code execute when exiting the block. Refer to state with `this` throughout the whole context.

Optionally swallow errors if they occur.

## Getting Started

Copy and paste the code to your project. Use it.

The following silly example illustrates how `this` holds state throughout each of the functions:

```js
function myFunction () {
    // initialize
    let ctx = new ContextManager();
    
    // save an array to state
    ctx.enter = function () {
        this.noun = "World";
        this.log = [];
    };
    
    // output the array to the logger
    ctx.exit = function () {
        Logger.log(this.log.join('\n'));
    };
    
    // execute the main body, enter and exit will be called
    ctx.with(function () {
        this.log.push(`Hello ${this.noun}`);
    });
    
    // Logger outputs "Hello World"
}
```

By default, `this` is just a regular object. If you want it to be something else, then subclass:

```js
function myFunction () {
  class MyManager extends ContextManager {
    defaultObject () {
      return {log:[]};  // `this` is now an object with log array already
    }
  }

  let ctx = new MyManager();

  ctx.enter = function () { 
    this.log.push('entering');
  };
  ctx.exit = function () { 
    this.log.push('exiting');
    Logger.log(this.log.join('\n'));
  };
  ctx.error = function () { 
    this.log.push('See no error, hear no error');
    return null;  // return null swallows the error
  };   
  ctx.param = "World";

  ctx.with(function (text) {
    this.log.push('Inside body');
    throw Error("Error here, but does not actually error out");	
  });
}
```

Output:

```
entering
Inside body
See no error, hear no error
exiting
```

## Movitation

Context managers are a concept in Python that is really quite useful. In my case, I use them to implement unit testing, as a unit test may possibly fail, but we want the code to continue executing.

