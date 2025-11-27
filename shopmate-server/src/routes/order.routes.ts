import { Router } from "express";
import * as orderController from "../controller/order.controller";
import { requireAuth, requireBuyer, requireSeller } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createOrderSchema, updateOrderStatusSchema, getOrderSchema } from "../validators/order.validator";

const router = Router();

// Buyer routes
router.post("/", requireAuth, requireBuyer, validate(createOrderSchema), orderController.create);
router.get("/", requireAuth, requireBuyer, orderController.getMyOrders);

// Shared routes
router.get("/:id", requireAuth, validate(getOrderSchema), orderController.getById);

// Seller routes
router.get("/seller/orders", requireAuth, requireSeller, orderController.getSellerOrders);
router.put("/:id/status", requireAuth, requireSeller, validate(updateOrderStatusSchema), orderController.updateStatus);

export default router;
