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
          dsEventId: this.getCurrentId(),
          dsEventOn: "dsRouter/navigate",
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
          dsEventId: this.getCurrentId(),
          dsEventOn: "dsRouter/navigate",
          payload: t
        });
      });
    },
    cleanPath(e) {
      return e.toString().trim().toLocaleLowerCase("en-US").replace(/[_,:;]/gi, "-").replace(/\s+/g, "-").replace(/[+]/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-");
    },
    _update(e, t, n = () => {
    }) {
      const s = {
        nextPath: t,
        prevPath: e,
        nextId: this.items[t],
        prevId: this.items[e]
      };
      this.currentPath = this.currentPathname(), s.nextId ? n(s) : this.$action(
        "dsPage/getOneByPath",
        {
          dsPagePath: this.cleanPath(t)
        },
        {
          onSuccess: (a) => {
            s.nextId = a.id, this.$method("dsPage/set", a), n(s);
          }
        }
      );
    }
  }
};
export {
  r as default
};
