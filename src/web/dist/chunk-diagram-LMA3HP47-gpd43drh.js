import {
  populateCommonDb
} from "./chunk-main-swn2pgxb.js";
import {
  parse
} from "./chunk-main-95eqee0w.js";
import"./chunk-main-rhjqzyw5.js";
import"./chunk-main-rnwcyf5v.js";
import"./chunk-main-3chqn6nd.js";
import"./chunk-main-v7705ax4.js";
import"./chunk-main-93jkhrwv.js";
import"./chunk-main-yyhgqcf9.js";
import"./chunk-main-gk3514dg.js";
import"./chunk-main-wrrkcnjj.js";
import"./chunk-main-vxc4sxhk.js";
import {
  selectSvgElement
} from "./chunk-main-f3t3xmmb.js";
import {
  cleanAndMerge
} from "./chunk-main-vvfzntzy.js";
import"./chunk-main-ck580f0k.js";
import {
  clear,
  configureSvgSize,
  defaultConfig_default,
  getAccDescription,
  getAccTitle,
  getConfig,
  getDiagramTitle,
  setAccDescription,
  setAccTitle,
  setDiagramTitle
} from "./chunk-main-aws590jt.js";
import {
  __name,
  log
} from "./chunk-main-vcnyggwp.js";
import"./chunk-main-x0xz2rje.js";
import"./chunk-main-rxe1mr61.js";
import"./chunk-main-g8wf8be2.js";

// node_modules/mermaid/dist/chunks/mermaid.core/diagram-LMA3HP47.mjs
var DEFAULT_PACKET_CONFIG = defaultConfig_default.packet;
var PacketDB = class {
  constructor() {
    this.packet = [];
    this.setAccTitle = setAccTitle;
    this.getAccTitle = getAccTitle;
    this.setDiagramTitle = setDiagramTitle;
    this.getDiagramTitle = getDiagramTitle;
    this.getAccDescription = getAccDescription;
    this.setAccDescription = setAccDescription;
  }
  static {
    __name(this, "PacketDB");
  }
  getConfig() {
    const config = cleanAndMerge({
      ...DEFAULT_PACKET_CONFIG,
      ...getConfig().packet
    });
    if (config.showBits) {
      config.paddingY += 10;
    }
    return config;
  }
  getPacket() {
    return this.packet;
  }
  pushWord(word) {
    if (word.length > 0) {
      this.packet.push(word);
    }
  }
  clear() {
    clear();
    this.packet = [];
  }
};
var maxPacketSize = 1e4;
var populate = /* @__PURE__ */ __name((ast, db) => {
  populateCommonDb(ast, db);
  let lastBit = -1;
  let word = [];
  let row = 1;
  const { bitsPerRow } = db.getConfig();
  for (let { start, end, bits, label } of ast.blocks) {
    if (start !== undefined && end !== undefined && end < start) {
      throw new Error(`Packet block ${start} - ${end} is invalid. End must be greater than start.`);
    }
    start ??= lastBit + 1;
    if (start !== lastBit + 1) {
      throw new Error(`Packet block ${start} - ${end ?? start} is not contiguous. It should start from ${lastBit + 1}.`);
    }
    if (bits === 0) {
      throw new Error(`Packet block ${start} is invalid. Cannot have a zero bit field.`);
    }
    end ??= start + (bits ?? 1) - 1;
    bits ??= end - start + 1;
    lastBit = end;
    log.debug(`Packet block ${start} - ${lastBit} with label ${label}`);
    while (word.length <= bitsPerRow + 1 && db.getPacket().length < maxPacketSize) {
      const [block, nextBlock] = getNextFittingBlock({ start, end, bits, label }, row, bitsPerRow);
      word.push(block);
      if (block.end + 1 === row * bitsPerRow) {
        db.pushWord(word);
        word = [];
        row++;
      }
      if (!nextBlock) {
        break;
      }
      ({ start, end, bits, label } = nextBlock);
    }
  }
  db.pushWord(word);
}, "populate");
var getNextFittingBlock = /* @__PURE__ */ __name((block, row, bitsPerRow) => {
  if (block.start === undefined) {
    throw new Error("start should have been set during first phase");
  }
  if (block.end === undefined) {
    throw new Error("end should have been set during first phase");
  }
  if (block.start > block.end) {
    throw new Error(`Block start ${block.start} is greater than block end ${block.end}.`);
  }
  if (block.end + 1 <= row * bitsPerRow) {
    return [block, undefined];
  }
  const rowEnd = row * bitsPerRow - 1;
  const rowStart = row * bitsPerRow;
  return [
    {
      start: block.start,
      end: rowEnd,
      label: block.label,
      bits: rowEnd - block.start
    },
    {
      start: rowStart,
      end: block.end,
      label: block.label,
      bits: block.end - rowStart
    }
  ];
}, "getNextFittingBlock");
var parser = {
  parser: { yy: undefined },
  parse: /* @__PURE__ */ __name(async (input) => {
    const ast = await parse("packet", input);
    const db = parser.parser?.yy;
    if (!(db instanceof PacketDB)) {
      throw new Error("parser.parser?.yy was not a PacketDB. This is due to a bug within Mermaid, please report this issue at https://github.com/mermaid-js/mermaid/issues.");
    }
    log.debug(ast);
    populate(ast, db);
  }, "parse")
};
var draw = /* @__PURE__ */ __name((_text, id, _version, diagram2) => {
  const db = diagram2.db;
  const config = db.getConfig();
  const { rowHeight, paddingY, bitWidth, bitsPerRow } = config;
  const words = db.getPacket();
  const title = db.getDiagramTitle();
  const totalRowHeight = rowHeight + paddingY;
  const svgHeight = totalRowHeight * (words.length + 1) - (title ? 0 : rowHeight);
  const svgWidth = bitWidth * bitsPerRow + 2;
  const svg = selectSvgElement(id);
  svg.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
  configureSvgSize(svg, svgHeight, svgWidth, config.useMaxWidth);
  for (const [word, packet] of words.entries()) {
    drawWord(svg, packet, word, config);
  }
  svg.append("text").text(title).attr("x", svgWidth / 2).attr("y", svgHeight - totalRowHeight / 2).attr("dominant-baseline", "middle").attr("text-anchor", "middle").attr("class", "packetTitle");
}, "draw");
var drawWord = /* @__PURE__ */ __name((svg, word, rowNumber, { rowHeight, paddingX, paddingY, bitWidth, bitsPerRow, showBits }) => {
  const group = svg.append("g");
  const wordY = rowNumber * (rowHeight + paddingY) + paddingY;
  for (const block of word) {
    const blockX = block.start % bitsPerRow * bitWidth + 1;
    const width = (block.end - block.start + 1) * bitWidth - paddingX;
    group.append("rect").attr("x", blockX).attr("y", wordY).attr("width", width).attr("height", rowHeight).attr("class", "packetBlock");
    group.append("text").attr("x", blockX + width / 2).attr("y", wordY + rowHeight / 2).attr("class", "packetLabel").attr("dominant-baseline", "middle").attr("text-anchor", "middle").text(block.label);
    if (!showBits) {
      continue;
    }
    const isSingleBlock = block.end === block.start;
    const bitNumberY = wordY - 2;
    group.append("text").attr("x", blockX + (isSingleBlock ? width / 2 : 0)).attr("y", bitNumberY).attr("class", "packetByte start").attr("dominant-baseline", "auto").attr("text-anchor", isSingleBlock ? "middle" : "start").text(block.start);
    if (!isSingleBlock) {
      group.append("text").attr("x", blockX + width).attr("y", bitNumberY).attr("class", "packetByte end").attr("dominant-baseline", "auto").attr("text-anchor", "end").text(block.end);
    }
  }
}, "drawWord");
var renderer = { draw };
var defaultPacketStyleOptions = {
  byteFontSize: "10px",
  startByteColor: "black",
  endByteColor: "black",
  labelColor: "black",
  labelFontSize: "12px",
  titleColor: "black",
  titleFontSize: "14px",
  blockStrokeColor: "black",
  blockStrokeWidth: "1",
  blockFillColor: "#efefef"
};
var styles = /* @__PURE__ */ __name(({ packet } = {}) => {
  const options = cleanAndMerge(defaultPacketStyleOptions, packet);
  return `
	.packetByte {
		font-size: ${options.byteFontSize};
	}
	.packetByte.start {
		fill: ${options.startByteColor};
	}
	.packetByte.end {
		fill: ${options.endByteColor};
	}
	.packetLabel {
		fill: ${options.labelColor};
		font-size: ${options.labelFontSize};
	}
	.packetTitle {
		fill: ${options.titleColor};
		font-size: ${options.titleFontSize};
	}
	.packetBlock {
		stroke: ${options.blockStrokeColor};
		stroke-width: ${options.blockStrokeWidth};
		fill: ${options.blockFillColor};
	}
	`;
}, "styles");
var diagram = {
  parser,
  get db() {
    return new PacketDB;
  },
  renderer,
  styles
};
export {
  diagram
};

//# debugId=83C07AA3BAE50DAE64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL2RpYWdyYW0tTE1BM0hQNDcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgImltcG9ydCB7XG4gIHNlbGVjdFN2Z0VsZW1lbnRcbn0gZnJvbSBcIi4vY2h1bmstV1U1TVlHMkcubWpzXCI7XG5pbXBvcnQge1xuICBwb3B1bGF0ZUNvbW1vbkRiXG59IGZyb20gXCIuL2NodW5rLTRCWDJWVUFCLm1qc1wiO1xuaW1wb3J0IHtcbiAgY2xlYW5BbmRNZXJnZVxufSBmcm9tIFwiLi9jaHVuay01WlFZSFhLVS5tanNcIjtcbmltcG9ydCB7XG4gIGNsZWFyLFxuICBjb25maWd1cmVTdmdTaXplLFxuICBkZWZhdWx0Q29uZmlnX2RlZmF1bHQsXG4gIGdldEFjY0Rlc2NyaXB0aW9uLFxuICBnZXRBY2NUaXRsZSxcbiAgZ2V0Q29uZmlnLFxuICBnZXREaWFncmFtVGl0bGUsXG4gIHNldEFjY0Rlc2NyaXB0aW9uLFxuICBzZXRBY2NUaXRsZSxcbiAgc2V0RGlhZ3JhbVRpdGxlXG59IGZyb20gXCIuL2NodW5rLUNTQ0lISzdRLm1qc1wiO1xuaW1wb3J0IHtcbiAgX19uYW1lLFxuICBsb2dcbn0gZnJvbSBcIi4vY2h1bmstQUdIUkI0SkYubWpzXCI7XG5cbi8vIHNyYy9kaWFncmFtcy9wYWNrZXQvZGIudHNcbnZhciBERUZBVUxUX1BBQ0tFVF9DT05GSUcgPSBkZWZhdWx0Q29uZmlnX2RlZmF1bHQucGFja2V0O1xudmFyIFBhY2tldERCID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnBhY2tldCA9IFtdO1xuICAgIHRoaXMuc2V0QWNjVGl0bGUgPSBzZXRBY2NUaXRsZTtcbiAgICB0aGlzLmdldEFjY1RpdGxlID0gZ2V0QWNjVGl0bGU7XG4gICAgdGhpcy5zZXREaWFncmFtVGl0bGUgPSBzZXREaWFncmFtVGl0bGU7XG4gICAgdGhpcy5nZXREaWFncmFtVGl0bGUgPSBnZXREaWFncmFtVGl0bGU7XG4gICAgdGhpcy5nZXRBY2NEZXNjcmlwdGlvbiA9IGdldEFjY0Rlc2NyaXB0aW9uO1xuICAgIHRoaXMuc2V0QWNjRGVzY3JpcHRpb24gPSBzZXRBY2NEZXNjcmlwdGlvbjtcbiAgfVxuICBzdGF0aWMge1xuICAgIF9fbmFtZSh0aGlzLCBcIlBhY2tldERCXCIpO1xuICB9XG4gIGdldENvbmZpZygpIHtcbiAgICBjb25zdCBjb25maWcgPSBjbGVhbkFuZE1lcmdlKHtcbiAgICAgIC4uLkRFRkFVTFRfUEFDS0VUX0NPTkZJRyxcbiAgICAgIC4uLmdldENvbmZpZygpLnBhY2tldFxuICAgIH0pO1xuICAgIGlmIChjb25maWcuc2hvd0JpdHMpIHtcbiAgICAgIGNvbmZpZy5wYWRkaW5nWSArPSAxMDtcbiAgICB9XG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfVxuICBnZXRQYWNrZXQoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFja2V0O1xuICB9XG4gIHB1c2hXb3JkKHdvcmQpIHtcbiAgICBpZiAod29yZC5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnBhY2tldC5wdXNoKHdvcmQpO1xuICAgIH1cbiAgfVxuICBjbGVhcigpIHtcbiAgICBjbGVhcigpO1xuICAgIHRoaXMucGFja2V0ID0gW107XG4gIH1cbn07XG5cbi8vIHNyYy9kaWFncmFtcy9wYWNrZXQvcGFyc2VyLnRzXG5pbXBvcnQgeyBwYXJzZSB9IGZyb20gXCJAbWVybWFpZC1qcy9wYXJzZXJcIjtcbnZhciBtYXhQYWNrZXRTaXplID0gMWU0O1xudmFyIHBvcHVsYXRlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoYXN0LCBkYikgPT4ge1xuICBwb3B1bGF0ZUNvbW1vbkRiKGFzdCwgZGIpO1xuICBsZXQgbGFzdEJpdCA9IC0xO1xuICBsZXQgd29yZCA9IFtdO1xuICBsZXQgcm93ID0gMTtcbiAgY29uc3QgeyBiaXRzUGVyUm93IH0gPSBkYi5nZXRDb25maWcoKTtcbiAgZm9yIChsZXQgeyBzdGFydCwgZW5kLCBiaXRzLCBsYWJlbCB9IG9mIGFzdC5ibG9ja3MpIHtcbiAgICBpZiAoc3RhcnQgIT09IHZvaWQgMCAmJiBlbmQgIT09IHZvaWQgMCAmJiBlbmQgPCBzdGFydCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBQYWNrZXQgYmxvY2sgJHtzdGFydH0gLSAke2VuZH0gaXMgaW52YWxpZC4gRW5kIG11c3QgYmUgZ3JlYXRlciB0aGFuIHN0YXJ0LmApO1xuICAgIH1cbiAgICBzdGFydCA/Pz0gbGFzdEJpdCArIDE7XG4gICAgaWYgKHN0YXJ0ICE9PSBsYXN0Qml0ICsgMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgUGFja2V0IGJsb2NrICR7c3RhcnR9IC0gJHtlbmQgPz8gc3RhcnR9IGlzIG5vdCBjb250aWd1b3VzLiBJdCBzaG91bGQgc3RhcnQgZnJvbSAke2xhc3RCaXQgKyAxfS5gXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoYml0cyA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBQYWNrZXQgYmxvY2sgJHtzdGFydH0gaXMgaW52YWxpZC4gQ2Fubm90IGhhdmUgYSB6ZXJvIGJpdCBmaWVsZC5gKTtcbiAgICB9XG4gICAgZW5kID8/PSBzdGFydCArIChiaXRzID8/IDEpIC0gMTtcbiAgICBiaXRzID8/PSBlbmQgLSBzdGFydCArIDE7XG4gICAgbGFzdEJpdCA9IGVuZDtcbiAgICBsb2cuZGVidWcoYFBhY2tldCBibG9jayAke3N0YXJ0fSAtICR7bGFzdEJpdH0gd2l0aCBsYWJlbCAke2xhYmVsfWApO1xuICAgIHdoaWxlICh3b3JkLmxlbmd0aCA8PSBiaXRzUGVyUm93ICsgMSAmJiBkYi5nZXRQYWNrZXQoKS5sZW5ndGggPCBtYXhQYWNrZXRTaXplKSB7XG4gICAgICBjb25zdCBbYmxvY2ssIG5leHRCbG9ja10gPSBnZXROZXh0Rml0dGluZ0Jsb2NrKHsgc3RhcnQsIGVuZCwgYml0cywgbGFiZWwgfSwgcm93LCBiaXRzUGVyUm93KTtcbiAgICAgIHdvcmQucHVzaChibG9jayk7XG4gICAgICBpZiAoYmxvY2suZW5kICsgMSA9PT0gcm93ICogYml0c1BlclJvdykge1xuICAgICAgICBkYi5wdXNoV29yZCh3b3JkKTtcbiAgICAgICAgd29yZCA9IFtdO1xuICAgICAgICByb3crKztcbiAgICAgIH1cbiAgICAgIGlmICghbmV4dEJsb2NrKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgKHsgc3RhcnQsIGVuZCwgYml0cywgbGFiZWwgfSA9IG5leHRCbG9jayk7XG4gICAgfVxuICB9XG4gIGRiLnB1c2hXb3JkKHdvcmQpO1xufSwgXCJwb3B1bGF0ZVwiKTtcbnZhciBnZXROZXh0Rml0dGluZ0Jsb2NrID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoYmxvY2ssIHJvdywgYml0c1BlclJvdykgPT4ge1xuICBpZiAoYmxvY2suc3RhcnQgPT09IHZvaWQgMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcInN0YXJ0IHNob3VsZCBoYXZlIGJlZW4gc2V0IGR1cmluZyBmaXJzdCBwaGFzZVwiKTtcbiAgfVxuICBpZiAoYmxvY2suZW5kID09PSB2b2lkIDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJlbmQgc2hvdWxkIGhhdmUgYmVlbiBzZXQgZHVyaW5nIGZpcnN0IHBoYXNlXCIpO1xuICB9XG4gIGlmIChibG9jay5zdGFydCA+IGJsb2NrLmVuZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQmxvY2sgc3RhcnQgJHtibG9jay5zdGFydH0gaXMgZ3JlYXRlciB0aGFuIGJsb2NrIGVuZCAke2Jsb2NrLmVuZH0uYCk7XG4gIH1cbiAgaWYgKGJsb2NrLmVuZCArIDEgPD0gcm93ICogYml0c1BlclJvdykge1xuICAgIHJldHVybiBbYmxvY2ssIHZvaWQgMF07XG4gIH1cbiAgY29uc3Qgcm93RW5kID0gcm93ICogYml0c1BlclJvdyAtIDE7XG4gIGNvbnN0IHJvd1N0YXJ0ID0gcm93ICogYml0c1BlclJvdztcbiAgcmV0dXJuIFtcbiAgICB7XG4gICAgICBzdGFydDogYmxvY2suc3RhcnQsXG4gICAgICBlbmQ6IHJvd0VuZCxcbiAgICAgIGxhYmVsOiBibG9jay5sYWJlbCxcbiAgICAgIGJpdHM6IHJvd0VuZCAtIGJsb2NrLnN0YXJ0XG4gICAgfSxcbiAgICB7XG4gICAgICBzdGFydDogcm93U3RhcnQsXG4gICAgICBlbmQ6IGJsb2NrLmVuZCxcbiAgICAgIGxhYmVsOiBibG9jay5sYWJlbCxcbiAgICAgIGJpdHM6IGJsb2NrLmVuZCAtIHJvd1N0YXJ0XG4gICAgfVxuICBdO1xufSwgXCJnZXROZXh0Rml0dGluZ0Jsb2NrXCIpO1xudmFyIHBhcnNlciA9IHtcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIFBhY2tldERCIGlzIG5vdCBhc3NpZ25hYmxlIHRvIERpYWdyYW1EQlxuICBwYXJzZXI6IHsgeXk6IHZvaWQgMCB9LFxuICBwYXJzZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAoaW5wdXQpID0+IHtcbiAgICBjb25zdCBhc3QgPSBhd2FpdCBwYXJzZShcInBhY2tldFwiLCBpbnB1dCk7XG4gICAgY29uc3QgZGIgPSBwYXJzZXIucGFyc2VyPy55eTtcbiAgICBpZiAoIShkYiBpbnN0YW5jZW9mIFBhY2tldERCKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBcInBhcnNlci5wYXJzZXI/Lnl5IHdhcyBub3QgYSBQYWNrZXREQi4gVGhpcyBpcyBkdWUgdG8gYSBidWcgd2l0aGluIE1lcm1haWQsIHBsZWFzZSByZXBvcnQgdGhpcyBpc3N1ZSBhdCBodHRwczovL2dpdGh1Yi5jb20vbWVybWFpZC1qcy9tZXJtYWlkL2lzc3Vlcy5cIlxuICAgICAgKTtcbiAgICB9XG4gICAgbG9nLmRlYnVnKGFzdCk7XG4gICAgcG9wdWxhdGUoYXN0LCBkYik7XG4gIH0sIFwicGFyc2VcIilcbn07XG5cbi8vIHNyYy9kaWFncmFtcy9wYWNrZXQvcmVuZGVyZXIudHNcbnZhciBkcmF3ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoX3RleHQsIGlkLCBfdmVyc2lvbiwgZGlhZ3JhbTIpID0+IHtcbiAgY29uc3QgZGIgPSBkaWFncmFtMi5kYjtcbiAgY29uc3QgY29uZmlnID0gZGIuZ2V0Q29uZmlnKCk7XG4gIGNvbnN0IHsgcm93SGVpZ2h0LCBwYWRkaW5nWSwgYml0V2lkdGgsIGJpdHNQZXJSb3cgfSA9IGNvbmZpZztcbiAgY29uc3Qgd29yZHMgPSBkYi5nZXRQYWNrZXQoKTtcbiAgY29uc3QgdGl0bGUgPSBkYi5nZXREaWFncmFtVGl0bGUoKTtcbiAgY29uc3QgdG90YWxSb3dIZWlnaHQgPSByb3dIZWlnaHQgKyBwYWRkaW5nWTtcbiAgY29uc3Qgc3ZnSGVpZ2h0ID0gdG90YWxSb3dIZWlnaHQgKiAod29yZHMubGVuZ3RoICsgMSkgLSAodGl0bGUgPyAwIDogcm93SGVpZ2h0KTtcbiAgY29uc3Qgc3ZnV2lkdGggPSBiaXRXaWR0aCAqIGJpdHNQZXJSb3cgKyAyO1xuICBjb25zdCBzdmcgPSBzZWxlY3RTdmdFbGVtZW50KGlkKTtcbiAgc3ZnLmF0dHIoXCJ2aWV3Qm94XCIsIGAwIDAgJHtzdmdXaWR0aH0gJHtzdmdIZWlnaHR9YCk7XG4gIGNvbmZpZ3VyZVN2Z1NpemUoc3ZnLCBzdmdIZWlnaHQsIHN2Z1dpZHRoLCBjb25maWcudXNlTWF4V2lkdGgpO1xuICBmb3IgKGNvbnN0IFt3b3JkLCBwYWNrZXRdIG9mIHdvcmRzLmVudHJpZXMoKSkge1xuICAgIGRyYXdXb3JkKHN2ZywgcGFja2V0LCB3b3JkLCBjb25maWcpO1xuICB9XG4gIHN2Zy5hcHBlbmQoXCJ0ZXh0XCIpLnRleHQodGl0bGUpLmF0dHIoXCJ4XCIsIHN2Z1dpZHRoIC8gMikuYXR0cihcInlcIiwgc3ZnSGVpZ2h0IC0gdG90YWxSb3dIZWlnaHQgLyAyKS5hdHRyKFwiZG9taW5hbnQtYmFzZWxpbmVcIiwgXCJtaWRkbGVcIikuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpLmF0dHIoXCJjbGFzc1wiLCBcInBhY2tldFRpdGxlXCIpO1xufSwgXCJkcmF3XCIpO1xudmFyIGRyYXdXb3JkID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoc3ZnLCB3b3JkLCByb3dOdW1iZXIsIHsgcm93SGVpZ2h0LCBwYWRkaW5nWCwgcGFkZGluZ1ksIGJpdFdpZHRoLCBiaXRzUGVyUm93LCBzaG93Qml0cyB9KSA9PiB7XG4gIGNvbnN0IGdyb3VwID0gc3ZnLmFwcGVuZChcImdcIik7XG4gIGNvbnN0IHdvcmRZID0gcm93TnVtYmVyICogKHJvd0hlaWdodCArIHBhZGRpbmdZKSArIHBhZGRpbmdZO1xuICBmb3IgKGNvbnN0IGJsb2NrIG9mIHdvcmQpIHtcbiAgICBjb25zdCBibG9ja1ggPSBibG9jay5zdGFydCAlIGJpdHNQZXJSb3cgKiBiaXRXaWR0aCArIDE7XG4gICAgY29uc3Qgd2lkdGggPSAoYmxvY2suZW5kIC0gYmxvY2suc3RhcnQgKyAxKSAqIGJpdFdpZHRoIC0gcGFkZGluZ1g7XG4gICAgZ3JvdXAuYXBwZW5kKFwicmVjdFwiKS5hdHRyKFwieFwiLCBibG9ja1gpLmF0dHIoXCJ5XCIsIHdvcmRZKS5hdHRyKFwid2lkdGhcIiwgd2lkdGgpLmF0dHIoXCJoZWlnaHRcIiwgcm93SGVpZ2h0KS5hdHRyKFwiY2xhc3NcIiwgXCJwYWNrZXRCbG9ja1wiKTtcbiAgICBncm91cC5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJ4XCIsIGJsb2NrWCArIHdpZHRoIC8gMikuYXR0cihcInlcIiwgd29yZFkgKyByb3dIZWlnaHQgLyAyKS5hdHRyKFwiY2xhc3NcIiwgXCJwYWNrZXRMYWJlbFwiKS5hdHRyKFwiZG9taW5hbnQtYmFzZWxpbmVcIiwgXCJtaWRkbGVcIikuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpLnRleHQoYmxvY2subGFiZWwpO1xuICAgIGlmICghc2hvd0JpdHMpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBjb25zdCBpc1NpbmdsZUJsb2NrID0gYmxvY2suZW5kID09PSBibG9jay5zdGFydDtcbiAgICBjb25zdCBiaXROdW1iZXJZID0gd29yZFkgLSAyO1xuICAgIGdyb3VwLmFwcGVuZChcInRleHRcIikuYXR0cihcInhcIiwgYmxvY2tYICsgKGlzU2luZ2xlQmxvY2sgPyB3aWR0aCAvIDIgOiAwKSkuYXR0cihcInlcIiwgYml0TnVtYmVyWSkuYXR0cihcImNsYXNzXCIsIFwicGFja2V0Qnl0ZSBzdGFydFwiKS5hdHRyKFwiZG9taW5hbnQtYmFzZWxpbmVcIiwgXCJhdXRvXCIpLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLCBpc1NpbmdsZUJsb2NrID8gXCJtaWRkbGVcIiA6IFwic3RhcnRcIikudGV4dChibG9jay5zdGFydCk7XG4gICAgaWYgKCFpc1NpbmdsZUJsb2NrKSB7XG4gICAgICBncm91cC5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJ4XCIsIGJsb2NrWCArIHdpZHRoKS5hdHRyKFwieVwiLCBiaXROdW1iZXJZKS5hdHRyKFwiY2xhc3NcIiwgXCJwYWNrZXRCeXRlIGVuZFwiKS5hdHRyKFwiZG9taW5hbnQtYmFzZWxpbmVcIiwgXCJhdXRvXCIpLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLCBcImVuZFwiKS50ZXh0KGJsb2NrLmVuZCk7XG4gICAgfVxuICB9XG59LCBcImRyYXdXb3JkXCIpO1xudmFyIHJlbmRlcmVyID0geyBkcmF3IH07XG5cbi8vIHNyYy9kaWFncmFtcy9wYWNrZXQvc3R5bGVzLnRzXG52YXIgZGVmYXVsdFBhY2tldFN0eWxlT3B0aW9ucyA9IHtcbiAgYnl0ZUZvbnRTaXplOiBcIjEwcHhcIixcbiAgc3RhcnRCeXRlQ29sb3I6IFwiYmxhY2tcIixcbiAgZW5kQnl0ZUNvbG9yOiBcImJsYWNrXCIsXG4gIGxhYmVsQ29sb3I6IFwiYmxhY2tcIixcbiAgbGFiZWxGb250U2l6ZTogXCIxMnB4XCIsXG4gIHRpdGxlQ29sb3I6IFwiYmxhY2tcIixcbiAgdGl0bGVGb250U2l6ZTogXCIxNHB4XCIsXG4gIGJsb2NrU3Ryb2tlQ29sb3I6IFwiYmxhY2tcIixcbiAgYmxvY2tTdHJva2VXaWR0aDogXCIxXCIsXG4gIGJsb2NrRmlsbENvbG9yOiBcIiNlZmVmZWZcIlxufTtcbnZhciBzdHlsZXMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCh7IHBhY2tldCB9ID0ge30pID0+IHtcbiAgY29uc3Qgb3B0aW9ucyA9IGNsZWFuQW5kTWVyZ2UoZGVmYXVsdFBhY2tldFN0eWxlT3B0aW9ucywgcGFja2V0KTtcbiAgcmV0dXJuIGBcblx0LnBhY2tldEJ5dGUge1xuXHRcdGZvbnQtc2l6ZTogJHtvcHRpb25zLmJ5dGVGb250U2l6ZX07XG5cdH1cblx0LnBhY2tldEJ5dGUuc3RhcnQge1xuXHRcdGZpbGw6ICR7b3B0aW9ucy5zdGFydEJ5dGVDb2xvcn07XG5cdH1cblx0LnBhY2tldEJ5dGUuZW5kIHtcblx0XHRmaWxsOiAke29wdGlvbnMuZW5kQnl0ZUNvbG9yfTtcblx0fVxuXHQucGFja2V0TGFiZWwge1xuXHRcdGZpbGw6ICR7b3B0aW9ucy5sYWJlbENvbG9yfTtcblx0XHRmb250LXNpemU6ICR7b3B0aW9ucy5sYWJlbEZvbnRTaXplfTtcblx0fVxuXHQucGFja2V0VGl0bGUge1xuXHRcdGZpbGw6ICR7b3B0aW9ucy50aXRsZUNvbG9yfTtcblx0XHRmb250LXNpemU6ICR7b3B0aW9ucy50aXRsZUZvbnRTaXplfTtcblx0fVxuXHQucGFja2V0QmxvY2sge1xuXHRcdHN0cm9rZTogJHtvcHRpb25zLmJsb2NrU3Ryb2tlQ29sb3J9O1xuXHRcdHN0cm9rZS13aWR0aDogJHtvcHRpb25zLmJsb2NrU3Ryb2tlV2lkdGh9O1xuXHRcdGZpbGw6ICR7b3B0aW9ucy5ibG9ja0ZpbGxDb2xvcn07XG5cdH1cblx0YDtcbn0sIFwic3R5bGVzXCIpO1xuXG4vLyBzcmMvZGlhZ3JhbXMvcGFja2V0L2RpYWdyYW0udHNcbnZhciBkaWFncmFtID0ge1xuICBwYXJzZXIsXG4gIGdldCBkYigpIHtcbiAgICByZXR1cm4gbmV3IFBhY2tldERCKCk7XG4gIH0sXG4gIHJlbmRlcmVyLFxuICBzdHlsZXNcbn07XG5leHBvcnQge1xuICBkaWFncmFtXG59O1xuIgogIF0s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QUFDYixJQUFJLFdBQVcsRUFBRSxLQUFLO0FBR3RCLElBQUksNEJBQTRCO0FBQUEsRUFDOUIsY0FBYztBQUFBLEVBQ2QsZ0JBQWdCO0FBQUEsRUFDaEIsY0FBYztBQUFBLEVBQ2QsWUFBWTtBQUFBLEVBQ1osZUFBZTtBQUFBLEVBQ2YsWUFBWTtBQUFBLEVBQ1osZUFBZTtBQUFBLEVBQ2Ysa0JBQWtCO0FBQUEsRUFDbEIsa0JBQWtCO0FBQUEsRUFDbEIsZ0JBQWdCO0FBQ2xCO0FBQ0EsSUFBSSx5QkFBeUIsT0FBTyxHQUFHLFdBQVcsQ0FBQyxNQUFNO0FBQUEsRUFDdkQsTUFBTSxVQUFVLGNBQWMsMkJBQTJCLE1BQU07QUFBQSxFQUMvRCxPQUFPO0FBQUE7QUFBQSxlQUVNLFFBQVE7QUFBQTtBQUFBO0FBQUEsVUFHYixRQUFRO0FBQUE7QUFBQTtBQUFBLFVBR1IsUUFBUTtBQUFBO0FBQUE7QUFBQSxVQUdSLFFBQVE7QUFBQSxlQUNILFFBQVE7QUFBQTtBQUFBO0FBQUEsVUFHYixRQUFRO0FBQUEsZUFDSCxRQUFRO0FBQUE7QUFBQTtBQUFBLFlBR1gsUUFBUTtBQUFBLGtCQUNGLFFBQVE7QUFBQSxVQUNoQixRQUFRO0FBQUE7QUFBQTtBQUFBLEdBR2YsUUFBUTtBQUdYLElBQUksVUFBVTtBQUFBLEVBQ1o7QUFBQSxNQUNJLEVBQUUsR0FBRztBQUFBLElBQ1AsT0FBTyxJQUFJO0FBQUE7QUFBQSxFQUViO0FBQUEsRUFDQTtBQUNGOyIsCiAgImRlYnVnSWQiOiAiODNDMDdBQTNCQUU1MERBRTY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
