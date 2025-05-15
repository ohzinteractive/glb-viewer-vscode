
module.exports = {
  extends: ["stylelint-config-standard-scss"],
  plugins: [
		"stylelint-order"
	],
  rules: {
    "selector-class-pattern": [
      '^[a-z]([-]?[a-z0-9]+)*(__[a-z0-9]([-]?[a-z0-9]+)*)?(--[a-z0-9]([-]?[a-z0-9]+)*)?$',
      {
        resolveNestedSelectors: true,
        message: function expected(selectorValue) {
          return `Expected class selector "${selectorValue}" to match BEM CSS pattern https://en.bem.info/methodology/css. Selector validation tool: https://regexr.com/3apms`;
        },
      },
    ],
    "block-no-empty": null,
    "declaration-empty-line-before": null,
    "at-rule-empty-line-before": null,
    "max-empty-lines": 1,

    "order/properties-order": [

      {
        "emptyLineBefore": "never",
        "noEmptyLineBetween": true,
        "properties": [
          "display"
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "flex-flow",
          "flex-direction",
          "flex-wrap"
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "flex",
          "flex-grow",
          "flex-shrink",
          "flex-basis",
          "order",
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "grid",
          "grid-template-columns",
          "grid-template-rows",
          "grid-template-areas",
          "grid-template",
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "grid-column",
          "grid-row",
          "grid-area"
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "grid-column-start",
          "grid-column-end",
          "grid-row-start",
          "grid-row-end",
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "place-self",
          "justify-self",
          "align-self"
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "grid-auto-columns",
          "grid-auto-rows",
          "grid-auto-flow",
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "column-gap",
          "row-gap",
          "grid-column-gap",
          "grid-row-gap",
          "gap",
          "grid-gap",
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "justify-items",
          "align-items",
          "place-items",
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "justify-content",
          "align-content",
          "place-content",
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "position",
          "top",
          "right",
          "bottom",
          "left",
          "z-index"
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "margin",
          "margin-top",
          "margin-right",
          "margin-bottom",
          "margin-left"
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "margin-collapse",
          "margin-top-collapse",
          "margin-right-collapse",
          "margin-bottom-collapse",
          "margin-left-collapse"
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "padding",
          "padding-top",
          "padding-right",
          "padding-bottom",
          "padding-left"
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "width",
          "height",
          "max-width",
          "max-height",
          "min-width",
          "min-height"
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
         "color"
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "font",
          "font-size",
          "font-style",
          "font-family",
          "font-weight",
          "font-variant",
          "font-smoothing"
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "line-height",
          "letter-spacing",
          "word-spacing"
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "text-align",
          "text-indent",
          "text-shadow",
          "text-overflow",
          "text-rendering",
          "text-transform",
          "text-decoration",
          "text-size-adjust"
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "word-break",
          "word-wrap"
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "white-space",
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "background",
          "background-size",
          "background-color",
          "background-image",
          "background-repeat",
          "background-position",
          "background-attachment"
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "border",
          "border-top",
          "border-right",
          "border-bottom",
          "border-left",
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "border-image",
          "border-spacing",
          "border-collapse"
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "border-color",
          "border-top-color",
          "border-right-color",
          "border-bottom-color",
          "border-left-color"
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "border-style",
          "border-top-style",
          "border-right-style",
          "border-bottom-style",
          "border-left-style"
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "border-width",
          "border-top-width",
          "border-right-width",
          "border-bottom-width",
          "border-left-width"
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "border-radius",
          "border-top-right-radius",
          "border-bottom-right-radius",
          "border-bottom-left-radius",
          "border-top-left-radius",
          "border-radius-topright",
          "border-radius-bottomright",
          "border-radius-bottomleft",
          "border-radius-topleft"
        ]
      },

      {
        "emptyLineBefore": "always",
        "noEmptyLineBetween": true,
        "properties": [
          "box-shadow"
        ]
      }
    ]
  }
}
