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
    this.currentPath = this.currentPathname(), window.addEventListener("popstate", (a) => {
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
      const a = this.currentPathname();
      return this.items[a];
    },
    currentPathname() {
      return window.location.pathname;
    },
    setPath(a, { pageId: t, path: e }) {
      this.items[e] = t;
    },
    navigate(a, t) {
      this._update(this.currentPathname(), t, (e) => {
        window.history.pushState(e, "", t), this.currentPath = this.currentPathname(), this.$method("dsPage/updateDOM", e), this.$action("dsEvent/emit", {
          id: this.name,
          name: "navigate",
          payload: e
        });
      });
    },
    cleanPath(a, t) {
      return t.toString().trim().toLocaleLowerCase("en-US").replace(/[_,:;]/gi, "-").replace(/\s+/g, "-").replace(/[+]/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-");
    },
    _update(a, t, e = () => {
    }) {
      const n = {
        nextPath: t,
        prevPath: a,
        nextId: this.items[t],
        prevId: this.items[a]
      };
      if (this.currentPath = this.currentPathname(), n.nextId)
        e(n);
      else {
        const i = this.cleanPath({}, t);
        this.$action("dsPage/getOneByPath", { path: i }, {
          onSuccess: (s) => {
            n.nextId = s.id, this.$method("dsPage/set", s), e(n);
          }
        });
      }
    }
  }
};
export {
  r as default
};
