import { Router } from "express";
import * as categoryController from "../controller/category.controller";

const router = Router();

router.get("/", categoryController.getAll);
router.get("/:slug/subcategories", categoryController.getSubcategories);

export default router;
