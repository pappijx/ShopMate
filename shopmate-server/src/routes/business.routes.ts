import { Router } from "express";
import * as businessController from "../controller/business.controller";
import { requireAuth, requireSeller } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { validate } from "../middleware/validate";
import { createBusinessSchema, updateBusinessSchema, getBusinessSchema } from "../validators/business.validator";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireSeller,
  upload.single("logo"),
  validate(createBusinessSchema),
  businessController.create
);

router.get("/", requireAuth, requireSeller, businessController.getMyBusinesses);

router.get("/:id", requireAuth, validate(getBusinessSchema), businessController.getById);

router.put(
  "/:id",
  requireAuth,
  requireSeller,
  upload.single("logo"),
  validate(updateBusinessSchema),
  businessController.update
);

router.delete(
  "/:id",
  requireAuth,
  requireSeller,
  validate(getBusinessSchema),
  businessController.deleteBusiness
);

export default router;
