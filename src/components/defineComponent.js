"use strict";
/* jshint newcap:false */

var BaseState = require("./State");
var BaseComponent = require("./Component");
var inherit = require("raptor-util/inherit");
var mobx = require("mobx");
module.exports = function defineComponent(def, renderer) {
    if (def.___isComponent) {
        return def;
    }

    var ComponentClass = function() {};
    var proto;

    var type = typeof def;

    if (type == "function") {
        proto = def.prototype;
    } else if (type == "object") {
        proto = def;
    } else {
        throw TypeError();
    }

    ComponentClass.prototype = proto;

    if (proto.mobxObservable) {
        let MODE_STATE_CHANGE = "state-change";
        let MODE_FORCE_UPDATE = "force-update";
        let MODE_FORCE_UPDATE_UPDATE = "force-update-update";
        let UPDATE_MODE = MODE_STATE_CHANGE;

        let onDestroy = proto.onDestroy;
        proto.onDestroy = function() {
            this.$mobx && this.$mobx.dispose();
            delete this.$mobx;
            if (onDestroy) onDestroy.apply(this, arguments);
        };
        let onCreate = proto.onCreate;
        proto.onCreate = function() {
            // if (this.mobxObservable())
            // console.log("mobxObservable", this.mobxObservable());

            this.$mobx = new mobx.Reaction("reaction-" + this.id, () => {
                // let o = this.mobxObservable();
                // if (o) console.log("mobxObservable-forceUpdate", this);
                // if (o == "debugger") debugger;

                if (UPDATE_MODE == MODE_STATE_CHANGE) {
                    this.state.___mobx++;
                } else if (UPDATE_MODE == MODE_FORCE_UPDATE) {
                    this.forceUpdate();
                } else if (UPDATE_MODE == MODE_FORCE_UPDATE_UPDATE) {
                    this.forceUpdate();
                    this.update();
                }
            });

            if (onCreate) {
                onCreate.apply(this, arguments);
            }

            if (UPDATE_MODE == MODE_STATE_CHANGE) {
                if (!this.state) {
                    this.state = {
                        ___mobx: 0
                    };
                } else {
                    this.state.___set("___mobx", 0, true, false);
                }
            }
        };
        proto.___mobx_render = function(renderFunc) {
            this.$mobx.track(() => {
                mobx._allowStateChanges(false, () => {
                    renderFunc();
                });
            });
        };
    }
    // We don't use the constructor provided by the user
    // since we don't invoke their constructor until
    // we have had a chance to do our own initialization.
    // Instead, we store their constructor in the "initComponent"
    // property and that method gets called later inside
    // init-components-browser.js
    function Component(id) {
        BaseComponent.call(this, id);
    }

    if (!proto.___isComponent) {
        // Inherit from Component if they didn't already
        inherit(ComponentClass, BaseComponent);
    }

    // The same prototype will be used by our constructor after
    // we he have set up the prototype chain using the inherit function
    proto = Component.prototype = ComponentClass.prototype;

    // proto.constructor = def.constructor = Component;

    // Set a flag on the constructor function to make it clear this is
    // a component so that we can short-circuit this work later
    Component.___isComponent = true;

    function State(component) {
        BaseState.call(this, component);
    }
    inherit(State, BaseState);
    proto.___State = State;
    proto.___renderer = renderer;

    return Component;
};
