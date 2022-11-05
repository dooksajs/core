const a = {
  name: "dsDatabase",
  version: 1,
  data: {
    client: {}
  },
  setup({ baseUrl: o = "https://no.dooksa.com", lang: n = "en-US" }) {
    return new Promise((c, r) => {
      import("./pocketbase.es.1e837222.js").then(({ default: e }) => {
        this.client = new e(o, n), c();
      }).catch((e) => r(e));
    });
  },
  methods: {
    getList(o, { collection: n, page: c = 1, perPage: r = 25, options: e = {} }) {
      return new Promise((s, t) => {
        this.client.records.getList(n, c, r, e).then((i) => s(i)).catch((i) => t(i));
      });
    },
    getOne(o, { collection: n, id: c, options: r = {} }) {
      return new Promise((e, s) => {
        this.client.records.getOne(n, c, r).then((t) => e(t)).catch((t) => s(t));
      });
    },
    create(o, { collection: n, data: c, options: r = {} }) {
      return new Promise((e, s) => {
        this.client.records.create(n, c, r).then((t) => e(t)).catch((t) => s(t));
      });
    },
    update(o, { collection: n, id: c, data: r }) {
      return new Promise((e, s) => {
        this.client.records.update(n, c, r).then((t) => e(t)).catch((t) => s(t));
      });
    },
    delete(o, { collection: n, id: c }) {
      return new Promise((r, e) => {
        this.client.records.delete(n, c).then(() => r("OK")).catch((s) => e(s));
      });
    }
  }
};
export {
  a as default
};
