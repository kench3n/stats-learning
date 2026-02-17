/*
Skeleton for scripts/stats_hub.js
Source prompt: codex_prompts/codex_prompt_P.md
Generated scaffold only. Merge into the real file intentionally.
*/

'use strict';

// Prompt sections mapped to this file:
// - 1a: Add Unit Metadata
// - 1c: Add Visualizer
// - 1d: Add Formulas

// TODO: add required function stubs for this prompt.

// Reference snippets from prompt

/* Snippet 1 | heading: 1a: Add Unit Metadata | lang: javascript
// Add to UNIT_META:
12:{name:'ANOVA'}
*/

/* Snippet 2 | heading: 1c: Add Visualizer | lang: javascript
// Add to allViz:
12:{tabs:['anova'],draw:drawAnova}
*/

/* Snippet 3 | heading: 1d: Add Formulas | lang: javascript
// Add to FORMULAS:
12:[
  {name:'SSB',formula:'Σnⱼ(x̄ⱼ − x̄)²'},
  {name:'SSW',formula:'ΣΣ(xᵢⱼ − x̄ⱼ)²'},
  {name:'F-statistic',formula:'F = MSB/MSW = (SSB/dfB)/(SSW/dfW)'},
  {name:'df between',formula:'k − 1'},
  {name:'df within',formula:'N − k'},
  {name:'Eta-squared',formula:'η² = SSB/SST'},
]
*/
