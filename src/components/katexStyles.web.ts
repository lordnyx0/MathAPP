// Web: bundle the KaTeX stylesheet (and its fonts) locally via Metro's CSS
// support instead of fetching it from a CDN at runtime. This keeps formula
// rendering working offline and pins the CSS to the installed katex version.
import 'katex/dist/katex.min.css';

export {};
