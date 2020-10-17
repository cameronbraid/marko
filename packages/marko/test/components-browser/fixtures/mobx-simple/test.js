var expect = require("chai").expect;

module.exports = function(helpers) {
  var app = helpers.mount(require.resolve("./index"), {});
  var countEl = app.getEl("count");
  expect(countEl.innerHTML).to.equal("0");

  app.increment();
  app.update();

  expect(countEl.innerHTML).to.equal("1");
};
