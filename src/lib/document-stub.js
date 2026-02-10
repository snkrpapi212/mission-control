// Stub to prevent next/document from crashing client-side prerender
// next/document should only be used in pages/_document.tsx (Pages Router)
// In App Router, it should never be imported, but some deps may reference it
module.exports = {};
module.exports.Html = () => null;
module.exports.Head = () => null;
module.exports.Main = () => null;
module.exports.NextScript = () => null;
module.exports.default = {};
