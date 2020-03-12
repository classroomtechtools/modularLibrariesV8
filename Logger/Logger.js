/*
 * Drop-in replacement for Logger.log that uses a spreadsheet backend instead.
 * Copyrite Adam Morris classroomtechtools.ctt@gmail.com
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 1) Requires V8 runtime
 2) Copy and paste code into project
 3) When auto is true, Logger.log will go to spreadsheet instead, much quicker
    * optionally set auto to false and use ReplaceLogger()
 4) View the log which will output the url of the spreadsheet created / used
 5) Same spreadsheet is reused on suqsequent runs
 6) If you want to specify which spreadsheet to output logs to, set auto to false and:
    ReplaceLogger(id='<id>');
    Optionally also provide tab name:
    ReplaceLogger(id='<id>', sheet='<sheetname>');

 * Details:
   // Copy and paste code into project. (Why not make it a proper library? Because to make it a drop-in replacement, it needs to have access to the global scope, which a library doesn't have)
   // use Logger.log as normal (when auto is true, else you need call to ReplaceLogger)
   Logger.log('Outputs to spreadsheet');
   // objects passed to Logger.log are pretty printed
   Logger.log({hi: 'hi', arr: ['wow', 234343]});
   // optionally, use Logger and string literals
   const where = 'spreadsheet';
   Logger`this will also output to ${where}`;

 */

(function (__g__) {

  // This will replace Logger. If set to false, you'll have to initialize the library with call to ReplaceLogger()
  const auto = true;
  
  function _getErrorObject(){
    try { throw new Error('fake error') } catch(err) { return err; }
  }
  
  function _getLineNumOfCallee() {
    const err = _getErrorObject();
    const caller_line = err.stack.split("\n")[5];
    const index = caller_line.indexOf("at ");
    return '→ ' + caller_line.slice(index+3, caller_line.length);
  }

  class SS {
    constructor (id=null, sheetName) {
      this.id = id;
      this.sheetName = sheetName;
      this.spreadsheet = null;
      if (this.id === null)
        this.create();
      else
        this.open();
    }

    create() {
      const [rows, cols] = [3, 2];
      this.spreadsheet = SpreadsheetApp.create('Logger', rows, cols);
      this.sheet = this.spreadsheet.getSheetByName(this.sheetName);
      this.id = this.spreadsheet.getId();
      this.sheet.getRange(1, 1, 1, 3).setValues([['Output', 'Date', 'Location']]);
      this.first();
    }

    open() {
      this.spreadsheet = SpreadsheetApp.openById(this.id);
      this.sheet = this.spreadsheet.getSheetByName(this.sheetName);
      this.id = this.spreadsheet.getId();
      this.first();
    }
    
    first () {
      // draw a line whenever we've opened the file
      this.sheet.getRange(2, 1, 1, 3).setBorder(true, null, null, null, null, null, '#000000', SpreadsheetApp.BorderStyle.SOLID);
    }

    prepend(text) {
      // first column of row should contain plaintext, or stringified version of itself
      const cell_a = (function (txt) {
        if (text instanceof String || typeof text === 'string')
          return text;
        else 
          return JSON.stringify(text, null, 4);
      })(text);  

      // second column of row should contain date in easy to read format
      const cell_b = (new Date()).toLocaleString();
      const cell_c = _getLineNumOfCallee();
      
      const data = [ [cell_a, cell_b, cell_c] ];
      
      this.sheet.insertRowsAfter(1, data.length);
      this.sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
    }

    get url () {
      return this.spreadsheet.getUrl();
    }

  }

  let ssObj = null;
  const state = {};

  const __Logger__ = __g__.Logger;

  Logger_ = function (strings, ...values) {
    const text = strings.map( (string, index) => `${string}${values[index] ? values[index] : ''}` );
    ssObj.prepend(text.join(''));
  };
  Logger_.log = function (text) {
    ssObj.prepend(text);
  };

  __g__.ReplaceLogger = function (id=null, sheet='Sheet1') {
    [state.id, state.sheet] = [id, sheet];

    if (state.id === null) {
      // pull in from properties, if avialable, remains null if not
      const props = PropertiesService.getUserProperties();
      state.id = props.getProperty('__getLogger__.id');
    }

    // either opens existing or creates new
    ssObj = new SS(state.id, state.sheet);

    if (state.id === null) {
      state.id = ssObj.id;
      const props = PropertiesService.getUserProperties();
      props.setProperty('__getLogger__.id', state.id);
    }

    // Output with link
    Logger.log("Find logs at the following url:");
    Logger.log(`\n${ssObj.url}\n`);
    __g__.Logger = Logger_;
  };

  __g__.UnreplaceLogger = function () {
    __g__.Logger = __Logger__;
  };

  if (auto) ReplaceLogger();
})(this);
