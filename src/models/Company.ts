import mongoose, { Schema } from "mongoose";
import { ICompany } from "@/types";

const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    logo: String,
    website: String,
    industry: {
      type: String,
      required: [true, "Industry is required"],
    },
    size: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"],
      default: "1-10",
    },
    description: String,
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

companySchema.index({ ownerId: 1 });
companySchema.index({ name: "text", industry: "text" });

const Company = mongoose.models.Company || mongoose.model<ICompany>("Company", companySchema);
export default Company;
