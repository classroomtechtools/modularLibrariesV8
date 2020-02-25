(function (__g__) {

  // If true, this will make throw new Error() verbose powers:
  const dropInReplacement = true;

  class VerboseError extends Error {
    constructor(message, {verbose=true, logger=Logger, ...kwargs}={}) {
      // allow the parent class to do its thang
      super(message);

      // display the name of the class in the error message
      this.name = this.constructor.name;

      // modify the error message to display class name, hyphen, then message
      // PLUS the stacktrace (so, so useful)
      this.message += this.stack.split('\n').slice(1, -1).join('\n');

      verbose && logger.log(this.message);
      // output to the logger any extra info relevant to understanding what's happening at that point in code
      for (let keyword in kwargs) {
        verbose && logger.log(`${keyword}=${kwargs[keyword]}`);
      }
    }
  }

  if (dropInReplacement) __g__.Error = VerboseError;
  else __g__.VerboseError = VerboseError;

})(this);

