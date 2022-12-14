const g = {
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
    placeholder(s) {
      const n = this.$method("dsMetadata/getLang"), t = this.values[s[2]];
      return t[n] ? t[n] : t.default;
    }
  },
  methods: {
    textContent({ instanceId: s, text: n, updateText: t }) {
      let a = 0;
      (!this.process[s] || this.process[s].tokens !== n) && (this.process[s] = {
        list: {},
        text: n,
        tokens: n
      });
      const i = this.process[s];
      for (let l = 0; l < i.text.length; l++)
        if (i.text[l] === "[") {
          let o = "";
          for (let e = l + 1; e < i.text.length; e++) {
            const h = i.text[e];
            if (h === "]") {
              let u = 0;
              o.length > 1 && (i.list[a] = {
                id: o,
                processed: !1,
                value: "",
                start: l
              }, u = this._get(
                "values",
                s,
                i,
                a,
                o.split(":"),
                l,
                e + 1,
                t
              ), a++), l = l + u;
              break;
            }
            o += h;
          }
        }
    },
    _get(s, n, t, a, i, l, r, o) {
      const e = t.list[a];
      let h = 0;
      return e.value = this.$token(i[0] + "/" + i[1], i), e.value === void 0 && (e.value = "[" + i.join(":") + "]"), e.value instanceof Promise ? (e.value.then((u) => {
        for (let d = 0; d < a; d++) {
          const f = t.list[d];
          f.processed && (l += f.valueLength);
        }
        this._updateText(t, e, u, l, l, o), e.processed = !0;
      }), this._updateText(t, e, "", l, r, o)) : (this._updateText(t, e, e.value, l, r, o), e.processed = !0, h = e.value.toString().length), h;
    },
    _splice(s, n, t, a = "") {
      return s.slice(0, n) + a + s.slice(t);
    },
    _updateText(s, n, t, a, i, l) {
      n.valueLength = t.toString().length, s.text = this._splice(s.text, a, i, t), l(s.text);
    }
  }
};
export {
  g as default
};
