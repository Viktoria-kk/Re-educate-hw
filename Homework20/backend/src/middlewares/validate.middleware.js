export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error)
    return res
      .status(400)
      .json({ message: error.details.map((item) => item.message).join(", ") });
  req.body = value;
  next();
};
