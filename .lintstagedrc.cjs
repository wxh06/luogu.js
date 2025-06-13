const eslint = "eslint --fix";
const prettier = "prettier --write";

module.exports = {
  "*.{js,mjs,cjs,ts}": [eslint, prettier],
  "*.{md,json,yml,yaml}": [prettier],
};
