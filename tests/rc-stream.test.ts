import { describe, it, vi, expect } from "vitest";
import { createReadStream } from "node:fs";
import { resolve, join } from "node:path";
import { CrossfireParser, FRAME_TYPE, getFrameVariant, CrossfireFrameVariant } from "../src";

describe("rc-stream", () => {
  const rcStreamDataPath = resolve(join(__dirname, "rc-stream.bin"));

  it("should parse rc-stream data", async () => {
    const rcStream = createReadStream(rcStreamDataPath);

    const gotRCChannelsPacked = vi.fn();
    const gotLinkStatistics = vi.fn();

    const frameVariants: CrossfireFrameVariant[] = [];
    const frameVariantsSet = new Set<string>();

    let messagesCount = 0;

    const parser = new CrossfireParser(frame => {
      messagesCount++;

      const variant = getFrameVariant(frame);

      frameVariants.push(variant);
      frameVariantsSet.add(variant.constructor.name);

      switch (variant.frameType) {
        case FRAME_TYPE.RC_CHANNELS_PACKED:
          gotRCChannelsPacked(variant);
          break;
        case FRAME_TYPE.LINK_STATISTICS:
          gotLinkStatistics(variant);
          break;
      }
    });

    rcStream.on("data", (chunk: Buffer) => parser.appendChunk(chunk));

    await new Promise<void>(r => rcStream.on("end", r));

    expect(gotRCChannelsPacked).toHaveBeenCalled();
    expect(gotLinkStatistics).toHaveBeenCalled();
    expect(messagesCount).toBe(3717);
  });
});
