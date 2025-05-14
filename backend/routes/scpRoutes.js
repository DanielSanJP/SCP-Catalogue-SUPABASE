import express from "express";
import {
  getAllSubjects,
  getSubjectById,  // renamed from getSubjectByItem
  createSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/scpController.js";

const router = express.Router();

router.get("/", getAllSubjects);
router.get("/:id", getSubjectById);  // changed from /:item
router.post("/", createSubject);
router.put("/:id", updateSubject);  // changed from /:item
router.delete("/:id", deleteSubject);  // changed from /:item

export default router;
