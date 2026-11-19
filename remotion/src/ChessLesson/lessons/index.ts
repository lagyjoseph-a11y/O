import { Lesson } from "../types";
import { blackmar } from "./blackmar";
import { roi } from "./roi";
import { soller } from "./soller";

export const LESSONS: Record<string, Lesson> = { blackmar, roi, soller };
