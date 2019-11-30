var mobx;

function defineComponent(proto) {
    /**
     * little hack to allow components to be annotated
     *
     * TODO see if we can use a custom tag like mobx {} and access this information from here
     *
     * for now, just add the following to a component class to make it react to mobx state changes
     *
     * class {
     *   mobxObservable(){}
     * }
     *
     */
    if (proto.mobxObservable) {
        // only require mobx when its used
        if (!mobx) mobx = require("mobx");

        // trying to work out the most reliale way of forcing an update, so far state-change is the preference
        // it just introduces a ___mobx property into the component state, or creates the state if not defined
        // TODO need to consider serilisation for when used on a server rendered component
        var MODE_STATE_CHANGE = "state-change";

        // force-update seems to miss some updates, requiring a update() call to get it on track
        var MODE_FORCE_UPDATE = "force-update";

        // calling forceUpdate(); update() is updat()-ing more times than necessary
        var MODE_FORCE_UPDATE_UPDATE = "force-update-update";

        var UPDATE_MODE = MODE_STATE_CHANGE;
        if (UPDATE_MODE == MODE_STATE_CHANGE) {
            proto.___mobx_mark_dirty = function() {
                this.state.___mobx++;
            };
        } else if (UPDATE_MODE == MODE_FORCE_UPDATE) {
            proto.___mobx_mark_dirty = function() {
                this.forceUpdate();
            };
        } else if (UPDATE_MODE == MODE_FORCE_UPDATE_UPDATE) {
            proto.___mobx_mark_dirty = function() {
                this.forceUpdate();
                this.update();
            };
        }
        var onDestroy = proto.onDestroy;
        proto.onDestroy = function() {
            //console.log("::onDestroy")
            this.___mobx_reaction && this.___mobx_reaction.dispose();
            delete this.___mobx_reaction;
            delete this.___mobx_render; // sometimes a component is re-rendered after being disposed, so fall back to the normal render method in this case
            if (onDestroy) onDestroy.apply(this, arguments);
        };
        var onCreate = proto.onCreate;
        proto.onCreate = function() {
            this.___mobx_init();

            if (onCreate) onCreate.apply(this, arguments);

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

        proto.___mobx_init = function() {
            if (this.___mobx_reaction) return false;
            // if (this.mobxObservable())console.log("mobxObservable", this.mobxObservable());
            this.___mobx_reaction = new mobx.Reaction(
                this.___type, // string identifier for the reaction
                this.___mobx_mark_dirty.bind(this) // mark the component as dirty when any tracked observable changes
            );
            return true;
        };

        // hook which renderer.js calls
        // call the renderFunc within the recation so that mobx can track any observable accessed during rendering
        proto.___mobx_render = function(renderFunc) {
            this.___mobx_reaction.track(() => {
                mobx._allowStateChanges(false, renderFunc);
            });
        };
    }
}

function renderComponent(component, renderFunc) {
    if (component.___mobx_render) {
        // delegate the rendering to the component so that it can do it within its mobx.Reaction
        component.___mobx_render(renderFunc);
    } else {
        renderFunc();
    }
}
module.exports = {
    defineComponent: defineComponent,
    renderComponent: renderComponent
};
