import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

const TEMPLATES_DIR = path.join(__dirname, "..", "templates");

const cache = new Map<string, Handlebars.TemplateDelegate>();

export function renderTemplate<T extends object = Record<string, unknown>>(
  fileName: string,
  data: T = {} as T 
): string {
  let compiled = cache.get(fileName);

  if (!compiled) {
    const filePath = path.join(TEMPLATES_DIR, fileName);
    const source = fs.readFileSync(filePath, "utf8");
    compiled = Handlebars.compile(source);
    cache.set(fileName, compiled);
  }

  return compiled(data);
}