import { fromRollup } from '@web/dev-server-rollup';
import rollupCommonjs from '@rollup/plugin-commonjs';
import rollupBuiltins from 'rollup-plugin-node-builtins';
import rollupGlobals from 'rollup-plugin-node-globals';
import rollupReplace from '@rollup/plugin-replace';

const replace = fromRollup(rollupReplace);
const builtins = fromRollup(rollupBuiltins);
const globals = fromRollup(rollupGlobals);
const commonjs = fromRollup(rollupCommonjs);

const HC_PORT = process.env.HC_PORT || 8888;

export const plugins = [
  replace({
    global: 'window',
    'process.env.NODE_ENV': '"production"',
    'process.env.HC_PORT': JSON.stringify(HC_PORT),
  }),
  builtins(),
  commonjs({}),
  globals(),
];
