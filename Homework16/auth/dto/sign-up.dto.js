const { z } = require("zod");

const signUpDto = z.object({
  fullName: z
    .string()
    .trim()
    .refine(
      (name) => name.split(/\s+/).length >= 2,
      "Full name must contain at least first and last name",
    ),
  email: z.email("Invalid email"),
  password: z.string().min(6, "password must be at least 6 characters"),
  birthDate: z.coerce.date("Invalid birth date"),
});

module.exports = { signUpDto };
