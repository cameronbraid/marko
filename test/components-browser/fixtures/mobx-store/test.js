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

    function snapshot() {
        return {
            appRenderCount: app.renderCount,
            appCountHtml: app.getEl("count").innerHTML,
            viewOneRenderCount: viewOne.renderCount,
            viewOneValueHtml: viewOne.getEl("value").innerHTML,
            viewTwoRenderCount: viewTwo.renderCount,
            viewTwoValueHtml: viewTwo.getEl("value").innerHTML
        };
    }

    expect(snapshot()).to.eql({
        appRenderCount: 1,
        appCountHtml: "0",
        viewOneRenderCount: 1,
        viewOneValueHtml: "0",
        viewTwoRenderCount: 1,
        viewTwoValueHtml: "0"
    });

    Store.increment();
    update();

    expect(snapshot()).to.eql({
        appRenderCount: 2,
        appCountHtml: "1",
        viewOneRenderCount: 1,
        viewOneValueHtml: "0",
        viewTwoRenderCount: 1,
        viewTwoValueHtml: "0"
    });

    Store.valueOne++;
    update();

    expect(snapshot()).to.eql({
        appRenderCount: 2,
        appCountHtml: "1",
        viewOneRenderCount: 2,
        viewOneValueHtml: "1",
        viewTwoRenderCount: 1,
        viewTwoValueHtml: "0"
    });

    Store.valueTwo++;
    update();

    expect(snapshot()).to.eql({
        appRenderCount: 2,
        appCountHtml: "1",
        viewOneRenderCount: 2,
        viewOneValueHtml: "1",
        viewTwoRenderCount: 2,
        viewTwoValueHtml: "1"
    });
};
