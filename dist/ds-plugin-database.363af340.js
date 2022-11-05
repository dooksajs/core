const a = {
  name: "dsDatabase",
  version: 1,
  data: {
    client: {}
  },
  setup({ baseUrl: i = "https://no.dooksa.com", lang: n = "en-US" }) {
    return new Promise((o, c) => {
      import("./pocketbase.es.1e837222.604a7e27.js").then(({ default: e }) => {
        this.client = new e(i, n), o();
      }).catch((e) => c(e));
    });
  },
  methods: {
    getList(i, { collection: n, page: o = 1, perPage: c = 25, options: e = {} }) {
      return new Promise((r, t) => {
        this.client.records.getList(n, o, c, e).then((s) => r(s)).catch((s) => t(s));
      });
    },
    getOne(i, { collection: n, id: o, options: c = {} }) {
      return new Promise((e, r) => {
        this.client.records.getOne(n, o, c).then((t) => e(t)).catch((t) => r(t));
      });
    },
    create(i, { collection: n, data: o, options: c = {} }) {
      return new Promise((e, r) => {
        this.client.records.create(n, o, c).then((t) => e(t)).catch((t) => r(t));
      });
    },
    update(i, { collection: n, id: o, data: c }) {
      return new Promise((e, r) => {
        this.client.records.update(n, o, c).then((t) => e(t)).catch((t) => r(t));
      });
    },
    delete(i, { collection: n, id: o }) {
      return new Promise((c, e) => {
        this.client.records.delete(n, o).then(() => c("OK")).catch((r) => e(r));
      });
    }
  }
};
export {
  a as default
};
