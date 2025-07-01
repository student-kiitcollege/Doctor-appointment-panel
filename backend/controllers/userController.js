import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { v2 as cloudinary } from "cloudinary";
import stripe from "stripe";

const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

// API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing details" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already registered with this email" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save new user
    const newUser = new userModel({ name, email, password: hashedPassword });
    const savedUser = await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET);

    // Respond with success
    res.status(201).json({
      success: true,
      token,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// API to login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// API to get user profile data (protected route)
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId; // From auth middleware

    const userData = await userModel.findById(userId).select("-password");
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, userData });
  } catch (error) {
    console.error("Get Profile Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// API to update user profile (protected route)
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId; // From auth middleware
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.status(400).json({ success: false, message: "Data Missing" });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: address ? JSON.parse(address) : {},
      dob,
      gender,
    });

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
      await userModel.findByIdAndUpdate(userId, { image: imageUpload.secure_url });
    }

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.error("Update Profile Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// API to book appointment (protected route)
const bookAppointment = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId; // From auth middleware
    const { docId, slotDate, slotTime } = req.body;

    if (!docId || !slotDate || !slotTime) {
      return res.status(400).json({ success: false, message: "Missing appointment details" });
    }

    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData || !docData.available) {
      return res.status(404).json({ success: false, message: "Doctor not available" });
    }

    let slots_booked = docData.slots_booked || {};

    if (slots_booked[slotDate]?.includes(slotTime)) {
      return res.status(409).json({ success: false, message: "Slot Not Available" });
    }

    slots_booked[slotDate] = slots_booked[slotDate] || [];
    slots_booked[slotDate].push(slotTime);

    const user = await userModel.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };

    const filteredDocData = {
      _id: docData._id,
      name: docData.name,
      specialization: docData.specialization,
      fees: docData.fees,
    };

    const appointmentData = {
      userId,
      docId,
      userData,
      docData: filteredDocData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: new Date(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Booked" });
  } catch (error) {
    console.error("Book Appointment Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// API to cancel appointment (protected route)
const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId; // From auth middleware
    const { appointmentId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment || appointment.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized action or Appointment not found" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    const { docId, slotDate, slotTime } = appointment;
    const doctorData = await doctorModel.findById(docId);
    let slots_booked = doctorData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter((e) => e !== slotTime);
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.error("Cancel Appointment Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// API to list user's appointments (protected route)
const listAppointment = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId; // From auth middleware

    const appointments = await appointmentModel.find({ userId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.error("List Appointment Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Razorpay payment - keep your implementation here
// Stripe payment - keep your implementation here

// (Omitted payment functions here for brevity, but keep them same as your current code)

export {
  loginUser,
  registerUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  // ... your other exports for payment
};
