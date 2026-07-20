import Joi from "joi";
export const answerSchema = Joi.object({ userId: Joi.string().hex().length(24).required(), quizId: Joi.string().hex().length(24).required(), questionIndex: Joi.number().integer().min(0).required(), selectedAnswerIndex: Joi.number().integer().min(0).max(3).required() });
