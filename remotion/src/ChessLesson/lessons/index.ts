import { Lesson } from "../types";
import { blackmar } from "./blackmar";
import { roi } from "./roi";
import { soller } from "./soller";
import { tennison } from "./tennison";

export const LESSONS: Record<string, Lesson> = { blackmar, roi, soller, tennison };
