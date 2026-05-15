import * as sharp from "sharp";
import { defaultStorage } from "./defaultApp";
import { v4 as uuidv4 } from "uuid";

type ProcessImageUploadInput = {
    source: string;
    postId: string;
    authorName: string;
    projectId: string;
}

async function loadImageBytes(source: string): Promise<Buffer> {
    if (/^https?:\/\//i.test(source.trim())) {
      const res = await fetch(source.trim());
      if (!res.ok) {
        throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
      }
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }
    const [buffer] = await defaultStorage.file(source).download();
    return buffer;
  }

export default async function processImageUpload(input: ProcessImageUploadInput): Promise<string> {
    const { source, postId, authorName, projectId } = input;
    const imageBuffer = await loadImageBytes(source);
    const imageSharp = sharp(imageBuffer);
    const imageSharpResized = imageSharp.resize(100, 100);
    const imageSharpResizedBuffer = await imageSharpResized.toBuffer();
    const imageSharpResizedUrl = `https://firebasestorage.googleapis.com/v0/b/${projectId}.appspot.com/o/ModelPics/${uuidv4()}.jpg`;
    const safe = authorName.replace(/[^\w.-]+/g, "_");
const dest = `\blogImages/${safe}${postId}${Date.now()}.jpg`;
await defaultStorage.file(dest).save(imageSharpResizedBuffer, { contentType: "image/jpeg" });
    return imageSharpResizedUrl;
}