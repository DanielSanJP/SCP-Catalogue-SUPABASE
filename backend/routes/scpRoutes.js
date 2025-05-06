import express from "express";
import {
  getAllSubjects,
  getSubjectByItem,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/scpController.js";

const router = express.Router();

router.get("/", getAllSubjects);
router.get("/:item", getSubjectByItem);
router.post("/", createSubject);
router.put("/:item", updateSubject);
router.delete("/:item", deleteSubject);

export default router;
