import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject, ZodTypeAny } from "zod";

type SchemaBundle = {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
};

export const validate =
  (schemas: SchemaBundle | ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
    const bundle: SchemaBundle = "safeParse" in schemas ? { body: schemas as AnyZodObject } : schemas;

    if (bundle.body) req.body = bundle.body.parse(req.body);
    if (bundle.query) req.query = bundle.query.parse(req.query) as typeof req.query;
    if (bundle.params) req.params = bundle.params.parse(req.params) as typeof req.params;

    next();
  };
