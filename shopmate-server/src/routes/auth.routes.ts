import { Router } from "express";
import * as authController from "../controller/auth.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { signupSchema, loginSchema, chooseRoleSchema } from "../validators/auth.validator";

const router = Router();

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.post("/choose-role", requireAuth, validate(chooseRoleSchema), authController.chooseRole);
router.get("/me", requireAuth, authController.me);

export default router;
