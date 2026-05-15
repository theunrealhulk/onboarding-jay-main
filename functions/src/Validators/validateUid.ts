import { z } from "zod";

const UidPairSchema = z
  .object({
    uid: z.string().min(21),
    guid: z.string().min(21),
  })
  .refine((data) => data.uid === data.guid, {
    message: "user IDs do not match",
  });

export default function validateUid(uid: string, guid: string): boolean {
  if (!uid || !guid) {
    console.log(`Falsy values uid: ${uid} guid ${guid}`);
    return false;
  }
  const result = UidPairSchema.safeParse({ uid, guid });
  console.assert(result.success, "user IDs do not match");
  return result.success;
}
