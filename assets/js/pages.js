window.Pages = {

    stack: ["#unsupported-device"],

    set: function(from, to) {
        q(to).classList.remove("hidden");
        q(from).classList.add("hidden");
    },

    push: function(name) {
        // Don't push duplicate pages
        if (this.stack.indexOf(name) === this.stack.length - 1) { return; }

        this.stack.push(name);
        this.set(this.stack[this.stack.length - 2], name);
    },

    back: function(only) {
        // Only pop some pages
        if (only !== undefined && only !== this.stack[this.stack.length - 1]) {
            return false;
        }

        var current = this.stack.pop();
        this.set(current, this.stack[this.stack.length - 1]);
        return true;
    },

};