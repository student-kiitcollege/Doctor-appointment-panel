import express from 'express';
import { loginAdmin, appointmentsAdmin, appointmentCancel, addDoctor, allDoctors, adminDashboard } from '../controllers/adminController.js';
import { changeAvailablity } from '../controllers/doctorController.js';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';
const adminRouter = express.Router();

adminRouter.post("/login", loginAdmin)
adminRouter.post("/add-doctor", upload.single('image'), addDoctor)
adminRouter.get("/appointments", appointmentsAdmin)
adminRouter.post("/cancel-appointment",  appointmentCancel)
adminRouter.get("/all-doctors", allDoctors)
adminRouter.post("/change-availability", changeAvailablity)
adminRouter.get("/dashboard", adminDashboard)

export default adminRouter;