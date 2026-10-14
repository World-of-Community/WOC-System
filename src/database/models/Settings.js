import { defineModel } from "../defineModel.js";

// One document per settings group (_id = group name), fields are the keys.
// Definitions and defaults live in src/config/settings.schema.js.
export default defineModel("Settings", {
  _id: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String, default: null },
}, { collection: "settings", strict: false });
