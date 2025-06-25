import * as z from "zod/v4";

export const Uid = z.coerce.number().min(1);
