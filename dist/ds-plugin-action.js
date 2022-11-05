const _ = {
  name: "dsAction",
  version: 1,
  dependencies: [
    {
      name: "dsParameters",
      version: 1
    }
  ],
  data: {
    actions: {},
    sequence: {},
    conditions: {}
  },
  methods: {
    dispatch(o, { sequenceId: e, payload: s }) {
      const t = this.sequence[e];
      !t || this._dispatch({
        sequenceId: e,
        actions: t.actions,
        conditions: t.conditions || {},
        payload: s
      });
    },
    _getEntryId(o) {
      return o.entry.map((e) => o[e]);
    },
    set(o, { actions: e, conditions: s, sequence: t }) {
      e && (this.actions = { ...this.actions, ...e }), s && (this.conditions = { ...this.conditions, ...s }), t && (this.sequence[t.id] = {
        actions: t.actions
      }, t.conditions && (this.sequence[t.id].conditions = t.conditions));
    },
    setConditions(o, e) {
      this.conditions = { ...this.conditions, ...e };
    },
    _dispatch({
      sequenceId: o,
      instance: e = {
        iteration: {},
        results: {}
      },
      parentEntry: s,
      actions: t = {},
      conditions: n = {},
      payload: d,
      results: c = {}
    }) {
      let i = !0;
      e.payload = d, s && (e.results[s] = c), n.length && (i = this._compare(n, {
        parentEntry: s,
        instance: e
      }));
      for (let a = 0; a < t.entry.length; a++) {
        const l = t.entry[a], r = t[l];
        let h = r;
        if (r._$id && (h = this.actions[r._$id]), r.conditions && (i = this._compare(r.conditions, {
          parentEntry: s,
          instance: e
        })), Object.hasOwnProperty.call(h, "when") && i !== h.when)
          return;
        if (Object.hasOwnProperty.call(h, "value"))
          return [h.value];
        const u = {
          onSuccess: null,
          onError: null
        };
        Object.hasOwnProperty.call(r, "onSuccess") && (u.onSuccess = {
          params: {
            parentEntry: l,
            actions: {
              entry: r.onSuccess,
              ...t
            },
            instance: e
          },
          method: this._dispatch.bind(this)
        }), Object.hasOwnProperty.call(r, "onError") && (u.onError = {
          params: {
            parentEntry: l,
            actions: {
              entry: r.onError,
              ...t
            },
            instance: e
          },
          method: this._dispatch.bind(this)
        });
        const p = this._action({
          instance: e,
          entry: l,
          actions: t,
          conditions: r.conditions,
          parentEntry: s,
          name: h.name,
          type: h.type,
          computedParams: h._$computedParams,
          paramType: h.paramType,
          params: h.params,
          callback: u
        });
        p && (c[l] = p);
      }
      return c;
    },
    _createActions(o, e) {
      return { entry: o, ...e };
    },
    _action({
      instance: o,
      name: e,
      type: s,
      computedParams: t,
      paramType: n,
      params: d,
      callback: c = {},
      entry: i,
      parentEntry: a
    }) {
      return t && (d = this.$method("dsParameters/process", {
        instance: o,
        entry: i,
        parentEntry: a,
        paramType: n,
        params: d
      })), this["_process/" + s]({ name: e, params: d, callback: c });
    },
    _onEvent(o, e, s) {
      let t = s;
      e && (t = { ...e, result: s }), o(t);
    },
    _compare(o, { instanceId: e, parentItemId: s, data: t }) {
      let n = !1, d = !1, c = [];
      for (let i = 0; i < o.length; i++) {
        const a = o[i], l = a.name;
        if (l === "&&" || l === "||")
          c = [...c, l], d = !0;
        else {
          const r = [], h = a.values.length - 1;
          for (let p = 0; p < a.values.length; p++) {
            const m = a.values[p];
            let f = m.value;
            Object.hasOwnProperty.call(m, "entry") && (f = this._action({
              instanceId: e,
              entry: m.entry,
              parentItemId: s,
              paramItems: a.params,
              data: t,
              lastItem: h === p,
              ...a.items[m.entry]
            })), r.push(f);
          }
          const u = this.$method("dsOperators/eval", { name: l, values: r });
          c.push(u);
        }
      }
      if (d)
        n = this.$method("dsOperators/compare", c);
      else
        for (let i = 0; i < c.length; i++)
          if (n = !0, !c[i]) {
            n = !1;
            break;
          }
      return n;
    },
    "_process/getProcessValue"({ params: o, callback: e }) {
      const s = e.onSuccess, t = e.onError, n = o;
      return s && this._onEvent(s.method || s, s.params, n), t && this._onEvent(t.method || t, t.params), n;
    },
    "_process/pluginAction"({ name: o, params: e, callback: s }) {
      this.$action(o, e, s);
    },
    "_process/pluginMethod"({ name: o, params: e, callback: s }) {
      const t = s.onSuccess, n = this.$method(o, e);
      t && this._onEvent(t.method || t, t.params, n);
    }
  }
};
export {
  _ as default
};
