var expect = require("chai").expect;

const Store = require("./store").Store;

module.exports = function(helpers) {
    var app = helpers.mount(require.resolve("./index"), {});

    var viewOne = window.viewOne;
    var viewTwo = window.viewTwo;

    function update() {
        app.update();
        viewOne.update();
        viewTwo.update();
    }

    expect(app.renderCount).to.equal(1);
    expect(viewOne.renderCount).to.equal(1);
    expect(viewTwo.renderCount).to.equal(1);

    Store.increment();
    update();

    expect(app.renderCount).to.equal(2);
    expect(viewOne.renderCount).to.equal(1);
    expect(viewTwo.renderCount).to.equal(1);

    Store.valueOne++;
    update();

    expect(app.renderCount).to.equal(2);
    expect(viewOne.renderCount).to.equal(2);
    expect(viewTwo.renderCount).to.equal(1);

    Store.valueTwo++;
    update();

    expect(app.renderCount).to.equal(2);
    expect(viewOne.renderCount).to.equal(2);
    expect(viewTwo.renderCount).to.equal(2);
};
