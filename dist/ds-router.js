const r = {
  name: "dsRouter",
  version: 1,
  dependencies: [
    {
      name: "dsEvent",
      version: 1
    }
  ],
  data: {
    currentPath: "",
    state: {},
    searchParams: !1,
    items: {}
  },
  setup() {
    this.currentPath = this.currentPathname(), window.addEventListener("popstate", (e) => {
      this._update(this.currentPath, this.currentPathname(), (t) => {
        this.$method("dsPage/updateDOM", t), this.$action("dsEvent/emit", {
          id: this.name,
          name: "navigate",
          payload: t
        });
      });
    });
  },
  methods: {
    getCurrentId() {
      const e = this.currentPathname();
      return this.items[e];
    },
    currentPathname() {
      return window.location.pathname;
    },
    setPath({ pageId: e, path: t }) {
      this.items[t] = e;
    },
    navigate(e) {
      this._update(this.currentPathname(), e, (t) => {
        window.history.pushState(t, "", e), this.currentPath = this.currentPathname(), this.$method("dsPage/updateDOM", t), this.$action("dsEvent/emit", {
          id: this.name,
          name: "navigate",
          payload: t
        });
      });
    },
    cleanPath(e) {
      return e.toString().trim().toLocaleLowerCase("en-US").replace(/[_,:;]/gi, "-").replace(/\s+/g, "-").replace(/[+]/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-");
    },
    _update(e, t, n = () => {
    }) {
      const a = {
        nextPath: t,
        prevPath: e,
        nextId: this.items[t],
        prevId: this.items[e]
      };
      if (this.currentPath = this.currentPathname(), a.nextId)
        n(a);
      else {
        const i = this.cleanPath(t);
        this.$action("dsPage/getOneByPath", { path: i }, {
          onSuccess: (s) => {
            a.nextId = s.id, this.$method("dsPage/set", s), n(a);
          }
        });
      }
    }
  }
};
export {
  r as default
};
