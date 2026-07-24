import "@logseq/libs";
import semver from "semver";

import { logseq as PL } from "../package.json";
import bundledBaseStyles from "./styles/bullet-threading.css?raw";
import compatibilityStyles from "./styles/compatibility.css?raw";

const MINIMUM_COMPATIBILITY_VERSION = "0.9.6";

function provideBaseStyles(): void {
  logseq.provideStyle({
    key: `${PL.id}-base`,
    style: bundledBaseStyles,
  });
}

function provideCompatibilityStyles(): void {
  logseq.provideStyle({
    key: `${PL.id}-compatibility`,
    style: compatibilityStyles,
  });
}

function onSettingsChange(): void {
  const configuredWidth = logseq.settings?.width ?? "2px";
  const width = `${configuredWidth}`.endsWith("px")
    ? `${configuredWidth}`
    : `${configuredWidth}px`;
  const color =
    logseq.settings?.customColor && typeof logseq.settings?.color === "string"
      ? logseq.settings.color
      : null;

  const variables: [string, string][] = [
    ["--ls-block-bullet-threading-width-overwrite", width],
  ];

  if (color) {
    variables.push([
      "--ls-block-bullet-threading-active-color-overwrite",
      color,
    ]);
  }

  const declarations = variables
    .map(([name, value]) => `${name}: ${value};`)
    .join("\n");

  logseq.provideStyle({
    key: `${PL.id}-variables`,
    style: `:root { ${declarations} }`,
  });
}

async function shouldUseCompatibilityStyles(): Promise<boolean> {
  try {
    const appVersion = await logseq.App.getInfo("version");
    return Boolean(
      appVersion &&
        semver.valid(appVersion) &&
        semver.gt(appVersion, MINIMUM_COMPATIBILITY_VERSION),
    );
  } catch (error) {
    console.warn(
      "logseq-bullet-threading: could not read the Logseq version",
      error,
    );
    return false;
  }
}

async function main(): Promise<void> {
  onSettingsChange();
  logseq.onSettingsChanged(onSettingsChange);

  // The bundled base is release-pinned so runtime CSS matches tested CSS.
  provideBaseStyles();

  if (await shouldUseCompatibilityStyles()) {
    provideCompatibilityStyles();
  }
}

logseq
  .useSettingsSchema([
    {
      key: "width",
      default: "2px",
      description: "Width of the bullet threading.",
      title: "Width of the bullet threading path",
      type: "enum",
      enumPicker: "radio",
      enumChoices: ["1px", "2px", "3px"],
    },
    {
      key: "customColor",
      default: false,
      description: "Overwrite threading path color?",
      title: "Whether or not to overwrite threading path color.",
      type: "boolean",
    },
    {
      key: "color",
      default: "",
      description:
        "Color of the bullet threading. You need to enable 'Overwrite threading path color?' first",
      title: "Color of the bullet threading path.",
      type: "string",
      inputAs: "color",
    },
  ])
  .ready(main)
  .catch(console.error);
