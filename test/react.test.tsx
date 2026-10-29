import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Openblob } from "../src/react.js";
import { defineDesign, openblobUri } from "../src/index.js";

describe("<Openblob>", () => {
  it("renders an img with the avatar as a data URI", () => {
    const html = renderToStaticMarkup(<Openblob seed="ana" size={32} className="rounded" />);
    expect(html).toContain(`src="${openblobUri("ana").replace(/&/g, "&amp;")}"`);
    expect(html).toContain('width="32"');
    expect(html).toContain('class="rounded"');
    expect(html).toContain('alt=""');
  });

  it("uses the title as the alt text", () => {
    expect(renderToStaticMarkup(<Openblob seed="ana" title="Ana López" />)).toContain('alt="Ana López"');
  });

  it("draws the design it is given", () => {
    const square = defineDesign({ name: "square", draw: () => ({ svg: '<rect width="100" height="100"/>' }) });
    const html = renderToStaticMarkup(<Openblob seed="ana" design={square} />);
    expect(html).toContain(`src="${openblobUri("ana", { design: square }).replace(/&/g, "&amp;")}"`);
  });
});
