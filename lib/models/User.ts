import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  username: string;
  usernameLower: string;
  name?: string;
  nameLower?: string;
  passwordHash: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 32,
    },
    usernameLower: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    nameLower: {
      type: String,
      index: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.pre("validate", function () {
  if (!this.username && this.email) {
    const localPart = this.email.split("@")[0] || "user";
    const sanitized = localPart.replace(/[^a-zA-Z0-9._-]/g, "");
    this.username = sanitized.length >= 3 ? sanitized : `user${sanitized}`;
  }

  this.usernameLower = String(this.username || "").toLowerCase().trim();
  this.nameLower = this.name ? String(this.name).toLowerCase().trim() : undefined;
});

export default mongoose.models.User || mongoose.model<IUser>("User", userSchema);
