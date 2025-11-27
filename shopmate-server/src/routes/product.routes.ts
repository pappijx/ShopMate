import { Router } from "express";
import * as productController from "../controller/product.controller";
import { requireAuth, requireSeller } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { validate } from "../middleware/validate";
import {
  createProductSchema,
  updateProductSchema,
  getProductSchema,
  searchProductSchema,
} from "../validators/product.validator";

const router = Router();

// Seller routes
router.post(
  "/",
  requireAuth,
  requireSeller,
  upload.single("image"),
  validate(createProductSchema),
  productController.create
);

router.put(
  "/:id",
  requireAuth,
  requireSeller,
  upload.single("image"),
  validate(updateProductSchema),
  productController.update
);

router.delete(
  "/:id",
  requireAuth,
  requireSeller,
  validate(getProductSchema),
  productController.deleteProduct
);

// Public routes
router.get("/", validate(searchProductSchema), productController.search);
router.get("/compare", productController.compareBySubcategory);
router.get("/business/:businessId", productController.getByBusiness);
router.get("/:id", validate(getProductSchema), productController.getById);

export default router;
