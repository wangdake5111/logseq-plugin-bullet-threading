/* eslint-env node */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { runHeadlessFixture } from "./support/headless-chrome.mjs";

const testDir = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(testDir, "..");
const basePath = resolve(pluginRoot, "src/styles/bullet-threading.css");
const compatibilityPath = resolve(
  pluginRoot,
  "src/styles/compatibility.css",
);
const mainPath = resolve(pluginRoot, "src/main.ts");
const baseCss = readFileSync(basePath, "utf8");
const compatibilityCss = readFileSync(compatibilityPath, "utf8");
const mainSource = readFileSync(mainPath, "utf8");
const baseStyleCallIndex = mainSource.indexOf("provideBaseStyles();");
const compatibilityStyleCallIndex = mainSource.indexOf(
  "provideCompatibilityStyles();",
);

const wrappedSegmentSelector =
  ".block-children\n  > .blocks-list-wrap\n  > .ls-block::before";
const wrappedActiveSelector =
  ".block-children:focus-within\n  > .blocks-list-wrap\n  > .ls-block:not(:focus-within)::before";

assert.ok(
  compatibilityCss.includes(wrappedSegmentSelector),
  "DB child segments must cross .blocks-list-wrap",
);
assert.ok(
  compatibilityCss.includes(wrappedActiveSelector),
  "DB preceding child segments must receive the active color",
);
assert.ok(
  baseStyleCallIndex >= 0,
  "The pinned base stylesheet must be injected by main",
);
assert.ok(
  compatibilityStyleCallIndex >= 0,
  "The compatibility stylesheet must be injected by main",
);
assert.ok(
  baseStyleCallIndex < compatibilityStyleCallIndex,
  "The pinned base stylesheet must be injected before compatibility overrides",
);

function createFixture(threadWidth) {
  return `<!doctype html>
<meta charset="utf-8">
<style>
  :root {
    --ls-block-bullet-threading-width-overwrite: ${threadWidth}px;
    --ls-block-bullet-threading-active-color-overwrite:
      rgb(186, 64, 64);
  }

  .ls-block {
    min-height: 30px;
    position: relative;
  }

  .block-content-wrapper {
    height: 24px;
    position: relative;
  }

  #parent > .block-main-container,
  #nested-parent > .block-main-container {
    height: 26px;
    position: relative;
  }

  #parent > .block-main-container > .block-control-wrap,
  #nested-parent > .block-main-container > .block-control-wrap {
    left: 23px;
    position: absolute;
    top: 5px;
  }

  #parent > .block-main-container .bullet-container,
  #nested-parent > .block-main-container .bullet-container {
    align-items: center;
    display: flex;
    height: 14px;
    justify-content: center;
    width: 16px;
  }

  #parent > .block-main-container .bullet,
  #nested-parent > .block-main-container .bullet {
    border-radius: 999px;
    box-shadow: rgb(186, 64, 64) 0 0 0 1px;
    height: 6.4px;
    width: 6.4px;
  }

  #parent-wrapper,
  #nested-parent-wrapper {
    left: 42px;
    position: absolute;
    top: 0;
    width: 400px;
  }

  #parent > .block-children-container > .block-children,
  #nested-parent > .block-children-container > .block-children {
    margin-left: 31px;
  }

  #target-control,
  #nested-child-control {
    height: 26px;
    position: relative;
    width: 38px;
  }

  #target-control .bullet-container,
  #nested-child-control .bullet-container {
    align-items: center;
    display: flex;
    justify-content: center;
    left: 24px;
    position: absolute;
    top: 6.2px;
  }

  #target-bullet,
  #nested-child-bullet {
    border-radius: 999px;
    height: 6.4px;
    width: 6.4px;
  }

  #nested-parent {
    min-height: 58px;
  }

  #nested-parent > .block-children-container {
    left: 0;
    position: absolute;
    top: 28px;
    width: 400px;
  }

  #nested-child-control {
    top: 2px;
  }

  .contract-fixture {
    margin-top: 20px;
  }

  .contract-fixture > .block-main-container {
    height: 26px;
    position: relative;
  }
</style>
<style data-test-style="base">${baseCss}</style>
<style data-test-style="compatibility">${compatibilityCss}</style>

<div id="parent" class="ls-block" haschild="true" tabindex="0">
  <div id="parent-main" class="block-main-container">
    <div class="block-control-wrap items-center">
      <a class="bullet-link-wrap">
        <span class="bullet-container">
          <span id="parent-bullet" class="bullet"></span>
        </span>
      </a>
    </div>
    <div class="flex-col">
      <div class="flex-col">
        <div class="block-main-content">
          <div class="flex-col">
            <div class="block-content-or-editor-wrap">
              <div class="block-content-or-editor-inner">
                <div class="block-row">
                  <div
                    id="parent-wrapper"
                    class="block-content-wrapper"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="ls-properties-area">
    <div id="property-editor" tabindex="0"></div>
  </div>

  <div class="block-children-container">
    <div class="block-children">
      <div class="blocks-list-wrap">
        <div id="before-1" class="ls-block" haschild="false">09:55</div>
        <div id="before-2" class="ls-block" haschild="false">10:57</div>
        <div id="target" class="ls-block" haschild="false" tabindex="0">
          <div class="block-main-container">
            <div
              id="target-control"
              class="block-control-wrap items-center"
            >
              <a class="bullet-link-wrap">
                <span class="bullet-container">
                  <span id="target-bullet" class="bullet"></span>
                </span>
              </a>
            </div>
          </div>
          14:31
        </div>

        <div id="nested-parent" class="ls-block" haschild="true">
          <div id="nested-parent-main" class="block-main-container">
            <div class="block-control-wrap items-center">
              <a class="bullet-link-wrap">
                <span class="bullet-container">
                  <span
                    id="nested-parent-bullet"
                    class="bullet"
                  ></span>
                </span>
              </a>
            </div>
            <div class="flex-col">
              <div class="flex-col">
                <div class="block-main-content">
                  <div class="flex-col">
                    <div class="block-content-or-editor-wrap">
                      <div class="block-content-or-editor-inner">
                        <div class="block-row">
                          <div
                            id="nested-parent-wrapper"
                            class="block-content-wrapper"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="block-children-container">
            <div class="block-children">
              <div class="blocks-list-wrap">
                <div
                  id="nested-child"
                  class="ls-block"
                  haschild="false"
                  tabindex="0"
                >
                  <div class="block-main-container">
                    <div
                      id="nested-child-control"
                      class="block-control-wrap items-center"
                    >
                      <a class="bullet-link-wrap">
                        <span class="bullet-container">
                          <span
                            id="nested-child-bullet"
                            class="bullet"
                          ></span>
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div id="virtual-leaf" class="ls-block contract-fixture" haschild="true">
  <div id="virtual-leaf-main" class="block-main-container">
    <div class="flex-col">
      <div class="flex-col">
        <div class="block-main-content">
          <div class="flex-col">
            <div class="block-content-or-editor-wrap">
              <div class="block-content-or-editor-inner">
                <div class="block-row">
                  <div
                    id="virtual-leaf-wrapper"
                    class="block-content-wrapper"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div
  id="ordered-parent"
  class="ls-block is-order-list contract-fixture"
  haschild="true"
>
  <div class="block-main-container">
    <div class="flex-col">
      <div class="flex-col">
        <div class="block-main-content">
          <div class="flex-col">
            <div class="block-content-or-editor-wrap">
              <div class="block-content-or-editor-inner">
                <div class="block-row">
                  <div
                    id="ordered-parent-wrapper"
                    class="block-content-wrapper"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="block-children-container">
    <div class="block-children">
      <div class="blocks-list-wrap"></div>
    </div>
  </div>
</div>

<div class="doc-mode">
  <div
    id="doc-parent"
    class="ls-block contract-fixture"
    haschild="true"
  >
    <div id="doc-parent-main" class="block-main-container">
      <div class="flex-col">
        <div class="flex-col">
          <div class="block-main-content">
            <div class="flex-col">
              <div class="block-content-or-editor-wrap">
                <div class="block-content-or-editor-inner">
                  <div class="block-row">
                    <div
                      id="doc-parent-wrapper"
                      class="block-content-wrapper"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="block-children-container">
      <div class="block-children">
        <div class="blocks-list-wrap"></div>
      </div>
    </div>
  </div>
</div>

<div
  id="renderer-parent"
  class="ls-block contract-fixture"
  haschild="true"
>
  <div id="renderer-parent-main" class="block-main-container">
    <div class="block-renderer-container"></div>
  </div>
  <div class="block-children-container">
    <div class="block-children">
      <div class="blocks-list-wrap">
        <div
          id="renderer-child"
          class="ls-block"
          haschild="false"
          tabindex="0"
        ></div>
      </div>
    </div>
  </div>
</div>

<pre id="result"></pre>
<script>
  const pseudo = (id) =>
    getComputedStyle(document.getElementById(id), "::before");

  const parent = document.getElementById("parent");
  const propertyEditor = document.getElementById("property-editor");
  const rendererChild = document.getElementById("renderer-child");

  parent.focus();
  const parentOwnFocusColor =
    pseudo("parent-main").borderLeftColor;
  propertyEditor.focus();
  const propertyFocusColor =
    pseudo("parent-main").borderLeftColor;
  rendererChild.focus();
  const rendererParentContent =
    pseudo("renderer-parent-main").content;
  const rendererParentColor =
    pseudo("renderer-parent-main").borderLeftColor;

  const target = document.getElementById("target");
  target.focus();
  const before1 = document.getElementById("before-1");
  const before1Pseudo = pseudo("before-1");
  const parentMain = document.getElementById("parent-main");
  const parentBullet = document.getElementById("parent-bullet");
  const parentPseudo = pseudo("parent-main");
  const targetControl = document.getElementById("target-control");
  const targetBullet = document.getElementById("target-bullet");
  const targetCurvePseudo = pseudo("target-control");
  const targetControlRect = targetControl.getBoundingClientRect();
  const targetBulletRect = targetBullet.getBoundingClientRect();

  const result = {
    before1Content: before1Pseudo.content,
    before1Color: before1Pseudo.borderLeftColor,
    before2Content: pseudo("before-2").content,
    before2Color: pseudo("before-2").borderLeftColor,
    targetColor: pseudo("target").borderLeftColor,
    afterColor: pseudo("nested-parent").borderLeftColor,
    parentContent: parentPseudo.content,
    parentColor: parentPseudo.borderLeftColor,
    parentOwnFocusColor,
    propertyFocusColor,
    rendererParentContent,
    rendererParentColor,
    parentStemStart:
      parentMain.getBoundingClientRect().top +
      Number.parseFloat(parentPseudo.top),
    parentBulletVisualBottom:
      parentBullet.getBoundingClientRect().bottom + 1,
    parentBulletCenter:
      (parentBullet.getBoundingClientRect().left +
        parentBullet.getBoundingClientRect().right) /
      2,
    parentStemAxis:
      parentMain.getBoundingClientRect().left +
      Number.parseFloat(parentPseudo.left) +
      Number.parseFloat(parentPseudo.borderLeftWidth) / 2,
    firstChildSegmentAxis:
      before1.getBoundingClientRect().left +
      Number.parseFloat(before1Pseudo.left) +
      Number.parseFloat(before1Pseudo.borderLeftWidth) / 2,
    parentConnectorGap:
      parentMain.getBoundingClientRect().top +
      Number.parseFloat(parentPseudo.top) -
      (parentBullet.getBoundingClientRect().bottom + 1),
    childConnectorGap:
      targetBulletRect.left -
      1 -
      (targetControlRect.right -
        Number.parseFloat(targetCurvePseudo.right)),
    firstChildSegmentStart:
      before1.getBoundingClientRect().top +
      Number.parseFloat(before1Pseudo.top),
    parentStemEnd:
      parentMain.getBoundingClientRect().bottom -
      Number.parseFloat(parentPseudo.bottom),
    virtualLeafContent: pseudo("virtual-leaf-main").content,
    orderedParentTop: pseudo("ordered-parent-wrapper").top,
    orderedParentLeft: pseudo("ordered-parent-wrapper").left,
    docParentDisplay: pseudo("doc-parent-main").display,
  };

  const nestedParentMain = document.getElementById(
    "nested-parent-main",
  );
  const nestedParentBullet = document.getElementById(
    "nested-parent-bullet",
  );
  const nestedChild = document.getElementById("nested-child");
  const nestedChildControl = document.getElementById(
    "nested-child-control",
  );
  const nestedChildBullet = document.getElementById(
    "nested-child-bullet",
  );
  nestedChild.focus();

  const nestedParentPseudo = pseudo("nested-parent-main");
  const nestedSegmentPseudo = pseudo("nested-child");
  const nestedCurvePseudo = pseudo("nested-child-control");
  const nestedParentMainRect =
    nestedParentMain.getBoundingClientRect();
  const nestedParentBulletRect =
    nestedParentBullet.getBoundingClientRect();
  const nestedChildRect = nestedChild.getBoundingClientRect();
  const nestedChildControlRect =
    nestedChildControl.getBoundingClientRect();
  const nestedChildBulletRect =
    nestedChildBullet.getBoundingClientRect();
  const nestedParentBulletVisualBottom =
    nestedParentBulletRect.bottom + 1;

  Object.assign(result, {
    nestedParentContent: nestedParentPseudo.content,
    nestedParentColor: nestedParentPseudo.borderLeftColor,
    nestedCurveTop: nestedCurvePseudo.top,
    nestedParentGap:
      nestedParentMainRect.top +
      Number.parseFloat(nestedParentPseudo.top) -
      nestedParentBulletVisualBottom,
    nestedCurveGap:
      nestedChildControlRect.top +
      Number.parseFloat(nestedCurvePseudo.top) -
      nestedParentBulletVisualBottom,
    nestedChildConnectorGap:
      nestedChildBulletRect.left -
      1 -
      (nestedChildControlRect.right -
        Number.parseFloat(nestedCurvePseudo.right)),
    nestedParentBulletCenter:
      (nestedParentBulletRect.left + nestedParentBulletRect.right) / 2,
    nestedParentStemAxis:
      nestedParentMainRect.left +
      Number.parseFloat(nestedParentPseudo.left) +
      Number.parseFloat(nestedParentPseudo.borderLeftWidth) / 2,
    nestedFirstSegmentAxis:
      nestedChildRect.left +
      Number.parseFloat(nestedSegmentPseudo.left) +
      Number.parseFloat(nestedSegmentPseudo.borderLeftWidth) / 2,
    nestedCurveAxis:
      nestedChildControlRect.left +
      Number.parseFloat(nestedCurvePseudo.left) +
      Number.parseFloat(nestedCurvePseudo.borderLeftWidth) / 2,
    nestedFirstSegmentStart:
      nestedChildRect.top + Number.parseFloat(nestedSegmentPseudo.top),
    nestedCurveStart:
      nestedChildControlRect.top +
      Number.parseFloat(nestedCurvePseudo.top),
    nestedParentStemEnd:
      nestedParentMainRect.bottom -
      Number.parseFloat(nestedParentPseudo.bottom),
  });

  document.getElementById("result").textContent =
    encodeURIComponent(JSON.stringify(result));
</script>`;
}

const activeColor = "rgb(186, 64, 64)";
const transparentColor = "rgba(0, 0, 0, 0)";

function assertGeometry(result, threadWidth) {
assert.equal(result.before1Content, '""');
assert.equal(result.before1Color, activeColor);
assert.equal(result.before2Content, '""');
assert.equal(result.before2Color, activeColor);
assert.equal(result.targetColor, transparentColor);
assert.equal(result.afterColor, transparentColor);
assert.equal(result.parentContent, '""');
assert.equal(result.parentColor, activeColor);
assert.equal(
  result.parentOwnFocusColor,
  transparentColor,
  "Focusing the parent itself must not paint a dangling stem",
);
assert.equal(
  result.propertyFocusColor,
  transparentColor,
  "Focusing a property block must not paint the outline stem",
);
assert.equal(result.rendererParentContent, '""');
assert.equal(
  result.rendererParentColor,
  activeColor,
  "Plugin-rendered parents must retain their active stem",
);
assert.ok(
  result.parentConnectorGap > 0,
  `Parent connector must leave a visible gap: ${result.parentConnectorGap}`,
);
assert.ok(
  Math.abs(result.parentConnectorGap - result.childConnectorGap) <= 0.25,
  `Parent/child connector gaps differ: ${result.parentConnectorGap} vs ${result.childConnectorGap}`,
);
assert.ok(
  result.firstChildSegmentStart >= result.parentBulletVisualBottom,
  `First child segment enters the mother bullet: ${result.firstChildSegmentStart} < ${result.parentBulletVisualBottom}`,
);
assert.ok(
  result.parentStemEnd >= result.firstChildSegmentStart,
  `Parent stem does not reach the first child segment: ${result.parentStemEnd} < ${result.firstChildSegmentStart}`,
);
assert.ok(
  Math.abs(result.parentBulletCenter - result.parentStemAxis) <= 0.1,
  `Parent bullet and stem axes differ: ${result.parentBulletCenter} vs ${result.parentStemAxis}`,
);
assert.ok(
  Math.abs(result.parentStemAxis - result.firstChildSegmentAxis) <= 0.1,
  `Parent and child segment axes differ: ${result.parentStemAxis} vs ${result.firstChildSegmentAxis}`,
);

assert.equal(result.nestedParentContent, '""');
assert.equal(result.nestedParentColor, activeColor);
assert.equal(
  result.nestedCurveTop,
  `${-10 + threadWidth / 2}px`,
  `Nested first-child curve still overreaches: ${result.nestedCurveTop}`,
);
assert.ok(
  Math.abs(result.nestedParentGap - result.parentConnectorGap) <= 0.25,
  `Level 1/2 parent gaps differ: ${result.parentConnectorGap} vs ${result.nestedParentGap}`,
);
assert.ok(
  Math.abs(result.nestedCurveGap - result.nestedParentGap) <= 0.25,
  `Nested curve/parent gaps differ: ${result.nestedCurveGap} vs ${result.nestedParentGap}`,
);
assert.ok(
  Math.abs(result.nestedChildConnectorGap - result.childConnectorGap) <= 0.25,
  `Level 1/2 child gaps differ: ${result.childConnectorGap} vs ${result.nestedChildConnectorGap}`,
);
assert.ok(
  Math.abs(
    result.nestedParentBulletCenter - result.nestedParentStemAxis,
  ) <= 0.1,
  `Nested parent bullet/stem axes differ: ${result.nestedParentBulletCenter} vs ${result.nestedParentStemAxis}`,
);
assert.ok(
  Math.abs(
    result.nestedParentStemAxis - result.nestedFirstSegmentAxis,
  ) <= 0.1,
  `Nested parent/child segment axes differ: ${result.nestedParentStemAxis} vs ${result.nestedFirstSegmentAxis}`,
);
assert.ok(
  Math.abs(result.nestedParentStemAxis - result.nestedCurveAxis) <= 0.1,
  `Nested stem/curve axes differ: ${result.nestedParentStemAxis} vs ${result.nestedCurveAxis}`,
);
assert.ok(
  result.nestedParentStemEnd >= result.nestedFirstSegmentStart,
  `Nested parent stem does not reach its first child: ${result.nestedParentStemEnd} < ${result.nestedFirstSegmentStart}`,
);
assert.ok(
  result.nestedParentStemEnd >= result.nestedCurveStart,
  `Nested parent stem does not reach its curve: ${result.nestedParentStemEnd} < ${result.nestedCurveStart}`,
);

assert.equal(
  result.virtualLeafContent,
  "none",
  "A virtualized haschild leaf must not draw a phantom parent stem",
);
assert.equal(result.orderedParentTop, "24px");
assert.equal(result.orderedParentLeft, "-15px");
assert.equal(result.docParentDisplay, "none");
}

for (const threadWidth of [1, 2, 3]) {
  const result = runHeadlessFixture(createFixture(threadWidth));
  assertGeometry(result, threadWidth);
}

console.log(
  "PASS DB bullet path is continuous, symmetric, and axis-aligned at 1px, 2px, and 3px",
);
