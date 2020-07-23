module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
    commonjs: true,
    es6: true,
    jquery: true,
  },
  extends: ["eslint:recommended", "prettier"],
  plugins: ["prettier", "jquery"],
  parserOptions: {
    ecmaVersion: 11,
    sourceType: "module",
  },
  rules: {
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "array-callback-return": "error",
    camelcase: "error",
    curly: "error",
    "dot-notation": "error",
    eqeqeq: "error",
    "implicit-arrow-linebreak": ["error", "beside"],
    "no-duplicate-case": "error",
    "no-else-return": "error",
    "no-empty": "error",
    "no-empty-function": "error",
    "no-extra-semi": "error",
    "no-func-assign": "error",
    "no-irregular-whitespace": "error",
    "no-multi-spaces": "error",
    "no-unreachable": "error",
    "no-unused-vars": "error",
    "no-var": "error",
    "prefer-arrow-callback": "error",
    "prefer-const": "error",
    "prettier/prettier": "error",
    "vars-on-top": "error",
    yoda: "error",
  },
};
