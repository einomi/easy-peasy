import { createStore, Thunk, thunk, Action } from 'easy-peasy';

interface Injections {
  fetch: () => Promise<void>;
}

interface AuditModel {
  logs: string[];
  log: Thunk<AuditModel, string, Injections, StoreModel, Promise<number>>;
  empty: Thunk<AuditModel>;
  syncThunk: Thunk<AuditModel, undefined, undefined, StoreModel, string>;
  optionalPayloadThunk: Thunk<AuditModel, string | void>;
}

interface StoreModel {
  audit: AuditModel;
}

const model: StoreModel = {
  audit: {
    logs: [],
    log: thunk(
      async (
        actions,
        payload,
        {
          injections,
          getState,
          getStoreActions,
          getStoreState,
          dispatch,
          meta,
        },
      ) => {
        actions.log(payload);
        getState().logs.length;
        getStoreState().audit.logs.length;
        injections.fetch().then(() => 'done');
        dispatch({ type: 'FOO' });
        getStoreActions().audit.log('foo');
        meta.parent.concat(['foo']);
        meta.path.concat(['foo']);
        return 1;
      },
    ),
    syncThunk: thunk((actions, payload) => {
      return 'Woot!';
    }),
    empty: thunk(() => {}),
    optionalPayloadThunk: thunk((actions, payload) => {
      if (payload == null) {
        return;
      }
      const foo = payload.substr(0, 3);
    }),
  },
};

const store = createStore(model);

store.getActions().audit.optionalPayloadThunk();
store.getActions().audit.optionalPayloadThunk('foo');
// typings:expect-error
store.getActions().audit.optionalPayloadThunk(1);
store.getActions().audit.syncThunk().toUpperCase();
store
  .getActions()
  .audit.log('foo')
  .then((result) => result + 1);
// typings:expect-error
store.getActions().audit.log(1);
// typings:expect-error
store.getActions().audit.log();

store.getActions().audit.empty();
// typings:expect-error
store.getActions().audit.empty('foo');
