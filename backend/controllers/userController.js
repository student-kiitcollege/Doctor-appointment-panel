import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { v2 as cloudinary } from "cloudinary";
import stripePackage from "stripe";

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);

// Register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.json({ success: false, message: "Missing Details" });

    if (!validator.isEmail(email))
      return res.json({ success: false, message: "Enter a valid email" });

    if (password.length < 8)
      return res.json({ success: false, message: "Password too short" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userData = await userModel.findById(req.userId).select("-password");
    res.json({ success: true, userData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender)
      return res.json({ success: false, message: "Missing profile fields" });

    const updateData = {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender
    };

    if (imageFile) {
      const upload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
      updateData.image = upload.secure_url;
    }

    await userModel.findByIdAndUpdate(req.userId, updateData);

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Book appointment
const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;

    if (!docId || !slotDate || !slotTime)
      return res.json({ success: false, message: "Missing appointment data" });

    const doctor = await doctorModel.findById(docId).select("-password");
    const user = await userModel.findById(req.userId).select("-password");

    if (!doctor.available)
      return res.json({ success: false, message: "Doctor not available" });

    const slots = doctor.slots_booked;
    if (slots[slotDate]?.includes(slotTime))
      return res.json({ success: false, message: "Slot already booked" });

    slots[slotDate] = [...(slots[slotDate] || []), slotTime];

    const appointment = await appointmentModel.create({
      userId: user._id.toString(),
      docId: doctor._id.toString(),
      slotDate,
      slotTime,
      userData: user,
      docData: doctor,
      amount: doctor.fees,
      date: Date.now()
    });

    await doctorModel.findByIdAndUpdate(docId, { slots_booked: slots });

    res.json({ success: true, message: "Appointment Booked", appointment });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// List appointments
const listAppointment = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({ userId: req.userId });
    res.json({ success: true, appointments });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment || appointment.userId !== req.userId)
      return res.json({ success: false, message: "Unauthorized" });

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    const doctor = await doctorModel.findById(appointment.docId);
    const updatedSlots = doctor.slots_booked[appointment.slotDate].filter(
      time => time !== appointment.slotTime
    );

    doctor.slots_booked[appointment.slotDate] = updatedSlots;
    await doctor.save();

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Stripe payment
const paymentStripe = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const origin = req.headers.origin;

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment || appointment.cancelled)
      return res.json({ success: false, message: "Invalid or cancelled appointment" });

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&appointmentId=${appointmentId}`,
      cancel_url: `${origin}/verify?success=false&appointmentId=${appointmentId}`,
      line_items: [
        {
          price_data: {
            currency: process.env.CURRENCY.toLowerCase(),
            product_data: { name: "Appointment Fees" },
            unit_amount: appointment.amount * 100
          },
          quantity: 1
        }
      ],
      mode: "payment"
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Verify Stripe payment
const verifyStripe = async (req, res) => {
  try {
    const { appointmentId, success } = req.body;

    if (success === "true") {
      await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true });
      return res.json({ success: true, message: "Payment Successful" });
    }

    res.json({ success: false, message: "Payment Failed" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentStripe,
  verifyStripe
};
