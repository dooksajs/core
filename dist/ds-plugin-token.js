const c = {
  name: "dsToken",
  version: 1,
  data: {
    process: {},
    values: {
      heading: {
        default: "Add title"
      }
    }
  },
  tokens: {
    empty() {
      return "";
    },
    placeholder(n) {
      const s = this.$method("dsMetadata/getLang"), e = this.values[n[2]];
      return e[s] ? e[s] : e.default;
    }
  },
  methods: {
    textContent(n, { instanceId: s, text: e, updateText: o }) {
      let a = 0;
      (!this.process[s] || this.process[s].tokens !== e) && (this.process[s] = {
        list: {},
        text: e,
        tokens: e
      });
      const l = this.process[s];
      for (let i = 0; i < l.text.length; i++)
        if (l.text[i] === "[") {
          let t = "";
          for (let h = i + 1; h < l.text.length; h++) {
            const d = l.text[h];
            if (d === "]") {
              let u = 0;
              t.length > 1 && (l.list[a] = {
                id: t,
                processed: !1,
                value: "",
                start: i
              }, u = this._get(
                "values",
                s,
                l,
                a,
                t.split(":"),
                i,
                h + 1,
                o
              ), a++), i = i + u;
              break;
            }
            t += d;
          }
        }
    },
    _get(n, s, e, o, a, l, i, r) {
      const t = e.list[o];
      let h = 0;
      return t.value = this.$token(a[0] + "/" + a[1], a), t.value === void 0 && (t.value = "[" + a.join(":") + "]"), t.value instanceof Promise ? (t.value.then((d) => {
        for (let u = 0; u < o; u++) {
          const f = e.list[u];
          f.processed && (l += f.valueLength);
        }
        this._updateText(e, t, d, l, l, r), t.processed = !0;
      }), this._updateText(e, t, "", l, i, r)) : (this._updateText(e, t, t.value, l, i, r), t.processed = !0, h = t.value.length), h;
    },
    _splice(n, s, e, o = "") {
      return n.slice(0, s) + o + n.slice(e);
    },
    _updateText(n, s, e, o, a, l) {
      s.valueLength = e.length, n.text = this._splice(n.text, o, a, e), l(n.text);
    }
  }
};
export {
  c as default
};
