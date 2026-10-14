import mongoose from "mongoose";

const DEFAULT_OPTIONS = {
  versionKey: false,
  minimize: false,
};

/**
 * defineModel("User", { userID: { type: String, required: true } }, { collection: "user-datas" })
 *
 * - `collection` is required so renaming a model never silently creates a new collection
 * - `indexes`: array of [fields, options] passed to schema.index()
 * - `statics` / `methods`: attached to the schema
 * - every model gets `findOrCreate(filter, defaults)`
 */
export function defineModel(name, definition, options = {}) {
  const { collection, indexes = [], statics = {}, methods = {}, timestamps = false, strict = true, ...rest } = options;
  if (!collection) {throw new Error(`defineModel(${name}): "collection" is required`);}

  if (mongoose.models[name]) {return mongoose.models[name];}

  const schema = new mongoose.Schema(definition, { ...DEFAULT_OPTIONS, collection, timestamps, strict, ...rest });

  for (const [fields, idxOptions] of indexes) {
    schema.index(fields, idxOptions);
  }

  schema.statics.findOrCreate = async function (filter, defaults = {}) {
    const existing = await this.findOne(filter);
    if (existing) {return existing;}
    return this.create({ ...filter, ...defaults });
  };

  Object.assign(schema.statics, statics);
  Object.assign(schema.methods, methods);

  return mongoose.model(name, schema);
}

export const Types = mongoose.Schema.Types;
