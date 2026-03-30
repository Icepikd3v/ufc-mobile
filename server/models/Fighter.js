const mongoose = require("mongoose");

const fighterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    region: { type: String, required: true, trim: true },
    league: { type: String, required: true, trim: true },
    externalId: { type: String, default: "", trim: true },
    source: { type: String, default: "manual", trim: true },
    record: {
      wins: { type: Number, required: true, min: 0 },
      losses: { type: Number, required: true, min: 0 },
    },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fighter", fighterSchema);
